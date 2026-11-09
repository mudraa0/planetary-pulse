export type LayerId =
  | 'temperature'
  | 'anomaly'
  | 'aqi'
  | 'wind'
  | 'sst'
  | 'waves'
  | 'currents';

export type Domain = 'atmosphere' | 'ocean';

export type RampType = 'sequential' | 'diverging';

export type MaskType = 'none' | 'ocean';
