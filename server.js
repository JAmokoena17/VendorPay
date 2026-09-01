import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import poRoutes from './src/routes/poRoutes.js';
import invoiceRoutes from './src/routes/invoiceRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import { verifyToken } from './src/middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Routes
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', poRoutes);
app.use('/invoice', invoiceRoutes);

// Home
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(` VendorPay running at http://localhost:${PORT}`);
});