const crypto = require('crypto');

const createRequestId = () => (
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
);

const createRequestContext = (logger) => (req, res, next) => {
  req.requestId = req.get('X-Request-Id') || createRequestId();
  const startedAt = Date.now();

  res.setHeader('X-Request-Id', req.requestId);

  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms requestId=${req.requestId}`);
  });

  next();
};

module.exports = createRequestContext;
