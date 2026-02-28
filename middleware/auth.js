// Middleware: Check if user is logged in
const isUser = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash('error_msg', 'Please login to access this page');
  res.redirect('/login');
};

// Middleware: Check if admin is logged in
const isAdmin = (req, res, next) => {
  if (req.session.admin) {
    return next();
  }
  req.flash('error_msg', 'Please login as admin');
  res.redirect('/admin/login');
};

// Middleware: Redirect if already logged in as user
const isGuest = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/user/dashboard');
  }
  next();
};

// Middleware: Redirect if already logged in as admin
const isAdminGuest = (req, res, next) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  next();
};

module.exports = { isUser, isAdmin, isGuest, isAdminGuest };
