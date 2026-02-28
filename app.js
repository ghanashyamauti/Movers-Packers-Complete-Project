require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method Override
app.use(methodOverride('_method'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'swiftmove_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Flash Messages
app.use(flash());

// Global Variables Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.session.user || null;
  res.locals.currentAdmin = req.session.admin || null;
  res.locals.currentPath = req.path;
  next();
});

// Routes
const publicRoutes = require('./routes/public');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const estimateRoutes = require('./routes/estimate');
const chatRoutes = require('./routes/chat');

app.use('/', publicRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/estimate', estimateRoutes);
app.use('/chat', chatRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Kalyani Packers & Movers App running at http://localhost:${PORT}`);
  console.log(`👤 Admin Panel: http://localhost:${PORT}/admin/login`);
  console.log(`📧 Admin: admin@moverspackersco.com | Password: Admin@123`);
});

module.exports = app;
