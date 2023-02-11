/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
interface Earthquake {
  type: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    tz: number;
    url: string;
    detail: string;
    felt: number;
    cdi: number;
    mmi: number;
    alert: string;
    status: string;
    tsunamis: number;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
    nst: number;
    dmin: number;
    rms: number;
    gap: number;
    magType: string;
    type: string;
    title: string;
  };
  geometry: {
    type: string;
    coordinates: number[];
  };
  id: string;
}

interface EarthquakeResponse {
  type: string;
  metadata: {
    generated: number;
    url: string;
    title: string;
    api: string;
    count: number;
  };
  features: Earthquake[];
}
