import { business, instagram } from './site';

// Contact page content. All copy is taken verbatim from the design ([bracketed] text = owner placeholders).

export const contactHero = {
  eyebrow: 'A conversation is a lovely beginning',
  title: ['Let’s Create', 'Something Beautiful'],
  body: 'A question, a special gift or an idea in bloom — we’d love to hear from you.',
};

export const contactMethods = {
  title: 'Say hello.',
  body: 'Choose the way that feels easiest for you.',
  note: '', // design had 'Contact details are editable placeholders.' — removed now that details are real
  // Add `href` (tel:, https://wa.me/…, mailto:, maps link, profile URL) and the card becomes a link.
  items: [
    // The number itself is never shown; the card opens a WhatsApp chat (number from .env.local).
    { title: 'WhatsApp', value: 'Chat with us on WhatsApp', whatsapp: true },
    { title: 'Email us', value: business.email, href: `mailto:${business.email}`, source: 'email' },
    { title: 'Find us', value: business.location, source: 'location' },
    { title: 'Instagram', value: instagram.handle, href: instagram.url, source: 'instagram' },
  ],
};

export const enquiryForm = {
  title: 'Tell us what you’re dreaming of.',
  body: 'Share a few details about your idea or enquiry.',
  fields: [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', autoComplete: 'name', required: true },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', autoComplete: 'email', required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '10-digit mobile number', autoComplete: 'tel', required: true },
    { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Colours you love, a gift note, or a custom idea…', full: true },
  ],
  // Step headings shown above each part of the form.
  steps: {
    products: 'What would you like?',
    details: 'Your details',
    delivery: 'Delivery',
    message: 'Anything else?',
  },
  picker: {
    label: 'Choose a product',
    placeholder: 'Choose a bouquet, candle or decor…',
    addAnother: 'Add another product',
    search: 'Search products',
    empty: 'No products match your search.',
    priceOnRequest: 'Price on request',
    quantity: 'Quantity',
    remove: 'Remove',
    total: 'Estimated total',
    totalNote: 'We confirm the final price with you before you pay.',
    custom: 'Not on the list? Describe your idea in the message below.',
  },
  delivery: {
    deliveryOption: 'Home delivery',
    deliveryHint: 'We deliver to your door',
    pickupOption: 'Pick up',
    pickupHint: 'Collect from our studio',
    recipient: 'Recipient name (if it’s a gift)',
    recipientPlaceholder: 'Who should receive it?',
    address: 'House / flat no. and street',
    addressPlaceholder: 'e.g. Flat 12, Shipra Riviera',
    area: 'Area / landmark',
    areaPlaceholder: 'e.g. Indirapuram, near Shipra Mall',
    city: 'City',
    cityDefault: 'Ghaziabad',
    pincode: 'Pincode',
    pincodePlaceholder: '6-digit pincode',
    date: 'Preferred date',
    occasion: 'Occasion',
    occasionPlaceholder: 'Choose an occasion (optional)',
    occasions: ['Birthday', 'Anniversary', 'Wedding', 'Thank you', 'Get well soon', 'Just because', 'Other'],
  },
  note: 'Please share only the details needed for your enquiry.',
  submit: 'Send Enquiry',
  privacy: '[Add your privacy notice and enquiry handling details here.]',
  // Sent by the API (server/index.js → /api/enquiry) to the email set in the admin panel.
  sending: 'Sending…',
  success: 'Thank you! We’ll be in touch soon.',
  // {orderNo} is replaced with the enquiry number, e.g. FL-1001.
  successWithNumber: 'Thank you! Your enquiry number is {orderNo}. We’ve emailed you a copy and will be in touch within 24 hours.',
  failure: 'Sorry, your enquiry couldn’t be sent. Please try again in a moment.',
  errors: {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address.',
    phone: 'Please enter a valid 10-digit phone number.',
    message: 'Please choose a product above, or tell us a little about your idea (at least 10 characters).',
    address: 'Please enter the delivery address.',
    city: 'Please enter the city.',
    pincode: 'Please enter a valid 6-digit pincode.',
    date: 'Please choose a date from today onwards.',
  },
};

export const stayInBloom = {
  title: 'Let’s stay in bloom.',
  body: 'For floral inspiration, handmade details and your next thoughtful gift.',
  // Profile URLs come from `socials` in site.js once added.
  items: [
    { icon: 'instagram', title: 'Instagram', value: instagram.handle, source: 'instagram' },
    { icon: 'whatsapp', title: 'WhatsApp', value: 'Chat with us on WhatsApp' },
  ],
};
