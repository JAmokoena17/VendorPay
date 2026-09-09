import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { extractInvoiceData } from '../utils/vision.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs allowed'));
    }
  },
});

export const getCreateInvoice = async (req, res) => {
  const { data: pos } = await supabase.from('purchase_orders').select('id, po_number, vendor');
  res.render('invoice/create', { error: null, pos, extractedData: null });
};

export const createInvoice = async (req, res) => {
  upload.single('invoice_file')(req, res, async (err) => {
    if (err) {
      const { data: pos } = await supabase.from('purchase_orders').select('id, po_number, vendor');
      return res.render('invoice/create', { error: err.message, pos, extractedData: null });
    }

    const { invoice_number, po_id, vendor, invoice_date, total_amount, vat } = req.body;
    let extractedData = null;
    let fileUrl = null;

    if (req.file) {
      try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const cloudResult = await cloudinary.uploader.upload(dataURI, { folder: 'vendorpay/invoices' });
        fileUrl = cloudResult.secure_url;

        const result = await extractInvoiceData(fileUrl, req.file.mimetype);
        if (result.error) {
          const { data: pos } = await supabase.from('purchase_orders').select('id, po_number, vendor');
          return res.render('invoice/create', { error: result.error, pos, extractedData: null });
        }
        extractedData = result;
      } catch (error) {
        console.error('Invoice file processing error:', error);
        const { data: pos } = await supabase.from('purchase_orders').select('id, po_number, vendor');
        return res.render('invoice/create', { error: 'File processing failed. Enter manually.', pos, extractedData: null });
      }
    }

    const finalInvoiceNumber = invoice_number || extractedData?.invoiceNumber || '';
    const { data: existing } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('invoice_number', finalInvoiceNumber)
      .single();

    if (existing) {
      const { data: pos } = await supabase.from('purchase_orders').select('id, po_number, vendor');
      return res.render('invoice/create', {
        error: `Invoice "${finalInvoiceNumber}" already exists!`,
        pos,
        extractedData,
      });
    }

    const finalVendor = vendor || extractedData?.vendor || '';
    const finalDate = invoice_date || extractedData?.date || null;
    const finalTotal = total_amount || extractedData?.totalAmount || 0;
    const finalVat = vat || extractedData?.vat || 0;

    const { error: dbError } = await supabase.from('invoices').insert([
      {
        invoice_number: finalInvoiceNumber,
        po_id,
        vendor: finalVendor,
        invoice_date: finalDate,
        total_amount: parseFloat(finalTotal) || 0,
        vat: parseFloat(finalVat) || 0,
        file_url: fileUrl,
        uploaded_by: req.user.id,
      },
    ]);

    if (dbError) {
      const { data: pos } = await supabase.from('purchase_orders').select('id, po_number, vendor');
      return res.render('invoice/create', { error: dbError.message, pos, extractedData });
    }

    res.redirect('/invoice/list');
  });
};

export const listInvoices = async (req, res) => {
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*, purchase_orders(po_number)')
    .order('created_at', { ascending: false });

  if (error) return res.send('Error loading invoices');
  res.render('invoice/list', { invoices });
};