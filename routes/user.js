const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { isUser } = require('../middleware/auth');

// User Dashboard
router.get('/dashboard', isUser, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const bookings = await pool.query(
      'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
      [userId]
    );
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status='pending') as pending,
        COUNT(*) FILTER (WHERE status='approved') as approved,
        COUNT(*) FILTER (WHERE status='rejected') as rejected
      FROM bookings WHERE user_id = $1`, [userId]
    );
    res.render('user/dashboard', {
      title: 'My Dashboard - Kalyani Packers and Movers',
      bookings: bookings.rows,
      stats: stats.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.render('user/dashboard', { title: 'Dashboard', bookings: [], stats: {} });
  }
});

// My Requests
router.get('/my-requests', isUser, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const bookings = await pool.query(
      'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.render('user/my-requests', {
      title: 'My Requests - Kalyani Packers and Movers',
      bookings: bookings.rows
    });
  } catch (err) {
    res.render('user/my-requests', { title: 'My Requests', bookings: [] });
  }
});

// View Single Booking
router.get('/booking/:id', isUser, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const booking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    if (booking.rows.length === 0) {
      req.flash('error_msg', 'Booking not found');
      return res.redirect('/user/my-requests');
    }
    res.render('user/booking-detail', {
      title: 'Booking Details - Kalyani Packers and Movers',
      booking: booking.rows[0]
    });
  } catch (err) {
    req.flash('error_msg', 'Error fetching booking');
    res.redirect('/user/my-requests');
  }
});

// My Account
router.get('/my-account', isUser, async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.user.id]);
    res.render('user/my-account', {
      title: 'My Account - Kalyani Packers and Movers',
      user: user.rows[0]
    });
  } catch (err) {
    res.render('user/my-account', { title: 'My Account', user: {} });
  }
});

router.post('/my-account', isUser, async (req, res) => {
  const { name, phone, address, city, state } = req.body;
  try {
    await pool.query(
      'UPDATE users SET name=$1, phone=$2, address=$3, city=$4, state=$5 WHERE id=$6',
      [name, phone, address, city, state, req.session.user.id]
    );
    req.session.user.name = name;
    req.flash('success_msg', 'Profile updated successfully!');
    res.redirect('/user/my-account');
  } catch (err) {
    req.flash('error_msg', 'Error updating profile');
    res.redirect('/user/my-account');
  }
});

// Change Password
router.get('/change-password', isUser, (req, res) => {
  res.render('user/change-password', { title: 'Change Password - Kalyani Packers and Movers' });
});

router.post('/change-password', isUser, async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  try {
    if (new_password !== confirm_password) {
      req.flash('error_msg', 'New passwords do not match');
      return res.redirect('/user/change-password');
    }
    if (new_password.length < 6) {
      req.flash('error_msg', 'Password must be at least 6 characters');
      return res.redirect('/user/change-password');
    }
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.user.id]);
    const isMatch = await bcrypt.compare(current_password, user.rows[0].password);
    if (!isMatch) {
      req.flash('error_msg', 'Current password is incorrect');
      return res.redirect('/user/change-password');
    }
    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hashed, req.session.user.id]);
    req.flash('success_msg', 'Password changed successfully!');
    res.redirect('/user/change-password');
  } catch (err) {
    req.flash('error_msg', 'Error changing password');
    res.redirect('/user/change-password');
  }
});

module.exports = router;
