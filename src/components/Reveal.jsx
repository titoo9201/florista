import { motion, useReducedMotion } from 'framer-motion';

/** Subtle fade-up on scroll into view. Disabled for users who prefer reduced motion. */
export default function Reveal({ as = 'div', delay = 0, y = 16, className = '', children, ...props }) {
  const reduce = useReducedMotion();
  const Component = motion[as] ?? motion.div;
  if (reduce) {
    const Tag = as;
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    );
  }
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      {...props}
    >
      {children}
    </Component>
  );
}
