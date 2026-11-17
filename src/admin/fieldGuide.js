// Notes, examples, input clean-up and checks shown under every field in the admin panel.
// `note`     → what the field is and the format it accepts
// `example`  → a real example (multi-line examples use \n)
// `clean`    → tidies the input while typing (e.g. keeps digits only)
// `check`    → returns an error message when the value is not accepted (blocks Save)

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Specific fields (matched against the full path, e.g. "site.whatsapp.number"). First match wins.
const BY_PATH = [
  [/^site\.whatsapp\.number$/, {
    note: 'Digits only: country code 91 + 10-digit mobile number (12 digits). Spaces, + and - are removed automatically. Leave empty to switch WhatsApp ordering off.',
    example: '919876543210',
    clean: (v) => v.replace(/\D/g, '').slice(0, 15),
    check: (v) => (!v || /^91[6-9]\d{9}$/.test(v) ? '' : 'Enter 91 followed by the 10-digit mobile number (12 digits in total), e.g. 919876543210.'),
  }],
  [/^site\.whatsapp\.messages\.order$/, {
    note: 'Message that opens in WhatsApp when someone taps “Contact for Order”. Keep {name} and {price} exactly as written — they are replaced with the product’s name and price. Press Enter for a new line; *text* shows bold in WhatsApp.',
    example: 'Hi Florista! 🌸\n\nI’d like to order:\n*{name}*\nPrice: {price}\n\nCould you please share availability and delivery details?',
    check: (v) => (v.includes('{name}') ? '' : 'Keep {name} in the message so you know which product the customer wants.'),
  }],
  [/^site\.whatsapp\.messages\./, {
    note: 'Pre-filled WhatsApp message. Press Enter for a new line. *text* shows bold in WhatsApp. Emojis are fine.',
    example: 'Hi Florista! 🌸\n\nI’d like to enquire about a custom bouquet.\n\nOccasion:\nColours:\nDelivery date:',
  }],
  [/^site\.business\.email$/, {
    note: 'A full email address. Shown in the footer and on the Contact page, and enquiry form emails are sent here.',
    example: 'floristagifts@gmail.com',
    clean: (v) => v.replace(/\s/g, ''),
    check: (v) => (EMAIL.test(v) ? '' : 'Enter a valid email address, e.g. floristagifts@gmail.com'),
  }],
  [/^site\.business\.location$/, {
    note: 'City and state, as you want it shown in the footer and on the Contact page.',
    example: 'Ghaziabad, Uttar Pradesh',
  }],
  [/^site\.instagram\.handle$/, {
    note: 'Your Instagram username starting with @, no spaces.',
    example: '@florista_07',
    clean: (v) => v.replace(/\s/g, ''),
    check: (v) => (!v || /^@[A-Za-z0-9._]{1,30}$/.test(v) ? '' : 'Start with @ and use only letters, numbers, dots or underscores, e.g. @florista_07'),
  }],
  [/^site\.instagram\.url$/, {
    note: 'Full link to the Instagram profile (open your profile in a browser and copy the address).',
    example: 'https://www.instagram.com/florista_07/',
    clean: (v) => v.trim(),
    check: (v) => (!v || /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?(\?.*)?$/.test(v) ? '' : 'Paste the full link, e.g. https://www.instagram.com/florista_07/'),
  }],
  [/^site\.brand\.name$/, { note: 'Shop name. Used for the logo description for screen readers.', example: 'Florista' }],
  [/^site\.brand\.tagline$/, { note: 'Short lines under the logo in the footer. One line per row.', example: 'Flowers, candlelight & little joys.\nHandmade, just for you.' }],
  [/^site\.navLinks\.\d+\.label$/, { note: 'Text of this menu link (top menu and footer). 1–3 words. The page it opens stays the same.', example: 'Bouquets' }],
  [/^site\.footer\.exploreHeading$/, { note: 'Small heading above the footer menu.', example: 'Explore' }],
  [/^site\.footer\.owner$/, { note: 'Line shown in the footer above the copyright. Emojis are fine. Leave empty to hide it.', example: 'This shop is owned by Deepanshi 🌸' }],
  [/^site\.footer\.copyright$/, { note: 'Copyright line at the very bottom. Update the year yourself after editing.', example: '© 2026 Florista · Made with care.' }],
  [/^site\.contact\.heading$/, { note: 'Footer heading above your email and location.', example: 'Say hello' }],
  [/\.(bouquetFilters|candleFilters)\.\d+\.label$/, { note: 'Text on the filter button. New categories appear as tick boxes on each product in “Products & prices”.', example: 'Rose Bouquets' }],
  [/\.enquiryForm\.fields\.\d+\.label$/, { note: 'Label shown above this form box.', example: 'Full Name' }],
  [/\.enquiryForm\.fields\.\d+\.placeholder$/, { note: 'Grey hint shown inside the empty box.', example: 'Your full name' }],
  [/\.enquiryForm\.errors\./, { note: 'Shown in red under the box when the customer fills it in wrongly.', example: 'Please enter a valid email address.' }],
  [/\.enquiryForm\.(submit)$/, { note: 'Text on the send button. 1–3 words.', example: 'Send Enquiry' }],
  [/\.enquiryForm\.(sending)$/, { note: 'Button text while the enquiry is being sent.', example: 'Sending…' }],
  [/\.enquiryForm\.(success)$/, { note: 'Shown after the enquiry is sent successfully.', example: 'Thank you! We’ll be in touch soon.' }],
  [/\.enquiryForm\.successWithNumber$/, {
    note: 'Shown after sending, with the customer’s enquiry number. Keep {orderNo} exactly as written — it becomes e.g. FL-1001.',
    example: 'Thank you! Your enquiry number is {orderNo}. We’ve emailed you a copy and will be in touch within 24 hours.',
    check: (v) => (v.includes('{orderNo}') ? '' : 'Keep {orderNo} so the customer sees their enquiry number.'),
  }],
  [/\.enquiryForm\.(failure)$/, { note: 'Shown if the enquiry could not be sent.', example: 'Sorry, your enquiry couldn’t be sent. Please try again in a moment.' }],
  [/\.enquiryForm\.(privacy)$/, { note: 'Small privacy note under the form. Say how you use the customer’s details.', example: 'We only use your details to reply to your enquiry and never share them.' }],
  [/\.unit\.one$/, { note: 'Word used when exactly 1 item is shown (“01 creation”).', example: 'creation' }],
  [/\.unit\.other$/, { note: 'Word used for 0 or 2+ items (“06 creations”).', example: 'creations' }],
  [/\.editLabel$/, { note: 'Label above the products. The count is added automatically after it.', example: 'The bouquet edit' }],
  [/\.(cta|primaryCta|secondaryCta)\.label$/, { note: 'Text on the button. 1–4 words. Where the button goes stays the same.', example: 'Explore Collection' }],
  [/\.contactMethods\.items\.\d+\.value$/, { note: 'Text shown on the WhatsApp card (your number is never shown).', example: 'Chat with us on WhatsApp' }],
  [/\.stayInBloom\.items\.\d+\.value$/, { note: 'Text shown on the WhatsApp card (your number is never shown).', example: 'Chat with us on WhatsApp' }],
  [/\.items\.\d+\.title$|\.blocks\.\d+\.title$|\.features\.\d+\.title$/, { note: 'Short title, 2–5 words.', example: 'Made by hand' }],
  [/\.items\.\d+\.text$|\.blocks\.\d+\.text$|\.features\.\d+\.text$/, { note: 'One or two short sentences.', example: 'Care in every petal, detail and finishing touch.' }],
  [/\.(items|features)\.\d+\.number$/, { note: 'Small number shown above the title. Two digits look best.', example: '01' }],
];

