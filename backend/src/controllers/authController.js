const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

// POST /api/auth/login — chef/admin only
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.active) {
    return res.status(403).json({ success: false, message: 'This account has been deactivated' });
  }

  const token = signToken(user);

  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

// POST /api/auth/register — admin-only, creates chef or admin accounts
async function registerStaff(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'name, email, password and role are required' });
  }

  if (!['admin', 'chef'].includes(role)) {
    return res.status(400).json({ success: false, message: 'role must be admin or chef' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: 'A user with this email already exists' });
  }

  const user = await User.create({ name, email: email.toLowerCase(), password, role });

  res.status(201).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

// GET /api/auth/me
async function getMe(req, res) {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
}

// GET /api/auth/staff — admin-only
async function getAllStaff(req, res) {
  const staff = await User.find().sort({ createdAt: 1 });
  res.json({ success: true, staff });
}

// PATCH /api/auth/staff/:id/toggle-active — admin-only
async function toggleStaffActive(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Staff member not found' });
  }

  user.active = !user.active;
  await user.save();

  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, active: user.active },
  });
}

// DELETE /api/auth/staff/:id — admin-only
async function deleteStaff(req, res) {
  if (req.params.id === String(req.user._id)) {
    return res.status(400).json({ success: false, message: 'You cannot remove your own account' });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Staff member not found' });
  }

  res.json({ success: true, message: 'Staff member removed' });
}

module.exports = { login, registerStaff, getMe, getAllStaff, toggleStaffActive, deleteStaff };
