module.exports = function authMiddleware(req, res, next) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return next();

  const headerKey = req.header('x-admin-key');
  const auth = req.header('authorization');
  const bearer =
    typeof auth === 'string' && auth.startsWith('Bearer ')
      ? auth.slice('Bearer '.length)
      : undefined;

  if (headerKey === adminKey || bearer === adminKey) return next();

  return res.status(401).json({ message: 'Unauthorized' });
};

