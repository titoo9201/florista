const sizes = {
  md: { title: 'mt-[7px] text-[28px] leading-[1.15]', text: 'mt-2 leading-[1.5]' },
  lg: { title: 'mt-3 text-[28px] leading-9 xl:text-[30px]', text: 'mt-[10px] leading-[1.6]' },
};

/** Numbered value point ("01 / title / text"). `size="lg"` = About page values. */
export default function FeatureItem({ number, title, text, size = 'md' }) {
  const s = sizes[size];
  return (
    <div>
      <p className="text-[13px] leading-4" aria-hidden="true">
        {number}
      </p>
      <h3 className={`font-serif font-normal ${s.title}`}>{title}</h3>
      <p className={`text-sm ${s.text}`}>{text}</p>
    </div>
  );
}
