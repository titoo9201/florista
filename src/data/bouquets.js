// Bouquets page content. All copy is taken verbatim from the design.
import heroImage from '../assets/images/bouquets/bouquets-hero.webp';
// Card photos are the same images used on the Home page.
import blushPaperRoses from '../assets/images/blush-paper-roses.webp';
import pastelMeadow from '../assets/images/your-kind-of-bouquet.webp';
import ivoryGarden from '../assets/images/something-beautiful.webp';

export const bouquetsHero = {
  eyebrow: 'Flowers with a personal touch',
  title: ['Our Beautiful', 'Bouquets'],
  body: 'Handcrafted with love, made to make every moment special.',
  image: {
    src: heroImage,
    alt: 'A bouquet of blush and peach roses with eucalyptus, wrapped in cream paper and tied with a pink silk ribbon.',
    width: 617,
    height: 426,
  },
};

/** Filter pills. `id: 'all'` shows everything; other ids match `categories` on each bouquet. */
export const bouquetFilters = [
  { id: 'all', label: 'All bouquets' },
  { id: 'handmade', label: 'Handmade Flower Bouquets' },
  { id: 'rose', label: 'Rose Bouquets' },
  { id: 'customized', label: 'Customized Bouquets' },
  { id: 'special-occasion', label: 'Special Occasion Flowers' },
  { id: 'other', label: 'Other Handmade Flower Arrangements' },
];

export const bouquetCollection = {
  editLabel: 'The bouquet edit',
  unit: { one: 'creation', other: 'creations' },
  note: 'Preview collection · Names, images and ₹[price] await owner details.',
  cta: { label: 'Contact for Order', href: '#contact', whatsapp: 'order' },
  // NOTE: category tags are placeholders (the design doesn't specify them) — adjust freely.
  items: [
    {
      id: 'blush-paper-roses',
      name: 'Blush paper roses',
      description: 'A soft rose bouquet with a ribbon finish.',
      price: '₹[price]',
      categories: ['handmade', 'rose'],
      image: { src: blushPaperRoses, alt: 'Blush paper roses wrapped in cream paper and tied with a pink silk ribbon.', width: 513, height: 401 },
    },
    {
      id: 'ivory-garden-bouquet',
      name: 'Ivory garden bouquet',
      description: 'Gentle ivory blooms with a touch of green.',
      price: '₹[price]',
      categories: ['handmade'],
      image: { src: ivoryGarden, alt: 'Ivory and peach handmade roses with sage leaves in a speckled ceramic vase by a window.', width: 683, height: 500 },
    },
    {
      id: 'pastel-meadow-bouquet',
      name: 'Pastel meadow bouquet',
      description: 'A little wildflower-inspired happiness.',
      price: '₹[price]',
      categories: ['handmade'],
      image: { src: pastelMeadow, alt: 'A hand-tied pastel bouquet with lavender, wrapped in raw linen on a table.', width: 513, height: 401 },
    },
    {
      id: 'your-signature-bouquet',
      name: 'Your signature bouquet',
      description: 'Your favourite colours, brought together.',
      price: '₹[price]',
      categories: ['customized', 'rose'],
      image: { src: blushPaperRoses, alt: 'A bouquet of blush and peach roses wrapped in cream paper with a pink ribbon.', width: 513, height: 401 },
    },
    {
      id: 'a-celebration-in-bloom',
      name: 'A celebration in bloom',
      description: 'A thoughtful floral gesture for your occasion.',
      price: '₹[price]',
      categories: ['special-occasion'],
      image: { src: pastelMeadow, alt: 'A soft pink and ivory bouquet tied with twine and linen, resting on a table.', width: 513, height: 401 },
    },
    {
      id: 'the-little-floral-arrangement',
      name: 'The little floral arrangement',
      description: 'Handmade blooms for a favourite corner.',
      price: '₹[price]',
      categories: ['other'],
      image: { src: ivoryGarden, alt: 'A small arrangement of handmade peach and ivory roses in a ceramic vase.', width: 683, height: 500 },
    },
  ],
};

export const bouquetsCta = {
  title: 'Your colours. Your occasion. Your bouquet.',
  body: 'Tell us what you have in mind. Let’s dream up a handmade arrangement that feels just right.',
  cta: { label: 'Enquire about a custom bouquet', href: '#contact', whatsapp: 'customBouquet' },
};
