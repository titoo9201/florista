import SmartLink from './SmartLink';
import SocialIcon from './icons/SocialIcon';

/**
 * Small rounded card: optional icon, serif title and a value line.
 * Renders as a link when `href` is provided. `align="center"` for the social cards.
 */
export default function InfoCard({ title, value, href, icon, align = 'left', className = '' }) {
  const centered = align === 'center';
  const content = (
    <>
      {icon && <SocialIcon name={icon} size={20} className={centered ? 'mx-auto mb-2' : 'mb-3'} />}
      <h3 className={`font-serif font-normal ${centered ? 'text-[28px] leading-8' : 'text-2xl leading-8'}`}>
        {title}
      </h3>
      <p className={centered ? 'mt-2 text-xs leading-5' : 'text-sm leading-6'}>{value}</p>
    </>
  );
  const classes = `block h-full rounded-card ${centered ? 'text-center' : ''} ${className}`;

  return href ? (
    <SmartLink href={href} className={`${classes} transition-shadow duration-200 hover:shadow-card-hover`}>
      {content}
    </SmartLink>
  ) : (
    <div className={classes}>{content}</div>
  );
}
