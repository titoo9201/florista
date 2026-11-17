// Registry of everything the admin panel can edit.
// The built-in text lives in src/data/*; admins' changes are saved per section in MongoDB and
// merged on top (see merge.js). Products are managed separately (Products tab).
import * as site from '../data/site';
import * as home from '../data/home';
import * as inspiration from '../data/inspiration';
import * as bouquets from '../data/bouquets';
import * as candles from '../data/candles';
import * as about from '../data/about';
import * as contact from '../data/contact';

const omit = (obj, ...keys) => {
  const copy = { ...obj };
  keys.forEach((k) => delete copy[k]);
  return copy;
};

/**
 * page   → admin sidebar group
 * label  → admin section title
 * list   → for lists: { add: true, template } lets the admin add/remove items
 * hide   → extra field names to keep out of the editor for this section
 */
export const SECTIONS = [
  // ----- Contact & WhatsApp (site-wide settings) -----
  { path: 'site.whatsapp', page: 'Contact & WhatsApp', label: 'WhatsApp number & order messages', value: site.whatsapp },
  // The business email is developer-only (ENQUIRY_TO_EMAIL on the server), so only the location is editable here.
  { path: 'site.business', page: 'Contact & WhatsApp', label: 'Location', value: { location: site.business.location }, hide: ['email'] },
  { path: 'site.instagram', page: 'Contact & WhatsApp', label: 'Instagram', value: site.instagram },

  // ----- Site-wide -----
  { path: 'site.brand', page: 'Header & footer', label: 'Brand name & tagline', value: site.brand },
  { path: 'site.navLinks', page: 'Header & footer', label: 'Menu labels', value: site.navLinks },
  { path: 'site.contact', page: 'Header & footer', label: 'Footer “Say hello” heading', value: { heading: site.contact.heading } },
  { path: 'site.footer', page: 'Header & footer', label: 'Footer texts', value: site.footer },

  // ----- Home -----
  { path: 'home.hero', page: 'Home', label: 'Top banner', value: home.hero },
  { path: 'home.intro', page: 'Home', label: '“Thoughtful by nature”', value: home.intro, list: { features: { add: true, template: { number: '', title: '', text: '' } } } },
  { path: 'home.collection', page: 'Home', label: '“From our hands to your heart” (texts)', value: omit(home.collection, 'products') },
  { path: 'home.customOrder', page: 'Home', label: '“Something beautiful, just for you”', value: home.customOrder },

  // ----- Inspiration -----
  { path: 'inspiration.inspirationHero', page: 'Inspiration', label: 'Top banner', value: inspiration.inspirationHero },
  { path: 'inspiration.momentOfBeautySection', page: 'Inspiration', label: '“A moment of beauty”', value: inspiration.momentOfBeautySection },
  { path: 'inspiration.moodboard', page: 'Inspiration', label: 'Moodboard', value: inspiration.moodboard, hide: ['number'] }, // number links each tile to its photo
  { path: 'inspiration.closingQuote', page: 'Inspiration', label: 'Closing quote', value: inspiration.closingQuote },

  // ----- Bouquets -----
  { path: 'bouquets.bouquetsHero', page: 'Bouquets', label: 'Top banner', value: bouquets.bouquetsHero },
  { path: 'bouquets.bouquetFilters', page: 'Bouquets', label: 'Categories (filter buttons)', value: bouquets.bouquetFilters, list: { _root: { add: true, template: { id: '', label: '' } } } },
  { path: 'bouquets.bouquetCollection', page: 'Bouquets', label: 'Collection texts', value: omit(bouquets.bouquetCollection, 'items') },
  { path: 'bouquets.bouquetsCta', page: 'Bouquets', label: 'Bottom call-to-action', value: bouquets.bouquetsCta },

  // ----- Candles & Decor -----
  { path: 'candles.candlesHero', page: 'Candles & Decor', label: 'Top banner', value: candles.candlesHero },
  { path: 'candles.candleFilters', page: 'Candles & Decor', label: 'Categories (filter buttons)', value: candles.candleFilters, list: { _root: { add: true, template: { id: '', label: '' } } } },
  { path: 'candles.candleCollection', page: 'Candles & Decor', label: 'Collection texts', value: omit(candles.candleCollection, 'items') },
  { path: 'candles.candlesCta', page: 'Candles & Decor', label: 'Bottom call-to-action', value: candles.candlesCta },

  // ----- About -----
  { path: 'about.aboutHero', page: 'About Us', label: 'Top banner', value: about.aboutHero },
  { path: 'about.makerNote', page: 'About Us', label: '“A note from the maker”', value: about.makerNote, list: { blocks: { add: true, template: { title: '', text: '' } } } },
  { path: 'about.aboutValues', page: 'About Us', label: '“Made with meaning” values', value: about.aboutValues, list: { items: { add: true, template: { number: '', title: '', text: '' } } } },
  { path: 'about.aboutGallery', page: 'About Us', label: 'Gallery texts', value: about.aboutGallery },
  { path: 'about.aboutClosing', page: 'About Us', label: 'Closing quote', value: about.aboutClosing },

  // ----- Contact -----
  { path: 'contact.contactHero', page: 'Contact Us', label: 'Top banner', value: contact.contactHero },
  { path: 'contact.contactMethods', page: 'Contact Us', label: '“Say hello” cards', value: contact.contactMethods },
  { path: 'contact.enquiryForm', page: 'Contact Us', label: 'Enquiry form texts', value: contact.enquiryForm },
  { path: 'contact.stayInBloom', page: 'Contact Us', label: '“Let’s stay in bloom”', value: contact.stayInBloom },
];

export const DEFAULTS = Object.fromEntries(SECTIONS.map((s) => [s.path, s.value]));

/** Every photo on the website that the admin can replace (Photos tab). Keys are stored in MongoDB. */
export const IMAGE_SLOTS = [
  { key: 'home.hero', page: 'Home', label: 'Top banner photo (arch)', image: home.hero.image },
  { key: 'home.custom-order', page: 'Home', label: '“Something beautiful” photo', image: home.customOrder.image },
  { key: 'inspiration.moment', page: 'Inspiration', label: '“A moment of beauty” photo', image: inspiration.momentOfBeautySection.image },
  ...inspiration.moodboard.items.map((item) => ({
    key: `inspiration.moodboard.${item.number}`,
    page: 'Inspiration',
    label: `Moodboard photo ${item.number}`,
    image: item.image,
  })),
  { key: 'bouquets.hero', page: 'Bouquets', label: 'Top banner photo', image: bouquets.bouquetsHero.image },
  { key: 'candles.hero', page: 'Candles & Decor', label: 'Top banner photo', image: candles.candlesHero.image },
  { key: 'about.story', page: 'About Us', label: '“Our Story” wide photo', image: about.aboutHero.image },
  { key: 'about.maker', page: 'About Us', label: '“A note from the maker” photo', image: about.makerNote.image },
  ...about.aboutGallery.items.map((item, i) => ({
    key: `about.gallery.${i + 1}`,
    page: 'About Us',
    label: `Gallery photo ${i + 1}`,
    image: item.image,
  })),
];
