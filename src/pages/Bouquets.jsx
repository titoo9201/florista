import { useSection } from '../context/ContentContext';
import BouquetsHero from '../sections/bouquets/BouquetsHero';
import BouquetCollection from '../sections/bouquets/BouquetCollection';
import CtaBanner from '../components/CtaBanner';

export default function Bouquets() {
  const bouquetsCta = useSection('bouquets.bouquetsCta');
  return (
    <>
      <BouquetsHero />
      <BouquetCollection />
      <CtaBanner
        id="bouquets-cta-title"
        {...bouquetsCta}
        headingClassName="text-[38px] leading-[1.1] md:text-[48px] xl:text-[56px] xl:leading-[64px]"
      />
    </>
  );
}
