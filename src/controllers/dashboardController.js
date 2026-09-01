export const getDashboard = (req, res) => {
  res.render('dashboard', { user: req.user });
};
