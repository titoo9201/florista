import { apiFetch } from './contentApi';

/**
 * Sends the Contact-page enquiry to the Florista API, which emails it (via EmailJS, from the server)
 * to the address set in the admin panel. No email keys live in the website code.
 */
export function sendEnquiry(values) {
  return apiFetch('/api/enquiry', {
    method: 'POST',
    body: JSON.stringify({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      product: values.product.trim(),
      message: values.message.trim(),
    }),
  });
}
