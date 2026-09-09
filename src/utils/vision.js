import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3.5-flash' });

export const extractInvoiceData = async (imageUrl, mimeType = 'image/jpeg') => {
  try {
    // 1. Download the image from Cloudinary
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);
    const base64Image = imageBuffer.toString('base64');

    // 2. Prompt for Gemini
    const prompt = `
      You are an expert OCR system. Extract the following fields from this invoice image and return them as a JSON object.
      Fields to extract:
      - invoiceNumber: The unique invoice number.
      - vendor: The name of the vendor or supplier.
      - totalAmount: The total amount due (just the number, without the currency symbol).
      - vat: The VAT or tax amount (just the number, without the currency symbol).
      - date: The invoice date in YYYY-MM-DD format.

      If a field is not present, return an empty string for it.
      Only return the valid JSON object, with no other text or explanation.
    `;

    // 3. Send to Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ]);

    const responseText = result.response.text().trim();
    const cleanResponseText = responseText.replace(/^```json\s*|\s*```$/g, '').trim();
    const extractedData = JSON.parse(cleanResponseText);

    return {
      invoiceNumber: extractedData.invoiceNumber || '',
      vendor: extractedData.vendor || '',
      totalAmount: extractedData.totalAmount || '',
      vat: extractedData.vat || '',
      date: extractedData.date || '',
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return { error: 'AI service failed. Enter manually.' };
  }
};