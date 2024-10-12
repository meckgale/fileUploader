const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // If the user is not authenticated, redirect to the login page
    res.redirect('/auth/login');
};

module.exports = isAuthenticated;