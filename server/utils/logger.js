/**
 * Logs time and requested url
 */
export function logger(req, res, next) {
  console.log(`${new Date()}: ${req.url}`);
  next();
}
