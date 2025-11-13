const authMiddleware=(req, res, next)=>{
  const authorized = true;
  if (!authorized) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

module.exports = authMiddleware;
