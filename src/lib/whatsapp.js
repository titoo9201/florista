/**
 * WhatsApp helpers built from the current settings ({ number, messages }).
 * Use `useWhatsApp()` (ContentContext) in components so admin changes apply instantly.
 */
export function createWhatsApp(config) {
  const digits = String(config?.number ?? '').replace(/\D/g, '');
  const messages = config?.messages ?? {};
  const hasWhatsApp = digits.length >= 10;

  /** wa.me link that opens a chat with the seller with a pre-filled message. */
  function whatsappLink(messageKey = 'general', vars = {}) {
    const template = messages[messageKey] ?? messages.general ?? '';
    const text = template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  }

  /** WhatsApp link when the CTA has a `whatsapp` message key and a number is set, otherwise its normal href. */
  const ctaHref = (cta, vars) => (cta?.whatsapp && hasWhatsApp ? whatsappLink(cta.whatsapp, vars) : cta?.href);

  /** Social profile link — the WhatsApp entry is generated from the seller number. */
  const socialHref = (social) =>
    social.icon === 'whatsapp' ? (hasWhatsApp ? whatsappLink('general') : social.href) : social.href;

  return { hasWhatsApp, whatsappLink, ctaHref, socialHref };
}
