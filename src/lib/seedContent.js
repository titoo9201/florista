import { collection } from '../data/home';
import { bouquetCollection } from '../data/bouquets';
import { candleCollection } from '../data/candles';

const withCollection = (items, name) =>
  items.map((item, order) => ({ ...item, collection: name, order }));

export function getSeedProducts() {
  return [
    ...withCollection(collection.products, 'home'),
    ...withCollection(bouquetCollection.items, 'bouquets'),
    ...withCollection(candleCollection.items, 'candles'),
  ];
}
