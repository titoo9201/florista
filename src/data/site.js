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

/** Business contact details — used in the footer and on the Contact page. */
export const business = {
  email: 'floristagifts@gmail.com',
  location: 'Ghaziabad, Uttar Pradesh',
};

export const contact = {
  heading: 'Say hello',
  // Items with `href` render as links.
  items: [
    { label: business.email, href: `mailto:${business.email}` },
    { label: business.location },
  ],
};

/**
 * WhatsApp ordering. The seller number comes from VITE_WHATSAPP_NUMBER in .env.local
 * (digits with country code, e.g. 919876543210). While it is empty, order buttons keep their
 * normal behaviour (scroll to "Say hello").
 * Messages: {name} and {price} are filled in from the product the customer clicked.
 */
export const whatsapp = {
  number: import.meta.env.VITE_WHATSAPP_NUMBER ?? '',
  messages: {
    general: 'Hi Florista! 🌸 I have a question about your handmade creations.',
    order:
      'Hi Florista! 🌸\n\nI’d like to order:\n*{name}*\nPrice: {price}\n\nCould you please share availability and delivery details? Thank you!',
    custom:
      'Hi Florista! 🌸\n\nI’d love a custom handmade creation.\n\nOccasion:\nFavourite colours:\nNeeded by (date):\n\nLooking forward to hearing from you!',
    customBouquet:
      'Hi Florista! 🌸\n\nI’d like to enquire about a custom bouquet.\n\nOccasion:\nColours / flowers:\nDelivery date & city:\n\nThank you!',
    gift:
      'Hi Florista! 🌸\n\nI’m looking for a thoughtful gift and would love your help.\n\nFor (who / occasion):\nBudget:\nNeeded by (date):\n\nThank you!',
  },
};

export const instagram = { handle: '@florista_07', url: 'https://www.instagram.com/florista_07/' };

// Add real profile URLs to `href` — items without one render as plain text.
// (The WhatsApp link is filled in automatically from `whatsapp.number` above.)
export const socials = [
  { label: 'Instagram', icon: 'instagram', href: instagram.url },
  { label: 'WhatsApp', icon: 'whatsapp', href: '' },
];

export const footer = {
  exploreHeading: 'Explore',
  copyright: `© ${new Date().getFullYear()} Florista · Made with care.`,
};

/** Small developer credit shown bottom-right in the footer on every page. */
export const developer = {
  label: 'Website by',
  name: 'Titoo',
  links: [
    { label: 'Email', icon: 'mail', href: 'mailto:titoos675@gmail.com' },
    { label: 'GitHub', icon: 'github', href: 'https://github.com/titoo9201' },
    { label: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/titoo_9201/' },
  ],
};
