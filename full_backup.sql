--
-- PostgreSQL database dump
--

\restrict XgWymBO9SGmeYprFApu3g02KussHzdFNP9xHosRd0UZLI2aPLTdWd1oDDxTyQJu

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(20),
    profile_image character varying(255) DEFAULT 'default-admin.png'::character varying,
    reset_token character varying(255),
    reset_token_expiry timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admins_id_seq OWNER TO postgres;

--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    booking_number character varying(20) NOT NULL,
    user_id integer,
    guest_name character varying(100),
    guest_email character varying(150),
    guest_phone character varying(20),
    service_id integer,
    service_name character varying(200),
    from_address text,
    from_city character varying(100),
    from_state character varying(100),
    to_address text,
    to_city character varying(100),
    to_state character varying(100),
    move_date date NOT NULL,
    move_time character varying(20),
    property_type character varying(100),
    num_rooms integer,
    special_requirements text,
    estimated_budget character varying(100),
    status character varying(20) DEFAULT 'pending'::character varying,
    admin_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bookings_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: contact_queries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_queries (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    phone character varying(20),
    subject character varying(300),
    message text NOT NULL,
    is_read boolean DEFAULT false,
    admin_reply text,
    replied_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.contact_queries OWNER TO postgres;

--
-- Name: contact_queries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_queries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_queries_id_seq OWNER TO postgres;

--
-- Name: contact_queries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_queries_id_seq OWNED BY public.contact_queries.id;


--
-- Name: distance_slabs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.distance_slabs (
    id integer NOT NULL,
    label character varying(100) NOT NULL,
    min_km integer NOT NULL,
    max_km integer,
    price_per_kg numeric(10,2) NOT NULL,
    base_charge numeric(10,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public.distance_slabs OWNER TO postgres;

--
-- Name: distance_slabs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.distance_slabs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.distance_slabs_id_seq OWNER TO postgres;

--
-- Name: distance_slabs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.distance_slabs_id_seq OWNED BY public.distance_slabs.id;


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_items (
    id integer NOT NULL,
    category_id integer,
    name character varying(100) NOT NULL,
    weight_kg numeric(8,2) NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0
);


ALTER TABLE public.inventory_items OWNER TO postgres;

--
-- Name: inventory_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_items_id_seq OWNER TO postgres;

--
-- Name: inventory_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_items_id_seq OWNED BY public.inventory_items.id;


--
-- Name: item_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    icon character varying(50) DEFAULT 'fa-box'::character varying,
    sort_order integer DEFAULT 0
);


ALTER TABLE public.item_categories OWNER TO postgres;

--
-- Name: item_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_categories_id_seq OWNER TO postgres;

--
-- Name: item_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_categories_id_seq OWNED BY public.item_categories.id;


--
-- Name: labour_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.labour_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value numeric(10,2) NOT NULL,
    label character varying(200)
);


ALTER TABLE public.labour_settings OWNER TO postgres;

--
-- Name: labour_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.labour_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.labour_settings_id_seq OWNER TO postgres;

--
-- Name: labour_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.labour_settings_id_seq OWNED BY public.labour_settings.id;


--
-- Name: pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages (
    id integer NOT NULL,
    page_key character varying(50) NOT NULL,
    title character varying(200),
    content text,
    meta_description character varying(500),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pages OWNER TO postgres;

--
-- Name: pages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pages_id_seq OWNER TO postgres;

--
-- Name: pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pages_id_seq OWNED BY public.pages.id;


--
-- Name: price_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_items (
    id integer NOT NULL,
    category character varying(100) NOT NULL,
    name character varying(200) NOT NULL,
    weight_kg numeric(10,2) DEFAULT 0 NOT NULL,
    base_price numeric(10,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.price_items OWNER TO postgres;

--
-- Name: price_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.price_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.price_items_id_seq OWNER TO postgres;

--
-- Name: price_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.price_items_id_seq OWNED BY public.price_items.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    short_description character varying(500),
    icon character varying(100) DEFAULT 'fas fa-box'::character varying,
    image character varying(255),
    price_range character varying(100),
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(20),
    address text,
    city character varying(100),
    state character varying(100),
    profile_image character varying(255) DEFAULT 'default-user.png'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    capacity_kg integer NOT NULL,
    base_fare numeric(10,2) NOT NULL,
    per_km_rate numeric(10,2) NOT NULL,
    per_kg_rate numeric(10,2) NOT NULL,
    image character varying(255) DEFAULT NULL::character varying,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicles_id_seq OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: contact_queries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_queries ALTER COLUMN id SET DEFAULT nextval('public.contact_queries_id_seq'::regclass);


--
-- Name: distance_slabs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.distance_slabs ALTER COLUMN id SET DEFAULT nextval('public.distance_slabs_id_seq'::regclass);


--
-- Name: inventory_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items ALTER COLUMN id SET DEFAULT nextval('public.inventory_items_id_seq'::regclass);


--
-- Name: item_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_categories ALTER COLUMN id SET DEFAULT nextval('public.item_categories_id_seq'::regclass);


--
-- Name: labour_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labour_settings ALTER COLUMN id SET DEFAULT nextval('public.labour_settings_id_seq'::regclass);


--
-- Name: pages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages ALTER COLUMN id SET DEFAULT nextval('public.pages_id_seq'::regclass);


--
-- Name: price_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_items ALTER COLUMN id SET DEFAULT nextval('public.price_items_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (id, name, email, password, phone, profile_image, reset_token, reset_token_expiry, created_at, updated_at) FROM stdin;
1	Super Admin	admin@moverspackersco.com	$2a$10$HigPzxrSjUXd2jNRc13OqOCP/k6dPc1JxGahBlp2XjLps/Tv5rBmq	+91-8975032310	default-admin.png	\N	\N	2026-02-21 10:22:43.428124	2026-02-24 11:03:40.842384
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, booking_number, user_id, guest_name, guest_email, guest_phone, service_id, service_name, from_address, from_city, from_state, to_address, to_city, to_state, move_date, move_time, property_type, num_rooms, special_requirements, estimated_budget, status, admin_notes, created_at, updated_at) FROM stdin;
2	BB616865393	\N	Ghanashyam Nilesh Auti	ghanashyam0810@gmail.com	+919322979345	\N	\N	Pune	Pune	\N	Wagholi	Wagholi	\N	2026-02-26	\N	\N	\N	Type: vehicle | Distance: 15km | Labour: 0 | Items: [] | Notes: 	₹2,237	pending	\N	2026-02-24 10:20:17.074226	2026-02-24 10:20:17.074226
3	BB655842061	\N	Ghanashyam Nilesh Auti	ghanashyam0810@gmail.com	+919322979345	\N	\N	Pune	Pune	\N	Wagholi	Wagholi	\N	2026-02-27	\N	\N	\N	Type: material | Distance: 15km | Labour: 1 | Items: [{"id":1,"qty":1,"name":"Single Sofa","weight":25},{"id":20,"qty":1,"name":"Refrigerator (Single Door)","weight":45},{"id":31,"qty":1,"name":"LED TV (32 inch)","weight":6},{"id":38,"qty":1,"name":"Gas Stove (2 burner)","weight":5},{"id":54,"qty":1,"name":"Small Almirah (Wooden)","weight":25}] | Notes: 	₹2,165	pending	\N	2026-02-24 10:20:56.03526	2026-02-24 10:20:56.03526
4	BB732183616	1	Ghanashyam Nilesh Auti	ghanashyam0810@gmail.com	+919322979345	\N	\N	Pune	Pune	\N	12	12	\N	2026-03-04	\N	\N	\N	Type: vehicle | Distance: 12km | Labour: 0 | Items: [] | Notes: 	₹2,260	approved		2026-02-24 10:22:12.364912	2026-02-24 10:22:53.273946
\.


--
-- Data for Name: contact_queries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_queries (id, name, email, phone, subject, message, is_read, admin_reply, replied_at, created_at) FROM stdin;
1	Ghanashyam Nilesh Auti	ghanashyam0810@gmail.com	+919322979345	Regarding Budget	Budget is too high	t	We will get back to you	2026-02-24 10:23:23.224403	2026-02-24 10:21:22.781653
\.


--
-- Data for Name: distance_slabs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.distance_slabs (id, label, min_km, max_km, price_per_kg, base_charge, is_active) FROM stdin;
1	Local (0 - 50 km)	0	50	2.50	500.00	t
2	Short (51 - 200 km)	51	200	4.00	1500.00	t
3	Medium (201 - 500 km)	201	500	6.00	3000.00	t
4	Long (501 - 1000 km)	501	1000	8.50	5000.00	t
5	Very Long (1000+ km)	1001	\N	12.00	8000.00	t
6	Local (0-50 km)	0	50	3.50	0.00	t
7	Short Distance (51-200 km)	51	200	5.00	0.00	t
8	Medium Distance (201-500 km)	201	500	7.00	0.00	t
9	Long Distance (501-1000 km)	501	1000	9.00	0.00	t
10	Very Long Distance (1000+ km)	1001	9999	12.00	0.00	t
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (id, category_id, name, weight_kg, is_active, sort_order) FROM stdin;
1	1	Single Sofa	25.00	t	1
2	1	Double Sofa (2 Seater)	45.00	t	2
3	1	Triple Sofa (3 Seater)	65.00	t	3
4	1	Sofa Set (3+2+1)	120.00	t	4
5	1	Single Bed (without mattress)	30.00	t	5
6	1	Double Bed (without mattress)	50.00	t	6
7	1	King Size Bed	70.00	t	7
8	1	Mattress (Single)	15.00	t	8
9	1	Mattress (Double)	25.00	t	9
10	1	Wardrobe (Small)	60.00	t	10
11	1	Wardrobe (Large)	100.00	t	11
12	1	Dining Table (4 seater)	40.00	t	12
13	1	Dining Table (6 seater)	65.00	t	13
14	1	Dining Chair	8.00	t	14
15	1	Center Table	20.00	t	15
16	1	Study Table	25.00	t	16
17	1	Bookshelf	35.00	t	17
18	1	Shoe Rack	10.00	t	18
19	1	Dressing Table	30.00	t	19
20	2	Refrigerator (Single Door)	45.00	t	1
21	2	Refrigerator (Double Door)	70.00	t	2
22	2	Washing Machine (Top Load)	35.00	t	3
23	2	Washing Machine (Front Load)	55.00	t	4
24	2	Air Conditioner (1 Ton)	30.00	t	5
25	2	Air Conditioner (1.5 Ton)	35.00	t	6
26	2	Microwave Oven	12.00	t	7
27	2	Water Purifier (RO)	8.00	t	8
28	2	Geyser	10.00	t	9
29	2	Ceiling Fan	5.00	t	10
30	2	Cooler (Desert)	20.00	t	11
31	3	LED TV (32 inch)	6.00	t	1
32	3	LED TV (43 inch)	9.00	t	2
33	3	LED TV (55 inch)	14.00	t	3
34	3	Desktop Computer	15.00	t	4
35	3	Laptop	2.00	t	5
36	3	Music System	8.00	t	6
37	3	Printer	5.00	t	7
38	4	Gas Stove (2 burner)	5.00	t	1
39	4	Gas Stove (3-4 burner)	8.00	t	2
40	4	Mixer Grinder	4.00	t	3
41	4	Chimney/Exhaust Hood	12.00	t	4
42	4	Kitchen Utensils (box)	15.00	t	5
43	4	Crockery (box)	10.00	t	6
44	5	Almirah (Steel)	80.00	t	1
45	5	Almirah (Wooden)	60.00	t	2
46	5	Bedside Table	10.00	t	3
47	5	Cloth Box / Trunk	20.00	t	4
48	5	Carton Box (packed)	15.00	t	5
49	6	Office Chair	12.00	t	1
50	6	Office Desk	35.00	t	2
51	6	Filing Cabinet	30.00	t	3
52	6	Photocopier Machine	50.00	t	4
53	6	Office Workstation	60.00	t	5
54	5	Small Almirah (Wooden)	25.00	t	0
\.


--
-- Data for Name: item_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_categories (id, name, icon, sort_order) FROM stdin;
1	Furniture	fa-couch	1
2	Appliances	fa-blender	2
3	Electronics	fa-tv	3
4	Kitchen	fa-utensils	4
5	Bedroom	fa-bed	5
6	Office	fa-briefcase	6
\.


--
-- Data for Name: labour_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.labour_settings (id, setting_key, setting_value, label) FROM stdin;
1	labour_rate_per_person	400.00	Labour Rate per Person (?)
2	weight_per_extra_labour	150.00	Add 1 Extra Labour every (kg)
3	base_labour_count	2.00	Minimum Labour Count
4	material_base_rate	8.00	Material: Base Rate per KG (?)
5	material_per_km_rate	2.00	Material: Extra Charge per KM (?)
6	packing_charge_percent	10.00	Packing Charge (% of base)
7	handling_charge_percent	5.00	Handling Charge (% of base)
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages (id, page_key, title, content, meta_description, updated_at) FROM stdin;
2	contact_info	Contact Us	{"address": "Bhagwant Complex, Near BJS College, Wagholi, Pune, Maharashtra - 412207", "phone": "+91 8975032310", "phone2": "+91 8975032310", "email": "kalyani@gmail.com", "hours": "Mon-Sun: 8:00 AM - 8:00 PM"}	Contact Kalyani Packers and Movers for all your relocation needs.	2026-02-21 10:22:43.437899
1	about_us	About Us	\n<h2>Welcome to Kalyani Packers & Movers</h2>\n<p>With over 5 years of experience in the moving industry, Kalyani Packers & Movers has helped thousands of families and businesses relocate safely and efficiently across India.</p>\n<h3>Our Mission</h3>\n<p>To provide stress-free, reliable, and affordable moving solutions with utmost care and professionalism.</p>\n<h3>Why Choose Us?</h3>\n<ul>\n<li>5+ Years of Experience</li>\n<li>50,000+ Happy Customers</li>\n<li>All India Network</li>\n<li>Trained & Verified Staff</li>\n<li>Goods Packaging Available</li>\n<li>24/7 Customer Support</li>\n</ul>\n	Learn about Kalyani Packers and Movers - your trusted relocation partner.	2026-02-21 10:22:43.437899
\.


--
-- Data for Name: price_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_items (id, category, name, weight_kg, base_price, is_active, sort_order, created_at) FROM stdin;
1	Furniture	Single Bed	40.00	400.00	t	1	2026-02-21 22:50:03.370854
2	Furniture	Double Bed	70.00	600.00	t	2	2026-02-21 22:50:03.370854
3	Furniture	King Size Bed	90.00	800.00	t	3	2026-02-21 22:50:03.370854
4	Furniture	Sofa (2 Seater)	60.00	500.00	t	4	2026-02-21 22:50:03.370854
5	Furniture	Sofa (3 Seater)	90.00	700.00	t	5	2026-02-21 22:50:03.370854
6	Furniture	Sofa Set (5 Seater)	150.00	1200.00	t	6	2026-02-21 22:50:03.370854
7	Furniture	Dining Table	50.00	500.00	t	7	2026-02-21 22:50:03.370854
8	Furniture	Dining Chair	10.00	100.00	t	8	2026-02-21 22:50:03.370854
9	Furniture	Wardrobe (Small)	60.00	600.00	t	9	2026-02-21 22:50:03.370854
10	Furniture	Wardrobe (Large)	100.00	900.00	t	10	2026-02-21 22:50:03.370854
11	Furniture	Dressing Table	35.00	350.00	t	11	2026-02-21 22:50:03.370854
12	Furniture	Study Table	25.00	250.00	t	12	2026-02-21 22:50:03.370854
13	Furniture	Office Chair	15.00	150.00	t	13	2026-02-21 22:50:03.370854
14	Furniture	Book Shelf	30.00	300.00	t	14	2026-02-21 22:50:03.370854
15	Furniture	Center Table	20.00	200.00	t	15	2026-02-21 22:50:03.370854
16	Furniture	Side Table	10.00	100.00	t	16	2026-02-21 22:50:03.370854
17	Furniture	Shoe Rack	15.00	150.00	t	17	2026-02-21 22:50:03.370854
18	Appliances	Refrigerator (Small)	40.00	500.00	t	1	2026-02-21 22:50:03.378305
19	Appliances	Refrigerator (Large)	80.00	800.00	t	2	2026-02-21 22:50:03.378305
20	Appliances	Washing Machine	70.00	600.00	t	3	2026-02-21 22:50:03.378305
21	Appliances	Dishwasher	50.00	500.00	t	4	2026-02-21 22:50:03.378305
22	Appliances	Microwave Oven	15.00	200.00	t	5	2026-02-21 22:50:03.378305
23	Appliances	Air Conditioner (1.5T)	35.00	600.00	t	6	2026-02-21 22:50:03.378305
24	Appliances	Air Conditioner (2T)	45.00	700.00	t	7	2026-02-21 22:50:03.378305
25	Appliances	Water Purifier	10.00	150.00	t	8	2026-02-21 22:50:03.378305
26	Appliances	Geyser	12.00	150.00	t	9	2026-02-21 22:50:03.378305
27	Appliances	Ceiling Fan	5.00	80.00	t	10	2026-02-21 22:50:03.378305
28	Appliances	Exhaust Fan	3.00	60.00	t	11	2026-02-21 22:50:03.378305
29	Appliances	Mixer/Grinder	5.00	80.00	t	12	2026-02-21 22:50:03.378305
30	Appliances	Vacuum Cleaner	8.00	100.00	t	13	2026-02-21 22:50:03.378305
31	Appliances	Induction Cooktop	3.00	60.00	t	14	2026-02-21 22:50:03.378305
32	Appliances	Gas Stove	10.00	120.00	t	15	2026-02-21 22:50:03.378305
33	Appliances	Water Cooler	40.00	400.00	t	16	2026-02-21 22:50:03.378305
34	Electronics	TV (32 inch)	10.00	200.00	t	1	2026-02-21 22:50:03.383862
35	Electronics	TV (43 inch)	15.00	300.00	t	2	2026-02-21 22:50:03.383862
36	Electronics	TV (55 inch+)	25.00	450.00	t	3	2026-02-21 22:50:03.383862
37	Electronics	Desktop Computer	15.00	200.00	t	4	2026-02-21 22:50:03.383862
38	Electronics	Laptop	3.00	100.00	t	5	2026-02-21 22:50:03.383862
39	Electronics	Printer	8.00	120.00	t	6	2026-02-21 22:50:03.383862
40	Electronics	Music System	15.00	200.00	t	7	2026-02-21 22:50:03.383862
41	Electronics	Home Theatre	20.00	300.00	t	8	2026-02-21 22:50:03.383862
42	Electronics	DTH Setup Box	1.00	50.00	t	9	2026-02-21 22:50:03.383862
43	Electronics	WiFi Router	1.00	50.00	t	10	2026-02-21 22:50:03.383862
44	Kitchen	Gas Cylinder	15.00	150.00	t	1	2026-02-21 22:50:03.387676
45	Kitchen	Kitchen Cabinets	80.00	700.00	t	2	2026-02-21 22:50:03.387676
46	Kitchen	Crockery Box	20.00	200.00	t	3	2026-02-21 22:50:03.387676
47	Kitchen	Utensils Box	25.00	200.00	t	4	2026-02-21 22:50:03.387676
48	Kitchen	Pressure Cooker	5.00	80.00	t	5	2026-02-21 22:50:03.387676
49	Kitchen	Water Tank	20.00	200.00	t	6	2026-02-21 22:50:03.387676
50	Boxes & Misc	Small Carton Box	10.00	80.00	t	1	2026-02-21 22:50:03.390963
51	Boxes & Misc	Medium Carton Box	20.00	120.00	t	2	2026-02-21 22:50:03.390963
52	Boxes & Misc	Large Carton Box	30.00	180.00	t	3	2026-02-21 22:50:03.390963
53	Boxes & Misc	Clothes Bag	15.00	100.00	t	4	2026-02-21 22:50:03.390963
54	Boxes & Misc	Book Box	25.00	150.00	t	5	2026-02-21 22:50:03.390963
55	Boxes & Misc	Fragile Items Box	15.00	200.00	t	6	2026-02-21 22:50:03.390963
56	Boxes & Misc	Cycle	15.00	200.00	t	7	2026-02-21 22:50:03.390963
57	Boxes & Misc	Motorcycle/Scooter	120.00	1500.00	t	8	2026-02-21 22:50:03.390963
58	Boxes & Misc	Treadmill	80.00	800.00	t	9	2026-02-21 22:50:03.390963
59	Boxes & Misc	Gym Equipment Set	60.00	600.00	t	10	2026-02-21 22:50:03.390963
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, name, description, short_description, icon, image, price_range, is_active, sort_order, created_at, updated_at) FROM stdin;
6	Packing Services	We use high-quality packing materials and techniques to ensure your fragile and valuable items are protected during transit. Available as standalone or combined with moving services.	Professional packing with premium quality materials	fas fa-box-open	service-1771911119747.png	₹3000 - ₹5000	t	6	2026-02-21 10:22:43.433651	2026-02-24 11:01:59.768793
1	Home Relocation	Our home relocation service covers everything from packing your belongings to unpacking them at your new home. We handle furniture disassembly, careful packing, safe transportation, and reassembly at destination.	Complete household moving services with care and efficiency	fas fa-home	service-1771911072263.png	₹3000 - ₹5000	t	1	2026-02-21 10:22:43.433651	2026-02-24 11:01:12.523747
2	Office Relocation	We specialize in office relocations that minimize business disruption. Our team handles IT equipment, furniture, documents, and sensitive materials with professional care and systematic planning.	Minimal downtime office shifting with expert planning	fas fa-building	service-1771911085678.png	₹5000 - ₹10000	t	2	2026-02-21 10:22:43.433651	2026-02-24 11:01:25.847673
3	Vehicle Transportation	Our vehicle transportation service ensures your car, bike, or scooter reaches the destination safely using enclosed carriers and specialized equipment.	Safe car and bike transport across India	fas fa-car	service-1771911098510.png	₹9000 - ₹10000	t	3	2026-02-21 10:22:43.433651	2026-02-24 11:01:38.767728
4	Warehouse Storage	Need temporary storage? Our secure, climate-controlled warehouses offer flexible storage solutions for household goods, office equipment, and commercial inventory.	Secure short and long-term storage solutions	fas fa-warehouse	service-1771911109318.png	₹3000 - ₹5000	t	4	2026-02-21 10:22:43.433651	2026-02-24 11:01:49.363024
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, phone, address, city, state, profile_image, is_active, created_at, updated_at) FROM stdin;
1	Ghanashyam Nilesh Auti	ghanashyam0810@gmail.com	$2a$10$tfWHwoccS0Pvjd.KqySgauIz9nq4sz66zlhNrPnhiD3Z53pJzqY3i	+919322979345	Pune	Pune	Maharashtra	default-user.png	t	2026-02-21 17:57:17.016597	2026-02-21 17:57:17.016597
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (id, name, capacity_kg, base_fare, per_km_rate, per_kg_rate, image, is_active, sort_order) FROM stdin;
1	2-Wheeler	30	50.00	8.00	1.00	\N	t	1
2	3-Wheeler	500	150.00	15.00	0.50	\N	t	2
3	Tata Ace	750	200.00	20.00	0.30	\N	t	3
4	Pickup 8ft	1200	300.00	25.00	0.25	\N	t	4
5	Truck	5000	800.00	40.00	0.10	\N	t	5
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, true);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_id_seq', 4, true);


--
-- Name: contact_queries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_queries_id_seq', 1, true);


--
-- Name: distance_slabs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.distance_slabs_id_seq', 10, true);


--
-- Name: inventory_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_items_id_seq', 54, true);


--
-- Name: item_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_categories_id_seq', 6, true);


--
-- Name: labour_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.labour_settings_id_seq', 7, true);


--
-- Name: pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pages_id_seq', 2, true);


--
-- Name: price_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.price_items_id_seq', 59, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 5, true);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_booking_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_booking_number_key UNIQUE (booking_number);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: contact_queries contact_queries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_queries
    ADD CONSTRAINT contact_queries_pkey PRIMARY KEY (id);


--
-- Name: distance_slabs distance_slabs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.distance_slabs
    ADD CONSTRAINT distance_slabs_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: item_categories item_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_categories
    ADD CONSTRAINT item_categories_pkey PRIMARY KEY (id);


--
-- Name: labour_settings labour_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labour_settings
    ADD CONSTRAINT labour_settings_pkey PRIMARY KEY (id);


--
-- Name: labour_settings labour_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labour_settings
    ADD CONSTRAINT labour_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: pages pages_page_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_page_key_key UNIQUE (page_key);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: price_items price_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_items
    ADD CONSTRAINT price_items_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: idx_bookings_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_created_at ON public.bookings USING btree (created_at);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_bookings_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_user_id ON public.bookings USING btree (user_id);


--
-- Name: idx_contact_queries_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_queries_is_read ON public.contact_queries USING btree (is_read);


--
-- Name: idx_services_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_is_active ON public.services USING btree (is_active);


--
-- Name: admins update_admins_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bookings update_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: services update_services_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bookings bookings_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inventory_items inventory_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.item_categories(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict XgWymBO9SGmeYprFApu3g02KussHzdFNP9xHosRd0UZLI2aPLTdWd1oDDxTyQJu

