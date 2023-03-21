
// BIZTIME express application
const express = require("express");
const app = express();
const ExpressError = require("./expressError")

// Parse request bodies for JSON
app.use(express.json());


// 404 Handler
app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  // pass err to the next middleware
  return next(err);
});

// General error handler
app.use((err, req, res, next) => {
  // default status is 500 (Internal Server Error)
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
