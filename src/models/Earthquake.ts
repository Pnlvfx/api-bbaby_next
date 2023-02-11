import { Schema, model } from 'mongoose';

const EarthquakeSchema = new Schema<Earthquake>(
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
