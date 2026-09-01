import dotenv from 'dotenv/config';
import {createClient} from '@supabase/supabase-js';

const supabase=createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

//lets show the create invoice form

export const getCreateInvoice=async (req,res)=>{
    //Get all form dropdown
    const {data:pos,error}=await supabase
    .from('purchase_orders')
    .select('id,po_number,vendor');

    if (error){
        return res.send('Error loading purchase orders');
    }
    res.render('invoice/create',{pos,error:null});

};

// Handle invoice creation
export const createInvoice=async (req,res)=>{
    const {invoice_number,po_id,vendor,invoice_date,total_amount,vat}=req.body;

    const {data,error}=await supabase
    .from('invoices')
    .insert([{
        invoice_number,
        po_id,
        vendor,
        invoice_date,
        total_amount,
        vat,

        uploaded_by:req.user.id

    }])
    if(error){
        //reload form with POS
        const {data:pos,error:posError}=await supabase
        .from('purchase_orders')
        .select('id,po_number,vendor')
        return res.render('invoice/create',{pos, error:error.message});
    }
    res.redirect('/invoice/list');


};

//list all the invoices
export const listInvoices= async (req,res)=>{
    const {data:invoices,error}=await supabase
    .from('invoices')
    .select('*, purchase_orders(po_number)')
    .order('created_at',{ascending:false});

    if(error){
        return res.send('error loading invoices');
    }
    res.render('invoice/list',{invoices});
};

