import { collection } from '../data/home';
import { bouquetCollection } from '../data/bouquets';
import { candleCollection } from '../data/candles';

// Home cards reuse names from the Bouquets/Candles pages, so their ids get a "home-" prefix to stay
// unique in the database (Bouquets/Candles ids are kept — photo links point at them, e.g. /bouquets#id).
const withCollection = (items, name) =>
  items.map((item, order) => ({
    ...item,
    id: name === 'home' ? `home-${item.id}` : item.id,
    originalId: item.id,
    collection: name,
    order,
  }));

export function getSeedProducts() {
  return [
    ...withCollection(collection.products, 'home'),
    ...withCollection(bouquetCollection.items, 'bouquets'),
    ...withCollection(candleCollection.items, 'candles'),
  ];
}

/** Built-in items that are not in the database (e.g. deleted by mistake or lost in an older import). */
export function getMissingSeedProducts(products) {
  return getSeedProducts().filter(
    (seed) => !products.some((p) => p.collection === seed.collection && (p.id === seed.id || p.id === seed.originalId)),
  );
}
