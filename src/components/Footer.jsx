import { NavLink } from 'react-router-dom';
import { brand, contact, developer, footer, navLinks, socials } from '../data/site';
import Logo from './Logo';
import SmartLink from './SmartLink';
import SocialIcon from './icons/SocialIcon';
import { socialHref } from '../lib/whatsapp';

/** Renders a link when `href` is set, plain text otherwise (for design placeholders). */
function MaybeLink({ href, className = '', children }) {
  return href ? (
    <SmartLink href={href} className={`${className} underline-offset-4 hover:underline`}>
      {children}
    </SmartLink>
  ) : (
    <span className={className}>{children}</span>
  );
}

const colHeading = 'text-[10px] leading-4 uppercase';

export default function Footer() {
  return (
    <footer className="bg-blush">
      <div className="container-page pt-14 pb-9 md:pt-16">
        <div className="grid gap-10 md:grid-cols-[1fr_180px_1fr] md:gap-8 xl:grid-cols-[460px_200px_1fr] xl:gap-0">
          <div>
            <Logo className="h-24 md:h-[112px]" />
            <p className="mt-[14px] text-sm leading-[22px]">
              {brand.tagline[0]}
              <br />
              {brand.tagline[1]}
            </p>
            <ul className="mt-[10px] flex flex-wrap items-center gap-x-[22px] gap-y-3 text-xs leading-5" aria-label="Social media">
              {socials.map((s) => (
                <li key={s.label}>
                  <MaybeLink href={socialHref(s)} className="inline-flex items-center gap-[2px]">
                    <SocialIcon name={s.icon} size={16} />
                    {s.label}
                  </MaybeLink>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className={colHeading}>
              {footer.exploreHeading}
            </h2>
            <ul className="mt-3 space-y-3 text-xs leading-4">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} end className="underline-offset-4 hover:underline">
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div id="contact">
            <h2 className={colHeading}>{contact.heading}</h2>
            <address className="mt-3 space-y-3 text-[13px] leading-[18px] not-italic">
              {contact.items.map((item) => (
                <p key={item.label}>
                  <MaybeLink href={item.href}>{item.label}</MaybeLink>
                </p>
              ))}
            </address>
          </div>
        </div>

        <div className="mt-[34px] flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-4">{footer.copyright}</p>

          {/* Developer credit */}
          <div className="flex items-center gap-2 text-[11px] leading-4 text-ink/80">
            <span>
              {developer.label} <span className="font-medium text-ink">{developer.name}</span>
            </span>
            <ul className="flex items-center" aria-label={`Contact ${developer.name}, the developer`}>
              {developer.links.map((l) => (
                <li key={l.label}>
                  <SmartLink
                    href={l.href}
                    title={`${l.label} — ${developer.name}`}
                    aria-label={`${developer.name} on ${l.label}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-cream hover:text-ink md:h-7 md:w-7"
                  >
                    <SocialIcon name={l.icon} size={14} />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
