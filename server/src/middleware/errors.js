export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || (error.name === "ValidationError" ? 400 : 500);
  const message = status === 500 ? "Something went wrong on the server" : error.message;
  if (process.env.NODE_ENV !== "test") console.error(error);
  res.status(status).json({ message });
}
