import { candleCollection, candleFilters, candlesCta, candlesHero } from '../data/candles';
import PageHero from '../components/PageHero';
import FilterableCollection from '../components/FilterableCollection';
import CtaBanner from '../components/CtaBanner';
import { useContent } from '../context/ContentContext';

export default function CandlesDecor() {
  const { getProducts } = useContent();
  const products = getProducts('candles', candleCollection.items);
  return (
    <>
      <PageHero id="candles-title" {...candlesHero} />
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
