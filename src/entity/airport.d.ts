export declare class Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  state: string;
  country: string;
  tz: string;
  elevation: number;
  latitude: number;
  longitude: number;
  random(): Airport;
  distanceBetween(airport: Airport, unit?: string): number;
}
