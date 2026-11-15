// Candles & Decor page content. All copy is taken verbatim from the design.
import heroImage from '../assets/images/candles/candles-hero.webp';
import botanicalDuo from '../assets/images/candles/botanical-candle-duo.webp';
import seasideGlow from '../assets/images/candles/seaside-glow.webp';
import ceramicJar from '../assets/images/candles/ceramic-jar-candle.webp';
import giftEdit from '../assets/images/candles/thoughtful-gift-edit.webp';
// Same photograph as the Home page "Peony candle" card.
import peonyCandle from '../assets/images/rose-candle.webp';

export const candlesHero = {
  eyebrow: 'A little warmth. A little wonder.',
  title: ['Handmade', 'Candles & Decor'],
  body: 'Little details that make your space beautiful.',
  image: {
    src: heroImage,
    alt: 'Two ribbed pillar candles and a pink flower candle on a speckled ceramic tray, with dried hydrangea and eucalyptus on a linen table.',
    width: 616,
    height: 426,
  },
};

/** Filter pills. `id: 'all'` shows everything; other ids match `categories` on each item. */
export const candleFilters = [
  { id: 'all', label: 'All creations' },
  { id: 'decorative-candles', label: 'Decorative Candles' },
  { id: 'floral-candles', label: 'Floral Candles' },
  { id: 'decor', label: 'Handmade Decorative Items' },
  { id: 'gifts', label: 'Gift Items' },
  { id: 'other', label: 'Other Creative Products' },
];

export const candleCollection = {
  editLabel: 'The candle & decor edit',
  unit: { one: 'creation', other: 'creations' },
  note: 'Preview collection · Names, images and ₹[price] await owner details.',
  cta: { label: 'Contact for Order', href: '#contact', whatsapp: 'order' },
  // NOTE: category tags are placeholders (the design doesn't specify them) — adjust freely.
  items: [
    {
      id: 'the-peony-candle',
      name: 'The peony candle',
      description: 'A sculptural flower for your favourite corner.',
      price: '₹[price]',
      categories: ['decorative-candles', 'floral-candles'],
      image: { src: peonyCandle, alt: 'A handmade deep red rose-shaped candle resting on a soft white rug.', width: 736, height: 574 },
    },
    {
      id: 'botanical-candle-duo',
      name: 'Botanical candle duo',
      description: 'Gentle shapes for a thoughtfully styled space.',
      price: '₹[price]',
      categories: ['decorative-candles'],
      image: { src: botanicalDuo, alt: 'Two ribbed ivory pillar candles on a speckled tray beside a small pink flower candle.', width: 513, height: 400 },
    },
    {
      id: 'a-little-seaside-glow',
      name: 'A little seaside glow',
      description: 'Soft shell shapes, made to be displayed.',
      price: '₹[price]',
      categories: ['decorative-candles', 'other'],
      image: { src: seasideGlow, alt: 'Ivory nautilus and blush scallop shell candles on a travertine stand.', width: 514, height: 400 },
    },
    {
      id: 'the-ceramic-jar-candle',
      name: 'The ceramic jar candle',
      description: 'A simple little moment of candlelight.',
      price: '₹[price]',
      categories: ['decorative-candles'],
      image: { src: ceramicJar, alt: 'A speckled ceramic jar candle beside a single pink rose in a small vase and dried rosebuds.', width: 513, height: 400 },
    },
    {
      id: 'the-thoughtful-gift-edit',
      name: 'The thoughtful gift edit',
      description: 'Flowers, candlelight and a personal touch.',
      price: '₹[price]',
      categories: ['gifts', 'floral-candles'],
      image: { src: giftEdit, alt: 'An open gift box holding a pink flower candle, a small bouquet with a ribbon and a ceramic dish.', width: 513, height: 400 },
    },
    {
      id: 'the-quiet-corner-edit',
      name: 'The quiet corner edit',
      description: 'A decorative tray and handmade candle pairing.',
      price: '₹[price]',
      categories: ['decor'],
      image: { src: botanicalDuo, alt: 'A speckled ceramic tray styled with ribbed pillar candles and a flower candle.', width: 513, height: 400 },
    },
  ],
};

export const candlesCta = {
  title: 'Little details. Beautiful feelings.',
  body: 'Looking for a personal gift or a special finishing touch? Tell us about the little things you love.',
  cta: { label: 'Let’s find your perfect gift', href: '#contact', whatsapp: 'gift' },
};
