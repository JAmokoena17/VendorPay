import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Show login page
export const getLogin = (req, res) => {
  res.render('login', { error: null });
};

// Show register page
export const getRegister = (req, res) => {
  res.render('register', { error: null });
};

// Handle registration
export const postRegister = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();

  if (existingUser) {
    return res.render('register', { error: 'Email already registered' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Insert user into database
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, password_hash, role }])
    .select()
    .single();

  if (error) {
    return res.render('register', { error: error.message });
  }

  // Redirect to login page after successful registration
  res.redirect('/login');
};

// Handle login
export const postLogin = async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (!user || error) {
    return res.render('login', { error: 'Invalid email or password' });
  }

  // Check password
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.render('login', { error: 'Invalid email or password' });
  }

  // Create JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Set cookie
  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.redirect('/dashboard');
};

// Handle logout
export const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};