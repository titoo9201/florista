// Contact page content. All copy is taken verbatim from the design ([bracketed] text = owner placeholders).

export const contactHero = {
  eyebrow: 'A conversation is a lovely beginning',
  title: ['Let’s Create', 'Something Beautiful'],
  body: 'A question, a special gift or an idea in bloom — we’d love to hear from you.',
};

export const contactMethods = {
  title: 'Say hello.',
  body: 'Choose the way that feels easiest for you.',
  note: 'Contact details are editable placeholders.',
  // Add `href` (tel:, https://wa.me/…, mailto:, maps link, profile URL) and the card becomes a link.
  items: [
    { title: 'Call us', value: '[+91 business phone number]' },
    { title: 'WhatsApp', value: '[+91 WhatsApp number]' },
    { title: 'Email us', value: '[Business email address]' },
    { title: 'Find us', value: '[Business address, City, State, PIN]' },
    { title: 'Instagram', value: '[@your_business_profile]' },
  ],
};

export const enquiryForm = {
  title: 'Tell us what you’re dreaming of.',
  body: 'Share a few details about your idea or enquiry.',
  fields: [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', autoComplete: 'name', required: true },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', autoComplete: 'email', required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 Your phone number', autoComplete: 'tel' },
    { name: 'product', label: 'Product Interested In', type: 'text', placeholder: 'Bouquets, candles or decor…' },
    { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Tell us about your occasion, colours or idea…', required: true, full: true },
  ],
  note: 'Please share only the details needed for your enquiry.',
  submit: 'Send Enquiry',
  privacy: '[Add your privacy notice and enquiry handling details here.]',
  // Front-end only: there is no backend yet, so nothing is sent anywhere.
  success: 'Thank you! We’ll be in touch soon.',
  errors: {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address.',
    phone: 'Please enter a valid 10-digit phone number.',
    message: 'Please tell us a little about your enquiry (at least 10 characters).',
  },
};

export const stayInBloom = {
  title: 'Let’s stay in bloom.',
  body: 'For floral inspiration, handmade details and your next thoughtful gift.',
  // Profile URLs come from `socials` in site.js once added.
  items: [
    { icon: 'instagram', title: 'Instagram', value: '[Add Instagram profile link]' },
    { icon: 'facebook', title: 'Facebook', value: '[Add Facebook profile link]' },
    { icon: 'whatsapp', title: 'WhatsApp', value: '[Add WhatsApp profile link]' },
  ],
};
