// Global site content (navbar + footer). All copy is taken verbatim from the design.
export const brand = {
  name: 'Florista',
  tagline: ['Flowers, candlelight & little joys.', 'Handmade, just for you.'],
};

export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Inspiration', to: '/inspiration' },
  { label: 'Bouquets', to: '/bouquets' },
  { label: 'Candles & Decor', to: '/candles-decor' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
];

export const contact = {
  heading: 'Say hello',
  items: [
    // Add `href` (e.g. 'mailto:…' / 'tel:…') once real details exist — items render as links automatically.
    { label: '[Email address]' },
    { label: '[+91 phone number]' },
    { label: '[City, State, India]' },
  ],
};

// Add real profile URLs to `href` — items without one render as plain text.
export const socials = [
  { label: 'Instagram', icon: 'instagram', href: '' },
  { label: 'Facebook', icon: 'facebook', href: '' },
  { label: 'WhatsApp', icon: 'whatsapp', href: '' },
];

export const footer = {
  exploreHeading: 'Explore',
  copyright: `© ${new Date().getFullYear()} Florista · Made with care.`,
};
