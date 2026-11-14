import { contactMethods } from '../../data/contact';
import EnquiryForm from '../../components/EnquiryForm';
import Heading from '../../components/Heading';
import InfoCard from '../../components/InfoCard';
import Reveal from '../../components/Reveal';
import { hasWhatsApp, whatsappLink } from '../../lib/whatsapp';

// The WhatsApp card opens a chat once a number is set (.env.local) — the number is not displayed.
const withWhatsApp = ({ whatsapp, ...item }) =>
  whatsapp && hasWhatsApp ? { ...item, href: whatsappLink('general') } : item;

/** "Say hello." contact methods beside the enquiry form. */
export default function ContactMain() {
  return (
    <section aria-labelledby="say-hello-title" className="container-page py-16 md:py-20">
      <div className="grid items-start gap-12 lg:grid-cols-[410px_minmax(0,1fr)] lg:gap-14">
        <Reveal>
          <Heading
            id="say-hello-title"
            className="text-[36px] leading-[1.1] md:text-[40px] lg:-mt-1 xl:text-[42px] xl:leading-[50px]"
          >
            {contactMethods.title}
          </Heading>
          <p className="mt-4 text-sm leading-6 md:mt-[14px]">{contactMethods.body}</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-[22px] lg:grid-cols-1">
            {contactMethods.items.map((item) => (
              <li key={item.title}>
                <InfoCard {...withWhatsApp(item)} className="bg-card px-6 pt-[22px] pb-6" />
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
