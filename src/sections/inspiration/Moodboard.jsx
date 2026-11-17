import { useContent, useSection } from '../../context/ContentContext';
import Eyebrow from '../../components/Eyebrow';
import Heading from '../../components/Heading';
import MoodboardItem from '../../components/MoodboardItem';
import Reveal from '../../components/Reveal';


/**
 * "A moodboard in bloom." — staggered 3-column gallery on desktop.
 * Below `lg` the column wrappers become `display: contents` and tiles are ordered 01 → 06.
 */
export default function Moodboard() {
  const moodboard = useSection('inspiration.moodboard');
  const { getImage } = useContent();
  const columns = [1, 2, 3].map((col) => moodboard.items.filter((item) => item.column === col));
  return (
    <section aria-labelledby="moodboard-title" className="container-page pt-16 pb-16 md:pt-[81px] md:pb-24">
      <Reveal>
        <Eyebrow>{moodboard.eyebrow}</Eyebrow>
        <Heading
          id="moodboard-title"
          className="mt-4 text-[40px] leading-[1.08] md:mt-[11px] md:text-[48px] xl:text-[52px] xl:leading-[58px]"
        >
          {moodboard.title}
        </Heading>
        <p className="mt-4 text-[15px] leading-6 md:mt-[15px]">{moodboard.body}</p>
        <p className="mt-6 text-xs leading-4 md:mt-8">{moodboard.note}</p>
      </Reveal>

      <div className="mt-8 grid gap-x-6 gap-y-[26px] sm:grid-cols-2 md:mt-[34px] lg:grid-cols-3 lg:items-start">
        {columns.map((items, i) => (
          <ul key={i} className="contents lg:flex lg:flex-col lg:gap-[26px]">
            {items.map((item) => (
              <MoodboardItem
                key={item.number}
                {...item}
                image={getImage(`inspiration.moodboard.${item.number}`, item.image)}
                style={{ order: Number(item.number) }}
              />
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
