import emailjs from '@emailjs/browser';

// Values come from .env.local (see VITE_EMAILJS_* there). The public key is safe to ship to the browser;
// never put the EmailJS *private* key in this project.
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const isEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

/**
 * Sends the enquiry through EmailJS. Variable names match the "Contact Us" template:
 * {{name}} {{email}} {{phone}} {{product}} {{message}} {{submitted_at}}.
 * The customer "thank you" email is sent by the Auto-Reply linked to that template in EmailJS.
 */
export function sendEnquiry(values) {
  if (!isEmailConfigured) {
    return Promise.reject(new Error('EmailJS is not configured — check VITE_EMAILJS_* in .env.local'));
  }
  const params = {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || 'Not provided',
    product: values.product.trim() || 'Not specified',
    message: values.message.trim(),
    submitted_at: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }),
  };
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, params, { publicKey: PUBLIC_KEY });
}
