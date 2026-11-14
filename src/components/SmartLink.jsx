import { Link } from 'react-router-dom';

/** Uses the router for internal paths ("/about"), a plain anchor for "#hash", mailto:, tel: and external URLs. */
export default function SmartLink({ href, children, ...props }) {
  if (href?.startsWith('/')) {
    return (
      <Link to={href} {...props}>
        {children}
      </Link>
    );
  }
  const external = /^https?:\/\//.test(href ?? '');
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...props}>
      {children}
    </a>
  );
}
