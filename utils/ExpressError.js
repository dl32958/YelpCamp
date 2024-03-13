class ExpressError extends Error {
  constructor(message, statusCode) {
    // super(): for calling the parent constructor
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;