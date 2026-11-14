// Inspiration page content. All copy is taken verbatim from the design.
import momentOfBeauty from '../assets/images/inspiration/moment-of-beauty.webp';
import petalsPatientlyMade from '../assets/images/inspiration/petals-patiently-made.webp';
import ribbonTiedFeeling from '../assets/images/inspiration/ribbon-tied-feeling.webp';
import armfulOfBeautiful from '../assets/images/inspiration/armful-of-beautiful.webp';
import everyPetal from '../assets/images/inspiration/every-petal.webp';
// Same photograph as the Home page "Something beautiful" image.
import softGardenShades from '../assets/images/something-beautiful.webp';

export const inspirationHero = {
  eyebrow: 'Pause. Breathe. Bloom.',
  title: ['A Little World', 'of Flowers'],
  body: 'A little beauty, a little happiness, a little inspiration — in every bloom.',
};

export const momentOfBeautySection = {
  link: '/bouquets#bouquet-collection',
  eyebrow: 'A moment of beauty',
  quote: ['“Where flowers bloom,', 'little joys follow.”'],
  body: 'A little reminder to make room for beautiful things.',
  image: {
    src: momentOfBeauty,
    alt: 'Blush garden roses, ranunculus and greenery in a speckled ceramic vase on a linen-covered table in a sunlit room.',
    width: 678,
    height: 425,
  },
};

/**
 * Moodboard tiles. `column` (1–3) and `tall` reproduce the staggered desktop layout;
 * on smaller screens tiles are shown in number order.
 */
export const moodboard = {
  eyebrow: 'Colours, textures & little details',
  title: 'A moodboard in bloom.',
  body: 'A collection of gentle colours and handmade possibilities.',
  note: 'Illustrative photography · Replace these image fills with your own flower photographs.',
  items: [
    {
      number: '01',
      link: '/bouquets#blush-paper-roses',
      title: 'Blush & ivory',
      column: 1,
      tall: true,
      image: { src: everyPetal, alt: 'Blush paper roses wrapped in ivory paper with a trailing pink silk ribbon.', width: 513, height: 425, position: 'center' },
    },
    {
      number: '02',
      link: '/bouquets#bouquet-collection',
      title: 'Petals, patiently made',
      column: 2,
      image: { src: petalsPatientlyMade, alt: 'Hands shaping a pale pink paper petal at a workbench beside finished roses.', width: 513, height: 277, position: 'bottom' },
    },
    {
      number: '03',
      link: '/bouquets#ivory-garden-bouquet',
      title: 'Soft garden shades',
      column: 3,
      image: { src: softGardenShades, alt: 'Peach and ivory handmade roses in a speckled vase beside a window.', width: 683, height: 500, position: 'center' },
    },
    {
      number: '04',
      link: '/bouquets#pastel-meadow-bouquet',
      title: 'A ribbon-tied feeling',
      column: 1,
      tall: true,
      image: { src: ribbonTiedFeeling, alt: 'A hand-tied bouquet of pale pink blooms and lavender wrapped in raw linen with a twine bow.', width: 514, height: 575, position: 'center' },
    },
    {
      number: '05',
      link: '/bouquets#bouquet-collection',
      title: 'An armful of beautiful',
      column: 2,
      tall: true,
      image: { src: armfulOfBeautiful, alt: 'A generous arrangement of garden roses and greenery in a ceramic vase, with brass scissors on the table.', width: 513, height: 575, position: 'center' },
    },
    {
      number: '06',
      link: '/bouquets#your-signature-bouquet',
      title: 'Every petal, a possibility',
      column: 3,
      image: { src: everyPetal, alt: 'A bouquet of blush and peach roses wrapped in cream paper and tied with a pink ribbon.', width: 513, height: 425, position: 'center' },
    },
  ],
};

export const closingQuote = {
  quote: ['“The smallest bloom can', 'brighten an ordinary day.”'],
  body: 'Found a colour or a feeling you love? Let’s turn it into something handmade.',
  cta: { label: 'Find your bouquet', href: '/bouquets' },
};
