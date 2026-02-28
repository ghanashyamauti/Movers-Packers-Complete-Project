const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { isAdmin, isAdminGuest } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config for service images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/images/services';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'service-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ===================== ADMIN LOGIN =====================
router.get('/login', isAdminGuest, (req, res) => {
  res.render('admin/login', { title: 'Admin Login - Kalyani Packers and Movers' });
});

router.post('/login', isAdminGuest, async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/admin/login');
    }
    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/admin/login');
    }
    req.session.admin = { id: admin.id, name: admin.name, email: admin.email };
    req.flash('success_msg', `Welcome, ${admin.name}!`);
    res.redirect('/admin/dashboard');
  } catch (err) {
    req.flash('error_msg', 'Server error');
    res.redirect('/admin/login');
  }
});

// Admin Logout
router.get('/logout', (req, res) => {
  req.session.admin = null;
  req.flash('success_msg', 'Logged out successfully');
  res.redirect('/admin/login');
});

// ===================== DASHBOARD =====================
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status='pending') as pending_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status='approved') as approved_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status='rejected') as rejected_bookings,
        (SELECT COUNT(*) FROM contact_queries) as total_queries,
        (SELECT COUNT(*) FROM contact_queries WHERE is_read=FALSE) as unread_queries,
        (SELECT COUNT(*) FROM contact_queries WHERE is_read=TRUE) as read_queries,
        (SELECT COUNT(*) FROM services WHERE is_active=TRUE) as total_services,
        (SELECT COUNT(*) FROM users WHERE is_active=TRUE) as total_users
    `);
    const recentBookings = await pool.query(
      'SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5'
    );
    const recentQueries = await pool.query(
      'SELECT * FROM contact_queries ORDER BY created_at DESC LIMIT 5'
    );
    res.render('admin/dashboard', {
      title: 'Admin Dashboard - Kalyani Packers and Movers',
      stats: stats.rows[0],
      recentBookings: recentBookings.rows,
      recentQueries: recentQueries.rows
    });
  } catch (err) {
    console.error(err);
    res.render('admin/dashboard', { title: 'Dashboard', stats: {}, recentBookings: [], recentQueries: [] });
  }
});

// ===================== SERVICES MANAGEMENT =====================
router.get('/services', isAdmin, async (req, res) => {
  const services = await pool.query('SELECT * FROM services ORDER BY sort_order');
  res.render('admin/services', { title: 'Manage Services - Admin', services: services.rows });
});

router.get('/services/add', isAdmin, (req, res) => {
  res.render('admin/service-form', { title: 'Add Service', service: null });
});

router.post('/services/add', isAdmin, upload.single('image'), async (req, res) => {
  const { name, short_description, description, icon, price_range, sort_order, is_active } = req.body;
  const image = req.file ? req.file.filename : null;
  try {
    await pool.query(
      'INSERT INTO services (name, short_description, description, icon, image, price_range, sort_order, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [name, short_description, description, icon, image, price_range, sort_order || 0, is_active === 'on']
    );
    req.flash('success_msg', 'Service added successfully!');
    res.redirect('/admin/services');
  } catch (err) {
    req.flash('error_msg', 'Error adding service');
    res.redirect('/admin/services/add');
  }
});

router.get('/services/edit/:id', isAdmin, async (req, res) => {
  const service = await pool.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
  res.render('admin/service-form', { title: 'Edit Service', service: service.rows[0] });
});

router.post('/services/edit/:id', isAdmin, upload.single('image'), async (req, res) => {
  const { name, short_description, description, icon, price_range, sort_order, is_active } = req.body;
  const image = req.file ? req.file.filename : null;
  try {
    if (image) {
      await pool.query(
        'UPDATE services SET name=$1, short_description=$2, description=$3, icon=$4, image=$5, price_range=$6, sort_order=$7, is_active=$8 WHERE id=$9',
        [name, short_description, description, icon, image, price_range, sort_order || 0, is_active === 'on', req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE services SET name=$1, short_description=$2, description=$3, icon=$4, price_range=$5, sort_order=$6, is_active=$7 WHERE id=$8',
        [name, short_description, description, icon, price_range, sort_order || 0, is_active === 'on', req.params.id]
      );
    }
    req.flash('success_msg', 'Service updated!');
    res.redirect('/admin/services');
  } catch (err) {
    req.flash('error_msg', 'Error updating service');
    res.redirect('/admin/services');
  }
});

router.post('/services/delete/:id', isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id = $1', [req.params.id]);
    req.flash('success_msg', 'Service deleted!');
  } catch (err) {
    req.flash('error_msg', 'Error deleting service');
  }
  res.redirect('/admin/services');
});

// ===================== BOOKINGS =====================
router.get('/bookings', isAdmin, async (req, res) => {
  try {
    const filter = req.query.status || 'all';
    let query = 'SELECT * FROM bookings';
    let params = [];
    if (filter !== 'all') {
      query += ' WHERE status = $1';
      params = [filter];
    }
    query += ' ORDER BY created_at DESC';
    const bookings = await pool.query(query, params);
    res.render('admin/bookings', {
      title: 'Manage Bookings - Admin',
      bookings: bookings.rows,
      filter
    });
  } catch (err) {
    res.render('admin/bookings', { title: 'Bookings', bookings: [], filter: 'all' });
  }
});

router.get('/bookings/:id', isAdmin, async (req, res) => {
  const booking = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
  if (booking.rows.length === 0) {
    req.flash('error_msg', 'Booking not found');
    return res.redirect('/admin/bookings');
  }
  res.render('admin/booking-detail', { title: 'Booking Details', booking: booking.rows[0] });
});

router.post('/bookings/:id/status', isAdmin, async (req, res) => {
  const { status, admin_notes } = req.body;
  try {
    await pool.query(
      'UPDATE bookings SET status=$1, admin_notes=$2 WHERE id=$3',
      [status, admin_notes, req.params.id]
    );
    req.flash('success_msg', `Booking ${status}!`);
  } catch (err) {
    req.flash('error_msg', 'Error updating booking status');
  }
  res.redirect('/admin/bookings/' + req.params.id);
});

// ===================== CONTACT QUERIES =====================
router.get('/queries', isAdmin, async (req, res) => {
  const filter = req.query.filter || 'all';
  let query = 'SELECT * FROM contact_queries';
  if (filter === 'unread') query += ' WHERE is_read = FALSE';
  if (filter === 'read') query += ' WHERE is_read = TRUE';
  query += ' ORDER BY created_at DESC';
  const queries = await pool.query(query);
  res.render('admin/queries', { title: 'Contact Queries - Admin', queries: queries.rows, filter });
});

router.get('/queries/:id', isAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE contact_queries SET is_read=TRUE WHERE id=$1', [req.params.id]);
    const query = await pool.query('SELECT * FROM contact_queries WHERE id=$1', [req.params.id]);
    res.render('admin/query-detail', { title: 'Query Details', query: query.rows[0] });
  } catch (err) {
    res.redirect('/admin/queries');
  }
});

router.post('/queries/:id/reply', isAdmin, async (req, res) => {
  const { reply } = req.body;
  try {
    await pool.query(
      'UPDATE contact_queries SET admin_reply=$1, replied_at=NOW() WHERE id=$2',
      [reply, req.params.id]
    );
    req.flash('success_msg', 'Reply saved!');
  } catch (err) {
    req.flash('error_msg', 'Error saving reply');
  }
  res.redirect('/admin/queries/' + req.params.id);
});

router.post('/queries/:id/delete', isAdmin, async (req, res) => {
  await pool.query('DELETE FROM contact_queries WHERE id=$1', [req.params.id]);
  req.flash('success_msg', 'Query deleted!');
  res.redirect('/admin/queries');
});

// ===================== REGISTERED USERS =====================
router.get('/users', isAdmin, async (req, res) => {
  const users = await pool.query(
    'SELECT u.*, COUNT(b.id) as booking_count FROM users u LEFT JOIN bookings b ON b.user_id=u.id GROUP BY u.id ORDER BY u.created_at DESC'
  );
  res.render('admin/users', { title: 'Registered Users - Admin', users: users.rows });
});

router.get('/users/:id', isAdmin, async (req, res) => {
  const user = await pool.query('SELECT * FROM users WHERE id=$1', [req.params.id]);
  if (user.rows.length === 0) return res.redirect('/admin/users');
  const bookings = await pool.query('SELECT * FROM bookings WHERE user_id=$1 ORDER BY created_at DESC', [req.params.id]);
  res.render('admin/user-detail', { title: 'User Details', user: user.rows[0], bookings: bookings.rows });
});

router.post('/users/:id/toggle', isAdmin, async (req, res) => {
  const user = await pool.query('SELECT is_active FROM users WHERE id=$1', [req.params.id]);
  if (user.rows.length > 0) {
    await pool.query('UPDATE users SET is_active=$1 WHERE id=$2', [!user.rows[0].is_active, req.params.id]);
  }
  req.flash('success_msg', 'User status updated!');
  res.redirect('/admin/users');
});

// ===================== PAGES MANAGEMENT =====================
router.get('/pages', isAdmin, async (req, res) => {
  const pages = await pool.query('SELECT * FROM pages ORDER BY id');
  res.render('admin/pages', { title: 'Manage Pages - Admin', pages: pages.rows });
});

router.get('/pages/edit/:key', isAdmin, async (req, res) => {
  const page = await pool.query('SELECT * FROM pages WHERE page_key=$1', [req.params.key]);
  if (page.rows.length === 0) return res.redirect('/admin/pages');
  res.render('admin/page-edit', { title: 'Edit Page', page: page.rows[0] });
});

router.post('/pages/edit/:key', isAdmin, async (req, res) => {
  const { title, content, meta_description } = req.body;
  try {
    await pool.query(
      'UPDATE pages SET title=$1, content=$2, meta_description=$3 WHERE page_key=$4',
      [title, content, meta_description, req.params.key]
    );
    req.flash('success_msg', 'Page updated!');
  } catch (err) {
    req.flash('error_msg', 'Error updating page');
  }
  res.redirect('/admin/pages');
});

// ===================== SEARCH =====================
router.get('/search', isAdmin, async (req, res) => {
  const { q } = req.query;
  let results = [];
  if (q) {
    results = await pool.query(
      `SELECT * FROM bookings WHERE 
       guest_name ILIKE $1 OR guest_phone ILIKE $1 OR 
       guest_email ILIKE $1 OR booking_number ILIKE $1
       ORDER BY created_at DESC`,
      [`%${q}%`]
    );
    results = results.rows;
  }
  res.render('admin/search', { title: 'Search Bookings - Admin', results, q: q || '' });
});

// ===================== REPORTS =====================
router.get('/reports', isAdmin, async (req, res) => {
  try {
    const { from_date, to_date, type } = req.query;
    let bookings = [], queries = [];
    
    if (from_date && to_date) {
      if (!type || type === 'bookings') {
        const b = await pool.query(
          'SELECT * FROM bookings WHERE DATE(created_at) BETWEEN $1 AND $2 ORDER BY created_at DESC',
          [from_date, to_date]
        );
        bookings = b.rows;
      }
      if (!type || type === 'queries') {
        const q = await pool.query(
          'SELECT * FROM contact_queries WHERE DATE(created_at) BETWEEN $1 AND $2 ORDER BY created_at DESC',
          [from_date, to_date]
        );
        queries = q.rows;
      }
    }
    
    res.render('admin/reports', {
      title: 'Reports - Admin',
      bookings, queries, from_date: from_date || '', to_date: to_date || '', type: type || ''
    });
  } catch (err) {
    res.render('admin/reports', { title: 'Reports', bookings: [], queries: [], from_date: '', to_date: '', type: '' });
  }
});

// ===================== ADMIN PROFILE =====================
router.get('/profile', isAdmin, async (req, res) => {
  const admin = await pool.query('SELECT * FROM admins WHERE id=$1', [req.session.admin.id]);
  res.render('admin/profile', { title: 'Admin Profile', admin: admin.rows[0] });
});

router.post('/profile', isAdmin, async (req, res) => {
  const { name, phone } = req.body;
  try {
    await pool.query('UPDATE admins SET name=$1, phone=$2 WHERE id=$3', [name, phone, req.session.admin.id]);
    req.session.admin.name = name;
    req.flash('success_msg', 'Profile updated!');
  } catch (err) {
    req.flash('error_msg', 'Error updating profile');
  }
  res.redirect('/admin/profile');
});

router.get('/change-password', isAdmin, (req, res) => {
  res.render('admin/change-password', { title: 'Change Password - Admin' });
});

router.post('/change-password', isAdmin, async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  try {
    if (new_password !== confirm_password) {
      req.flash('error_msg', 'Passwords do not match');
      return res.redirect('/admin/change-password');
    }
    const admin = await pool.query('SELECT * FROM admins WHERE id=$1', [req.session.admin.id]);
    const isMatch = await bcrypt.compare(current_password, admin.rows[0].password);
    if (!isMatch) {
      req.flash('error_msg', 'Current password incorrect');
      return res.redirect('/admin/change-password');
    }
    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE admins SET password=$1 WHERE id=$2', [hashed, req.session.admin.id]);
    req.flash('success_msg', 'Password changed!');
    res.redirect('/admin/change-password');
  } catch (err) {
    req.flash('error_msg', 'Error changing password');
    res.redirect('/admin/change-password');
  }
});
// ===================== PRICE ITEMS =====================
router.get('/price-items', isAdmin, async (req, res) => {
  const items = await pool.query('SELECT * FROM price_items ORDER BY category, sort_order');
  const slabs = await pool.query('SELECT * FROM distance_slabs ORDER BY min_km');
  res.render('admin/price-items', { title: 'Price Items - Admin', items: items.rows, slabs: slabs.rows });
});
router.get('/price-items/add', isAdmin, (req, res) => {
  res.render('admin/price-item-form', { title: 'Add Price Item', item: null });
});
router.post('/price-items/add', isAdmin, async (req, res) => {
  const { category, name, weight_kg, base_price, sort_order, is_active } = req.body;
  try {
    await pool.query('INSERT INTO price_items (category,name,weight_kg,base_price,sort_order,is_active) VALUES ($1,$2,$3,$4,$5,$6)',
      [category, name, weight_kg, base_price, sort_order||0, is_active==='on']);
    req.flash('success_msg', 'Item added!');
  } catch(err) { req.flash('error_msg', 'Error adding item'); }
  res.redirect('/admin/price-items');
});
router.get('/price-items/edit/:id', isAdmin, async (req, res) => {
  const item = await pool.query('SELECT * FROM price_items WHERE id=$1', [req.params.id]);
  res.render('admin/price-item-form', { title: 'Edit Price Item', item: item.rows[0] });
});
router.post('/price-items/edit/:id', isAdmin, async (req, res) => {
  const { category, name, weight_kg, base_price, sort_order, is_active } = req.body;
  try {
    await pool.query('UPDATE price_items SET category=$1,name=$2,weight_kg=$3,base_price=$4,sort_order=$5,is_active=$6 WHERE id=$7',
      [category, name, weight_kg, base_price, sort_order||0, is_active==='on', req.params.id]);
    req.flash('success_msg', 'Item updated!');
  } catch(err) { req.flash('error_msg', 'Error updating'); }
  res.redirect('/admin/price-items');
});
router.post('/price-items/delete/:id', isAdmin, async (req, res) => {
  await pool.query('DELETE FROM price_items WHERE id=$1', [req.params.id]);
  req.flash('success_msg', 'Item deleted!');
  res.redirect('/admin/price-items');
});
router.get('/price-slabs', isAdmin, async (req, res) => {
  const slabs = await pool.query('SELECT * FROM distance_slabs ORDER BY min_km');
  res.render('admin/price-slabs', { title: 'Distance Slabs - Admin', slabs: slabs.rows });
});
router.post('/price-slabs/update/:id', isAdmin, async (req, res) => {
  const { base_charge, price_per_kg, is_active } = req.body;
  try {
    await pool.query('UPDATE distance_slabs SET base_charge=$1,price_per_kg=$2,is_active=$3 WHERE id=$4',
      [base_charge, price_per_kg, is_active==='true', req.params.id]);
    req.flash('success_msg', 'Slab updated!');
  } catch(err) { req.flash('error_msg', 'Error updating slab'); }
  res.redirect('/admin/price-slabs');
});

// ============ INVENTORY / ESTIMATE PRICING ============

// List categories and slabs
router.get('/inventory', isAdmin, async (req, res) => {
  const categories = await pool.query('SELECT * FROM item_categories ORDER BY sort_order');
  const items = await pool.query('SELECT i.*, c.name as cat_name FROM inventory_items i JOIN item_categories c ON i.category_id=c.id ORDER BY i.category_id, i.sort_order');
  const slabs = await pool.query('SELECT * FROM distance_slabs ORDER BY min_km');
  res.render('admin/inventory', {
    title: 'Inventory & Pricing',
    categories: categories.rows,
    items: items.rows,
    slabs: slabs.rows,
    success: req.session.success ? req.session.success : null,
    error: req.session.error ? req.session.error : null
  });
  delete req.session.success; delete req.session.error;
});

// Add item
router.post('/inventory/item/add', isAdmin, async (req, res) => {
  const { category_id, name, weight_kg } = req.body;
  await pool.query('INSERT INTO inventory_items (category_id, name, weight_kg) VALUES ($1,$2,$3)', [category_id, name, weight_kg]);
  req.session.success = 'Item added successfully';
  res.redirect('/admin/inventory');
});

// Edit item
router.post('/inventory/item/edit', isAdmin, async (req, res) => {
  const { id, name, weight_kg, is_active } = req.body;
  await pool.query('UPDATE inventory_items SET name=$1, weight_kg=$2, is_active=$3 WHERE id=$4', [name, weight_kg, is_active === 'on', id]);
  req.session.success = 'Item updated';
  res.redirect('/admin/inventory');
});

// Delete item
router.post('/inventory/item/delete', isAdmin, async (req, res) => {
  await pool.query('DELETE FROM inventory_items WHERE id=$1', [req.body.id]);
  req.session.success = 'Item deleted';
  res.redirect('/admin/inventory');
});

// Edit slab
router.post('/inventory/slab/edit', isAdmin, async (req, res) => {
  const { id, min_km, max_km, price_per_kg, label } = req.body;
  await pool.query('UPDATE distance_slabs SET min_km=$1, max_km=$2, price_per_kg=$3, label=$4 WHERE id=$5', [min_km, max_km, price_per_kg, label, id]);
  req.session.success = 'Pricing slab updated';
  res.redirect('/admin/inventory');
});

// Add category
router.post('/inventory/category/add', isAdmin, async (req, res) => {
  const { name, icon } = req.body;
  await pool.query('INSERT INTO item_categories (name, icon) VALUES ($1,$2)', [name, icon || 'fa-box']);
  req.session.success = 'Category added';
  res.redirect('/admin/inventory');
});

// ============ VEHICLES ============
const vehicleStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/vehicles/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const vehicleUpload = multer({ storage: vehicleStorage });

router.get('/vehicles', isAdmin, async (req, res) => {
  const vehicles = await pool.query('SELECT * FROM vehicles ORDER BY sort_order');
  const settings = await pool.query('SELECT * FROM labour_settings ORDER BY id');
  res.render('admin/vehicles', {
    title: 'Vehicles & Labour Settings',
    vehicles: vehicles.rows,
    settings: settings.rows,
    success: req.session.success || null,
    error: req.session.error || null
  });
  delete req.session.success; delete req.session.error;
});

router.post('/vehicles/add', isAdmin, vehicleUpload.single('image'), async (req, res) => {
  const { name, capacity_kg, base_fare, per_km_rate, per_kg_rate, sort_order } = req.body;
  const image = req.file ? req.file.filename : null;
  await pool.query(
    'INSERT INTO vehicles (name, capacity_kg, base_fare, per_km_rate, per_kg_rate, image, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [name, capacity_kg, base_fare, per_km_rate, per_kg_rate, image, sort_order || 0]
  );
  req.session.success = 'Vehicle added';
  res.redirect('/admin/vehicles');
});

router.post('/vehicles/edit', isAdmin, vehicleUpload.single('image'), async (req, res) => {
  const { id, name, capacity_kg, base_fare, per_km_rate, per_kg_rate, is_active, sort_order } = req.body;
  const image = req.file ? req.file.filename : req.body.existing_image;
  await pool.query(
    'UPDATE vehicles SET name=$1, capacity_kg=$2, base_fare=$3, per_km_rate=$4, per_kg_rate=$5, image=$6, is_active=$7, sort_order=$8 WHERE id=$9',
    [name, capacity_kg, base_fare, per_km_rate, per_kg_rate, image, is_active === 'on', sort_order || 0, id]
  );
  req.session.success = 'Vehicle updated';
  res.redirect('/admin/vehicles');
});

router.post('/vehicles/delete', isAdmin, async (req, res) => {
  await pool.query('DELETE FROM vehicles WHERE id=$1', [req.body.id]);
  req.session.success = 'Vehicle deleted';
  res.redirect('/admin/vehicles');
});

router.post('/vehicles/settings/update', isAdmin, async (req, res) => {
  const updates = req.body;
  for (const [key, value] of Object.entries(updates)) {
    await pool.query('UPDATE labour_settings SET setting_value=$1 WHERE setting_key=$2', [value, key]);
  }
  req.session.success = 'Settings updated';
  res.redirect('/admin/vehicles');
});

module.exports = router;
