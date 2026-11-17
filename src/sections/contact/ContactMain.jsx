import { useContactEmail, useSection, useWhatsApp } from '../../context/ContentContext';
import EnquiryForm from '../../components/EnquiryForm';
import Heading from '../../components/Heading';
import InfoCard from '../../components/InfoCard';
import Reveal from '../../components/Reveal';

/** "Say hello." contact methods beside the enquiry form. */
export default function ContactMain() {
  const contactMethods = useSection('contact.contactMethods');
  const business = useSection('site.business');
  const email = useContactEmail();
  const instagram = useSection('site.instagram');
  const { hasWhatsApp, whatsappLink } = useWhatsApp();

  // Email/location/Instagram card values come from the "Contact & WhatsApp" settings; the WhatsApp
  // card opens a chat (the number itself is not displayed).
  const resolve = ({ whatsapp, source, ...item }) => {
    if (whatsapp) return hasWhatsApp ? { ...item, href: whatsappLink('general') } : item;
    if (source === 'email') return { ...item, value: email, href: email ? `mailto:${email}` : undefined };
    if (source === 'location') return { ...item, value: business.location };
    if (source === 'instagram') return { ...item, value: instagram.handle, href: instagram.url };
    return item;
  };
  return (
    <section aria-labelledby="say-hello-title" className="container-page py-16 md:py-20">
      <div className="grid items-start gap-12 lg:grid-cols-[410px_minmax(0,1fr)] lg:gap-14">
        <Reveal>
          <Heading
            id="say-hello-title"
            className="text-[clamp(2.25rem,9vw,2.75rem)] leading-[1.1] md:text-[40px] lg:-mt-1 xl:text-[42px] xl:leading-[50px]"
          >
            {contactMethods.title}
          </Heading>
          <p className="mt-4 text-sm leading-6 md:mt-[14px]">{contactMethods.body}</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-[22px] lg:grid-cols-1">
            {contactMethods.items.map((item) => (
              <li key={item.title}>
                <InfoCard {...resolve(item)} className="bg-card px-6 pt-[22px] pb-6" />
              </li>
            ))}
          </ul>
          {contactMethods.note && <p className="mt-5 text-[11px] leading-5 lg:mt-[22px]">{contactMethods.note}</p>}
        </Reveal>

        <Reveal delay={0.1}>
          <EnquiryForm />
        </Reveal>
      </div>
    </section>
  );
}
