const parseAllowedOrigins = (corsOrigin = '') => (
  corsOrigin
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
);

const createOriginPolicy = (corsOrigin = '') => {
  const allowedOrigins = parseAllowedOrigins(corsOrigin);

  const isOriginAllowed = (origin) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
      return true;
    }

    return allowedOrigins.includes(origin);
  };

  const corsOptions = {
    origin(origin, callback) {
      callback(null, isOriginAllowed(origin));
    },
  };

  return {
    allowedOrigins,
    corsOptions,
    isOriginAllowed,
  };
};

module.exports = {
  createOriginPolicy,
  parseAllowedOrigins,
};
