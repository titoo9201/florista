/** Image with lazy loading + async decoding by default. Pass `priority` for above-the-fold images. */
export default function Img({ src, alt, width, height, priority = false, className = '', ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      // lowercase: React 18 passes it through as a plain HTML attribute
      fetchpriority={priority ? 'high' : 'auto'}
      className={className}
      {...props}
    />
  );
}
