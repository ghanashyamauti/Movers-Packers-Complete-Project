const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { isGuest } = require('../middleware/auth');

// Helper to generate booking number
function generateBookingNumber() {
  const prefix = 'BB';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

// ===================== HOME PAGE =====================
router.get('/', async (req, res) => {
  try {
    const services = await pool.query('SELECT * FROM services WHERE is_active = TRUE ORDER BY sort_order LIMIT 6');
    const vehicles = await pool.query('SELECT * FROM vehicles WHERE is_active=true ORDER BY sort_order');
    res.render('public/home', {
      title: 'Kalyani - Professional Packers & Movers',
      services: services.rows,
      vehicles: vehicles.rows
    });
  } catch (err) {
    console.error(err);
    res.render('public/home', { title: 'Kalyani - Professional Packers & Movers', services: [], vehicles: [] });
  }
});

// ===================== SERVICES PAGE =====================
router.get('/services', async (req, res) => {
  try {
    const services = await pool.query('SELECT * FROM services WHERE is_active = TRUE ORDER BY sort_order');
    res.render('public/services', {
      title: 'Our Services - Kalyani Packers and Movers',
      services: services.rows
    });
  } catch (err) {
    console.error(err);
    res.render('public/services', { title: 'Our Services', services: [] });
  }
});

// ===================== ABOUT PAGE =====================
router.get('/about', async (req, res) => {
  try {
    const page = await pool.query("SELECT * FROM pages WHERE page_key = 'about_us'");
    res.render('public/about', {
      title: 'About Us - Kalyani Packers and Movers',
      page: page.rows[0] || {}
    });
  } catch (err) {
    res.render('public/about', { title: 'About Us', page: {} });
  }
});

// ===================== CONTACT PAGE =====================
router.get('/contact', async (req, res) => {
  try {
    const page = await pool.query("SELECT * FROM pages WHERE page_key = 'contact_info'");
    let contactInfo = {};
    if (page.rows[0] && page.rows[0].content) {
      try { contactInfo = JSON.parse(page.rows[0].content); } catch(e) {}
    }
    res.render('public/contact', {
      title: 'Contact Us - Kalyani Packers and Movers',
      contactInfo
    });
  } catch (err) {
    res.render('public/contact', { title: 'Contact Us', contactInfo: {} });
  }
});

router.post('/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  try {
    if (!name || !email || !message) {
      req.flash('error_msg', 'Name, email and message are required');
      return res.redirect('/contact');
    }
    await pool.query(
      'INSERT INTO contact_queries (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)',
      [name, email, phone, subject, message]
    );
    req.flash('success_msg', 'Your query has been submitted! We will contact you soon.');
    res.redirect('/contact');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error submitting query. Please try again.');
    res.redirect('/contact');
  }
});

// ===================== LOGIN =====================
router.get('/login', isGuest, (req, res) => {
  res.render('public/login', { title: 'Login - Kalyani Packers and Movers' });
});

router.post('/login', isGuest, async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [email]);
    if (result.rows.length === 0) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/login');
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/login');
    }
    req.session.user = { id: user.id, name: user.name, email: user.email };
    req.flash('success_msg', `Welcome back, ${user.name}!`);
    const returnTo = req.session.returnTo || '/user/dashboard';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server error. Please try again.');
    res.redirect('/login');
  }
});

// ===================== LOGOUT =====================
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ===================== SIGNUP =====================
router.get('/signup', isGuest, (req, res) => {
  res.render('public/signup', { title: 'Sign Up - Kalyani Packers and Movers' });
});

router.post('/signup', isGuest, async (req, res) => {
  const { name, email, password, confirm_password, phone, address, city, state } = req.body;
  try {
    if (!name || !email || !password) {
      req.flash('error_msg', 'Name, email and password are required');
      return res.redirect('/signup');
    }
    if (password !== confirm_password) {
      req.flash('error_msg', 'Passwords do not match');
      return res.redirect('/signup');
    }
    if (password.length < 6) {
      req.flash('error_msg', 'Password must be at least 6 characters');
      return res.redirect('/signup');
    }
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      req.flash('error_msg', 'Email already registered. Please login.');
      return res.redirect('/signup');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, address, city, state) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, name, email',
      [name, email, hashedPassword, phone, address, city, state]
    );
    const user = result.rows[0];
    req.session.user = { id: user.id, name: user.name, email: user.email };
    req.flash('success_msg', `Welcome to Kalyani Packers and Movers, ${user.name}! Your account is created.`);
    res.redirect('/user/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error creating account. Please try again.');
    res.redirect('/signup');
  }
});

// ===================== REQUEST QUOTE =====================
router.get('/request-quote', async (req, res) => {
  try {
    const vehicles = await pool.query('SELECT * FROM vehicles WHERE is_active=true ORDER BY sort_order');
    const categories = await pool.query('SELECT * FROM item_categories ORDER BY sort_order');
    const items = await pool.query(
      'SELECT i.*, c.name as category_name FROM inventory_items i JOIN item_categories c ON i.category_id = c.id WHERE i.is_active = true ORDER BY i.category_id, i.sort_order'
    );
    const settingsRows = await pool.query('SELECT * FROM labour_settings');
    const settings = {};
    settingsRows.rows.forEach(s => { settings[s.setting_key] = parseFloat(s.setting_value); });

    res.render('public/request-quote', {
      title: 'Request Quote - Kalyani Packers and Movers',
      vehicles: vehicles.rows,
      categories: categories.rows,
      items: items.rows,
      settings,
      user: req.session.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('500', { error: err.message });
  }
});

router.post('/request-quote', async (req, res) => {
  const {
    name, email, phone,
    from_address, to_address,
    distance_km, move_date,
    booking_type, vehicle_id,
    labour_count, items, notes,
    estimated_price
  } = req.body;

  try {
    if (!name || !phone || !from_address || !to_address || !move_date) {
      req.flash('error_msg', 'Please fill all required fields');
      return res.redirect('/request-quote');
    }

    const bookingNumber = generateBookingNumber();
    const userId = req.session.user ? req.session.user.id : null;

    const specialReqs = `Type: ${booking_type || 'general'} | Distance: ${distance_km || 0}km | Labour: ${labour_count || 0} | Items: ${items || 'none'} | Notes: ${notes || ''}`;

    await pool.query(`
  INSERT INTO bookings 
  (booking_number, user_id, guest_name, guest_email, guest_phone,
   from_address, from_city, to_address, to_city, move_date, special_requirements, estimated_budget)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
  [bookingNumber, userId, name, email || null, phone,
   from_address, from_address, to_address, to_address, move_date,
   specialReqs, estimated_price || null]
);

    req.flash('success_msg', `Booking submitted! Your ID: ${bookingNumber}. We will call you within 30 minutes.`);
    res.redirect('/request-quote');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error submitting request. Please try again.');
    res.redirect('/request-quote');
  }
});


module.exports = router;