import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Approve an invoice
export const approveInvoice = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('invoices')
    .update({
      approval_status: 'approved',
      approved_by: req.user.id,
      approved_at: new Date(),
    })
    .eq('id', id);

  if (error) {
    console.error('Approve error:', error);
    return res.send('Error approving invoice');
  }

  res.redirect('/invoice/list');
};

// Reject an invoice
export const rejectInvoice = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const { error } = await supabase
    .from('invoices')
    .update({
      approval_status: 'rejected',
      approved_by: req.user.id,
      approved_at: new Date(),
      rejection_reason: reason || 'No reason provided',
    })
    .eq('id', id);

  if (error) {
    console.error('Reject error:', error);
    return res.send('Error rejecting invoice');
  }

  res.redirect('/invoice/list');
};