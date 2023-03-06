import { catchError } from '../../coraline/cor-route/crlerror';

const earthquakeapis = {
  get: async () => {
    try {
      const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
      const earthquakeData = (await res.json()) as EarthquakeResponse;
      return earthquakeData;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default earthquakeapis;
