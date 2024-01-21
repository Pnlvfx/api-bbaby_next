import { Schema, model } from 'mongoose';
import { Feature } from '../lib/earthquakeapis/types/eq';

const EarthquakeSchema = new Schema<Feature>(
  {
    type: String,
    properties: {},
    geometry: {},
    id: String,
  },
  {
    timestamps: true,
  },
);
const Earthquake = model('Earthquake', EarthquakeSchema);

export default Earthquake;
