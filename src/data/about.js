// About Us page content. All copy is taken verbatim from the design ([bracketed] text = owner placeholders).
import ourStory from '../assets/images/about/our-story.webp';
import maker from '../assets/images/about/note-from-the-maker.webp';
import petals from '../assets/images/about/petals-and-possibilities.webp';
import warmth from '../assets/images/about/little-moments-of-warmth.webp';
import giving from '../assets/images/about/thoughtful-things-to-give.webp';

export const aboutHero = {
  eyebrow: 'The heart behind the handmade',
  title: 'Our Story',
  body: 'A love for flowers, thoughtful details and beautiful little things.',
  image: {
    src: ourStory,
    alt: 'Close-up of a lush arrangement of blush garden roses, ivory ranunculus and sweet peas in a speckled vase.',
    width: 1601,
    height: 480,
  },
};

export const makerNote = {
  eyebrow: 'A note from the maker',
  title: ['Hello, we’re', 'Florista.'],
  intro: '[Introduce your business and the person or people behind these handmade creations.]',
  blocks: [
    {
      title: 'How it all began',
      text: '[Share what inspired your business and how your creative journey began. Add your own story here.]',
    },
    {
      title: 'Our world of handmade',
      text: 'Handmade flowers, personalised bouquets, decorative candles and thoughtful pieces for the home.',
    },
  ],
  image: {
    src: maker,
    alt: 'Hands shaping a blush paper rose at a linen-covered worktable with ribbon spools, scissors and finished roses.',
    width: 730,
    height: 701,
  },
};

export const aboutValues = {
  eyebrow: 'The little things matter',
  title: 'Made with meaning.',
  body: 'The spirit behind every handmade creation.',
  items: [
    { number: '01', title: 'Creativity', text: 'Finding beauty in unexpected colours, textures and little details.' },
    { number: '02', title: 'Handmade with Love', text: 'Celebrating the personal touch that makes handmade feel different.' },
    { number: '03', title: 'Attention to Detail', text: 'From the first petal to the final ribbon, little things matter.' },
    { number: '04', title: 'Customer Happiness', text: 'Creating a gift that feels as special as the person receiving it.' },
  ],
};

export const aboutGallery = {
  eyebrow: 'Flowers, candlelight & creative days',
  title: 'A little glimpse of our world.',
  body: 'Illustrative images, ready for your own brand photographs.',
  items: [
    { caption: 'Petals & possibilities', link: '/bouquets#ivory-garden-bouquet', image: { src: petals, alt: 'Peach and ivory handmade roses in a speckled vase beside a window.', width: 514, height: 476 } },
    { caption: 'Little moments of warmth', link: '/candles-decor#the-peony-candle', image: { src: warmth, alt: 'A cream peony candle on travertine stone with scattered rose petals.', width: 513, height: 476 } },
    { caption: 'Thoughtful things to give', link: '/candles-decor#the-thoughtful-gift-edit', image: { src: giving, alt: 'An open gift box with a flower candle, a small ribboned bouquet and a ceramic dish.', width: 513, height: 476 } },
  ],
};

export const aboutClosing = {
  quote: ['A little handmade happiness,', 'from our world to yours.'],
  body: 'Flowers to give. Candlelight to keep. Little joys to share.',
  cta: { label: 'Discover our creations', href: '/bouquets' },
};
