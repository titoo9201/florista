// Home page content. All copy is taken verbatim from the design.
import heroBouquet from '../assets/images/hero-florista-bouquet.webp';
import blushPaperRoses from '../assets/images/blush-paper-roses.webp';
import peonyCandle from '../assets/images/rose-candle.webp';
import yourKindOfBouquet from '../assets/images/your-kind-of-bouquet.webp';
import somethingBeautiful from '../assets/images/something-beautiful.webp';

export const hero = {
  eyebrow: 'A handmade floral atelier',
  title: ['Small wonders,', 'made by hand.'],
  tagline: 'Flowers that stay. Gifts that mean more.',
  body: 'Handmade flowers, personal bouquets and decorative candles — little creations for life’s most beautiful moments.',
  primaryCta: { label: 'Explore Collection', href: '#collection' },
  secondaryCta: { label: 'Contact Us', href: '#contact' },
  image: {
    src: heroBouquet,
    alt: 'A Florista bouquet of handmade pink and ivory ribbon roses with baby’s breath, wrapped in white paper with a gold edge, held up in a sunny garden.',
    width: 1086,
    height: 1038,
  },
};

export const intro = {
  eyebrow: 'Thoughtful by nature',
  title: ['Not just a gift.', 'A little piece of someone’s heart.'],
  body: 'For the everyday, the once-in-a-lifetime and everything in between. Discover handmade pieces with a personal touch, chosen to bring a little more beauty into your world.',
  features: [
    { number: '01', title: 'Made by hand', text: 'Care in every petal, detail and finishing touch.' },
    { number: '02', title: 'Made personal', text: 'Your colours, your occasion, your kind of beautiful.' },
    { number: '03', title: 'Made to delight', text: 'Meaningful little things, for you or someone you love.' },
  ],
};

export const collection = {
  id: 'collection',
  eyebrow: 'Little things to fall in love with',
  title: 'From our hands to your heart.',
  body: 'A preview of flowers, candlelight and thoughtful gifting.',
  note: 'Collection preview · Product names, prices and images are editable samples.',
  cta: { label: 'Contact for Order', href: '#contact', whatsapp: 'order' },
  products: [
    {
      id: 'blush-paper-roses',
      link: '/bouquets#blush-paper-roses',
      name: 'Blush paper roses',
      description: 'Soft rose petals, carefully made by hand.',
      price: '₹[price]',
      image: { src: blushPaperRoses, alt: 'Handmade blush paper roses wrapped in cream paper and tied with a pink silk ribbon.', width: 513, height: 401 },
    },
    {
      id: 'peony-candle',
      link: '/candles-decor#the-peony-candle',
      name: 'Peony candle',
      description: 'A sculptural bloom for a quiet corner.',
      price: '₹[price]',
      image: { src: peonyCandle, alt: 'A handmade deep red rose-shaped candle resting on a soft white rug.', width: 736, height: 574 },
    },
    {
      id: 'your-kind-of-bouquet',
      link: '/bouquets#pastel-meadow-bouquet',
      name: 'Your kind of bouquet',
      description: 'A personal palette for a special moment.',
      price: '₹[price]',
      image: { src: yourKindOfBouquet, alt: 'A hand-tied bouquet of pale pink blooms and lavender wrapped in raw linen on a table.', width: 513, height: 401 },
    },
  ],
};

export const customOrder = {
  eyebrow: 'Your colours. Your story.',
  title: ['Something beautiful,', 'just for you.'],
  body: 'A favourite shade, a heartfelt note, a special occasion. Let’s bring your idea to life with a handmade creation.',
  cta: { label: 'Let’s create together', href: '#contact', whatsapp: 'custom' },
  image: {
    src: somethingBeautiful,
    alt: 'Peach and ivory handmade roses in a speckled ceramic vase with a linen bow, beside a sunlit window.',
    width: 683,
    height: 500,
  },
};
