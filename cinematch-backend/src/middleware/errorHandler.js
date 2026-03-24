const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  const response = {
    message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Something went wrong' : message
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
