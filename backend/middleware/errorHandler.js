// backend/middleware/errorHandler.js

// Handles routes that don't exist
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass to the general error handler
};

// General error handler middleware
const errorHandler = (err, req, res, next) => {
  // If status code is 200 (OK), then it's actually an error, so change to 500 (Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Show stack in dev, hide in prod
  });
};

export { notFound, errorHandler };