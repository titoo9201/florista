import { apiFetch } from './contentApi';

/**
 * Sends the Contact-page enquiry to the Florista API, which emails it (via EmailJS, from the server)
 * to the address set in the admin panel. No email keys live in the website code.
 */
export function sendEnquiry(values) {
  const trim = (v) => String(v ?? '').trim();
  const delivery =
    values.method === 'pickup'
      ? { method: 'pickup' }
      : { method: 'delivery', recipient: trim(values.recipient), address: trim(values.address), area: trim(values.area), city: trim(values.city), pincode: trim(values.pincode) };
  // Resolves to { ok, orderNo }. Only ids + quantities are sent; the server looks up names and prices.
  return apiFetch('/api/enquiry', {
    method: 'POST',
    body: JSON.stringify({
      name: trim(values.name),
      email: trim(values.email),
      phone: trim(values.phone),
      items: (values.items || []).map(({ id, qty, name, price }) => ({ id, qty, name, price })),
      delivery,
      date: trim(values.date),
      occasion: trim(values.occasion),
      message: trim(values.message),
    }),
  });
}