// Everything else, matched by the field name.
const BY_KEY = {
  eyebrow: { note: 'Small label above the heading (shown in capitals). 2–6 words.', example: 'A handmade floral atelier' },
  title: { note: 'Main heading. To split it over two lines, put each part on its own row (press Enter).', example: 'Small wonders,\nmade by hand.' },
  quote: { note: 'Quote in italic. Type the “ ” marks yourself if you want them. Each row is one line.', example: '“Where flowers bloom,\nlittle joys follow.”' },
  tagline: { note: 'One short line shown in italic.', example: 'Flowers that stay. Gifts that mean more.' },
  body: { note: 'Short paragraph, 1–3 sentences.', example: 'Handmade flowers, personal bouquets and decorative candles — little creations for life’s most beautiful moments.' },
  intro: { note: 'Opening paragraph. 1–3 sentences.', example: 'Florista started at a kitchen table with a roll of crepe paper and a lot of love.' },
  note: { note: 'Small grey note. Leave empty to hide it.', example: 'Prices include gift wrapping.' },
  caption: { note: 'Short caption under the photo. 2–5 words.', example: 'Petals & possibilities' },
  heading: { note: 'Short heading.', example: 'Say hello' },
  label: { note: 'Short text, 1–4 words.', example: 'Bouquets' },
  text: { note: 'One short sentence.', example: 'Care in every petal, detail and finishing touch.' },
  value: { note: 'Text shown on the card.', example: 'Chat with us on WhatsApp' },
  number: { note: 'Small number shown above the title.', example: '01' },
};

