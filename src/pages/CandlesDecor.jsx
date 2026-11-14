import { candleCollection, candleFilters, candlesCta, candlesHero } from '../data/candles';
import PageHero from '../components/PageHero';
import FilterableCollection from '../components/FilterableCollection';
import CtaBanner from '../components/CtaBanner';

export default function CandlesDecor() {
  return (
    <>
      <PageHero id="candles-title" {...candlesHero} />
      <FilterableCollection
        id="candle-edit"
        filterLabel="Filter candles and decor"
        filters={candleFilters}
        collection={candleCollection}
      />
      <CtaBanner
        id="candles-cta-title"
        {...candlesCta}
        headingClassName="text-[38px] leading-[1.1] md:text-[48px] xl:text-[56px] xl:leading-[64px]"
      />
    </>
  );
}
