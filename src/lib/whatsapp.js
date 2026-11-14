import { whatsapp } from '../data/site';

const digits = whatsapp.number.replace(/\D/g, '');

/** True once a seller number is set in src/data/site.js. */
export const hasWhatsApp = digits.length >= 10;

/** wa.me link that opens a chat with the seller with a pre-filled message. */
export function whatsappLink(messageKey = 'general', vars = {}) {
  const template = whatsapp.messages[messageKey] ?? whatsapp.messages.general;
  const text = template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/**
 * Resolves a CTA's link: WhatsApp (when the CTA has a `whatsapp` message key and a number is set),
 * otherwise its normal `href`.
 */
export function ctaHref(cta, vars) {
  return cta.whatsapp && hasWhatsApp ? whatsappLink(cta.whatsapp, vars) : cta.href;
}

/** Social profile link — the WhatsApp entry is generated from the seller number. */
export function socialHref(social) {
  if (social.icon === 'whatsapp') return hasWhatsApp ? whatsappLink('general') : social.href;
  return social.href;
}