export function guideFor(path, key) {
  for (const [pattern, guide] of BY_PATH) if (pattern.test(path)) return guide;
  return BY_KEY[key] || null;
}

/** Walks a section value and returns the first error message (used to block Save). */
export function firstError(value, path) {
  if (typeof value === 'string') {
    const guide = guideFor(path, path.split('.').pop());
    return guide?.check ? guide.check(value.trim()) : '';
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const err = firstError(value[i], `${path}.${i}`);
      if (err) return err;
    }
    return '';
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      const err = firstError(v, `${path}.${k}`);
      if (err) return err;
    }
  }
  return '';
}

// ---- notes for the Products, Photos and Security tabs ----
export const PRODUCT_GUIDE = {
  name: { note: 'Product name shown on the card. 2–5 words.', example: 'Blush paper roses' },
  price: { note: 'Write the price with ₹ and commas, or a range. Leave empty to show “Price on request”.', example: '₹1,499  or  ₹999 – ₹1,499' },
  description: { note: 'One short sentence under the name.', example: 'Soft rose petals, carefully made by hand.' },
  alt: { note: 'Describe the photo in a few words for blind visitors and Google. Don’t start with “image of”.', example: 'Pink paper roses wrapped in cream paper with a silk ribbon' },
  photo: { note: 'JPG, PNG or WebP. Any size — it is resized automatically. A landscape (wide) photo fits the card best.' },
  categories: { note: 'Tick every filter button this product should appear under. Add new categories in Website text → Categories.' },
  link: { note: 'Where the card goes when someone taps it (the “Contact for Order” button always opens WhatsApp).' },
  hidden: { note: 'Ticked = the product is not shown on the website, but stays saved here.' },
};

/** Photo tip from the shape of the spot on the website. */
export function photoShapeTip(image) {
  const ratio = image?.width && image?.height ? image.width / image.height : 1;
  if (ratio > 1.5) return 'Very wide spot — use a landscape photo (e.g. 1600×500). Top and bottom may be trimmed.';
  if (ratio > 1.15) return 'Landscape spot — a wide photo works best (e.g. 1600×1100).';
  if (ratio < 0.9) return 'Portrait spot — a tall photo works best (e.g. 1100×1400).';
  return 'Square-ish spot — a square photo works best (e.g. 1400×1400). Keep the main subject in the centre.';
}
