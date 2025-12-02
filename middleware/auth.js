// Authentication middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/signin');
};

// Authorization middleware to check if user is a Manager
const isManager = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'Manager') {
        return next();
    }
    res.status(403).send('Access Denied: Manager access only');
};

// Authorization middleware to check if user is a Sales Agent
const isSalesAgent = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'Sales_agent') {
        return next();
    }
    res.status(403).send('Access Denied: Sales Agent access only');
};

// Authorization middleware to check if user is either Manager or Sales Agent
const isManagerOrSalesAgent = (req, res, next) => {
    if (req.isAuthenticated() && (req.user.role === 'Manager' || req.user.role === 'Sales_agent')) {
        return next();
    }
    res.status(403).send('Access Denied: Authorized personnel only');
};

module.exports = {
    isAuthenticated,
    isManager,
    isSalesAgent,
    isManagerOrSalesAgent
};