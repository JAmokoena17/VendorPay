import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Show create PO form
export const getCreatePO = (req, res) => {
  res.render('po/create', { error: null });
};

// Handle PO creation
export const createPO = async (req, res) => {
  const { po_number, vendor, issue_date, total_amount, tax } = req.body;

  const { data, error } = await supabase
    .from('purchase_orders')
    .insert([{ 
      po_number, 
      vendor, 
      issue_date, 
      total_amount, 
      tax, 
      created_by: req.user.id 
    }])
    .select()
    .single();

  if (error) {
    return res.render('po/create', { error: error.message });
  }

  res.redirect('/po/list');
};

// List all POs
export const listPOs = async (req, res) => {
  const { data: pos, error } = await supabase
    .from('purchase_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.send('Error loading POs');
  }

  res.render('po/list', { pos });
};