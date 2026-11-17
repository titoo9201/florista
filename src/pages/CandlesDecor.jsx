import { candleCollection as builtIn } from '../data/candles';
import PageHero from '../components/PageHero';
import FilterableCollection from '../components/FilterableCollection';
import CtaBanner from '../components/CtaBanner';
import { useContent, useSection } from '../context/ContentContext';

export default function CandlesDecor() {
  const { getProducts, getImage } = useContent();
  const candlesHero = useSection('candles.candlesHero');
  const candleFilters = useSection('candles.candleFilters');
  const candleCollection = useSection('candles.candleCollection');
  const candlesCta = useSection('candles.candlesCta');
  const products = getProducts('candles', builtIn.items);
  return (
    <>
      <PageHero id="candles-title" {...candlesHero} image={getImage('candles.hero', candlesHero.image)} />
      <FilterableCollection
        id="candle-edit"
        sectionId="candle-collection"
        filterLabel="Filter candles and decor"
        filters={candleFilters}
        collection={{ ...candleCollection, items: products }}
      />
      <CtaBanner
        id="candles-cta-title"
        {...candlesCta}
        headingClassName="text-[38px] leading-[1.1] md:text-[48px] xl:text-[56px] xl:leading-[64px]"
      />
    </>
  );
}
