import type { DataProvider } from '../provider';
import type { GridField, PointReport, PointLayerReport, FactorEntry } from '@/types/data';
import { LAYER_REGISTRY } from '@/lib/layers';
import type { LayerId } from '@/types/layers';
import { fbm, createSeededRng } from '@/lib/noise';
import {
  computeAnomaly,
  computeZScore,
  computePercentileRank,
  olsTrendPerDecade,
  mean,
  stdDev,
} from '@/lib/stats';
import { bilinearSample } from '@/lib/sampling';

const GRID_W = 360;
const GRID_H = 181;

/** Known major geographic landmarks for reverse-geocoding. */
const GEOGRAPHIC_ANCHORS = [
  { name: 'London, United Kingdom', lat: 51.5, lon: -0.1 },
  { name: 'Tokyo, Japan', lat: 35.6, lon: 139.6 },
  { name: 'New York, United States', lat: 40.7, lon: -74.0 },
  { name: 'Sydney, Australia', lat: -33.8, lon: 151.2 },
  { name: 'Nairobi, Kenya', lat: -1.2, lon: 36.8 },
  { name: 'São Paulo, Brazil', lat: -23.5, lon: -46.6 },
  { name: 'Reykjavik, Iceland', lat: 64.1, lon: -21.9 },
  { name: 'Cairo, Egypt', lat: 30.0, lon: 31.2 },
  { name: 'Mumbai, India', lat: 19.0, lon: 72.8 },
  { name: 'Honolulu, Hawaii', lat: 21.3, lon: -157.8 },
  { name: 'North Atlantic Ocean', lat: 35.0, lon: -40.0 },
  { name: 'South Pacific Basin', lat: -25.0, lon: -130.0 },
  { name: 'Indian Ocean Gyre', lat: -20.0, lon: 80.0 },
  { name: 'Arctic Ice Sheet', lat: 80.0, lon: 0.0 },
  { name: 'Antarctic Continental Shelf', lat: -75.0, lon: 0.0 },
];

/** Returns an approximate reverse-geocoded label based on proximity or coordinate quad. */
function reverseGeocode(lat: number, lon: number): string {
  let nearestDist = Infinity;
  let nearestName = '';

  for (const anchor of GEOGRAPHIC_ANCHORS) {
    const dLat = anchor.lat - lat;
    const dLon = anchor.lon - lon;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestName = anchor.name;
    }
  }

  if (nearestDist < 8) {
    return nearestName;
  }

  const latHem = lat >= 0 ? `${lat.toFixed(1)}°N` : `${Math.abs(lat).toFixed(1)}°S`;
  const lonHem = lon >= 0 ? `${lon.toFixed(1)}°E` : `${Math.abs(lon).toFixed(1)}°W`;

  if (lat > 66) return `Arctic Region (${latHem}, ${lonHem})`;
  if (lat < -60) return `Southern Ocean (${latHem}, ${lonHem})`;
  return `Point Probe (${latHem}, ${lonHem})`;
}

/** Precomputed ocean mask buffer (1 = ocean/water, 0 = land). */
const cachedOceanMask = new Uint8Array(GRID_W * GRID_H);
let isMaskInitialized = false;

function initOceanMask() {
  if (isMaskInitialized) return;
  for (let j = 0; j < GRID_H; j++) {
    const lat = 90 - (j / (GRID_H - 1)) * 180;
    for (let i = 0; i < GRID_W; i++) {
      const lon = -180 + (i / GRID_W) * 360;
      // Multi-frequency noise producing continental landmasses
      const continentNoise = fbm(lon / 55 + 2.5, lat / 40 + 1.2, 5, 108);
      const isLand = continentNoise > 0.08 && Math.abs(lat) < 78;
      cachedOceanMask[j * GRID_W + i] = isLand ? 0 : 1;
    }
  }
  isMaskInitialized = true;
}

export class MockDataProvider implements DataProvider {
  private gridCache = new Map<string, GridField>();

  constructor() {
    initOceanMask();
  }

  async getGridField(layerId: string, timeIso: string): Promise<GridField> {
    const cacheKey = `${layerId}:${timeIso.slice(0, 10)}`;
    if (this.gridCache.has(cacheKey)) {
      return this.gridCache.get(cacheKey)!;
    }

    const def = LAYER_REGISTRY[layerId as LayerId] || LAYER_REGISTRY['temperature'];
    const isOceanOnly = def.mask === 'ocean';

    const scalar = new Float32Array(GRID_W * GRID_H);
    const mask = isOceanOnly ? cachedOceanMask : new Uint8Array(GRID_W * GRID_H).fill(1);

    let uComponent: Float32Array | undefined;
    let vComponent: Float32Array | undefined;

    if (def.vector) {
      uComponent = new Float32Array(GRID_W * GRID_H);
      vComponent = new Float32Array(GRID_W * GRID_H);
    }

    const [rangeMin, rangeMax] = def.range;
    const layerSeed = layerId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 100);

    for (let j = 0; j < GRID_H; j++) {
      const lat = 90 - (j / (GRID_H - 1)) * 180;
      const latRad = (lat * Math.PI) / 180;
      const cosLat = Math.cos(latRad);

      for (let i = 0; i < GRID_W; i++) {
        const idx = j * GRID_W + i;
        const lon = -180 + (i / GRID_W) * 360;

        if (isOceanOnly && cachedOceanMask[idx] === 0) {
          scalar[idx] = NaN;
          if (uComponent && vComponent) {
            uComponent[idx] = 0;
            vComponent[idx] = 0;
          }
          continue;
        }

        let normalizedVal = 0.5;

        switch (layerId) {
          case 'temperature': {
            // Latitude-dependent thermal gradient + topographical variation
            const thermalBase = Math.max(0, cosLat);
            const noise = fbm(lon / 40, lat / 30, 4, layerSeed);
            normalizedVal = 0.75 * thermalBase + 0.25 * (noise * 0.5 + 0.5);
            break;
          }
          case 'anomaly': {
            // Diverging anomaly centered around 0 with high latitude amplification
            const polarAmp = 1 + Math.abs(lat) / 60;
            const noise = fbm(lon / 30, lat / 25, 4, layerSeed);
            normalizedVal = 0.5 + noise * 0.35 * polarAmp;
            break;
          }
          case 'aqi': {
            // Higher inland and in populated mid-latitude belts
            const noise = fbm(lon / 25, lat / 20, 5, layerSeed);
            const isContinent = cachedOceanMask[idx] === 0;
            const urbanFactor = isContinent ? 0.35 : 0.05;
            normalizedVal = Math.max(0, Math.min(1, noise * 0.45 + urbanFactor));
            break;
          }
          case 'wind': {
            // Atmospheric Hadley cells & jet stream patterns
            const jetStream = Math.exp(-Math.pow((Math.abs(lat) - 45) / 15, 2));
            const noise = fbm(lon / 45, lat / 35, 4, layerSeed);
            normalizedVal = Math.max(0, Math.min(1, 0.4 * jetStream + 0.6 * (noise * 0.5 + 0.5)));

            if (uComponent && vComponent) {
              const uNoise = fbm(lon / 30, lat / 30, 3, layerSeed + 10);
              const vNoise = fbm(lon / 30, lat / 30, 3, layerSeed + 20);
              const zonalTrade = lat > 0 && lat < 30 ? -8 : lat > 35 && lat < 60 ? 14 : 4;
              uComponent[idx] = zonalTrade + uNoise * 10;
              vComponent[idx] = vNoise * 8;
            }
            break;
          }
          case 'sst': {
            // Marine surface temperature
            const thermalBase = Math.pow(Math.max(0, cosLat), 0.85);
            const noise = fbm(lon / 50, lat / 40, 4, layerSeed);
            normalizedVal = 0.8 * thermalBase + 0.2 * (noise * 0.5 + 0.5);
            break;
          }
          case 'waves': {
            // Roaring Forties & North Pacific swell
            const swellBelt = Math.exp(-Math.pow((lat + 50) / 18, 2)) * 0.6;
            const northSwell = Math.exp(-Math.pow((lat - 50) / 15, 2)) * 0.4;
            const noise = fbm(lon / 35, lat / 30, 4, layerSeed);
            normalizedVal = Math.max(0, Math.min(1, swellBelt + northSwell + noise * 0.3));
            break;
          }
          case 'currents': {
            // Ocean gyres & Gulf Stream
            const noise = fbm(lon / 30, lat / 25, 4, layerSeed);
            normalizedVal = Math.max(0, Math.min(1, noise * 0.5 + 0.3));

            if (uComponent && vComponent) {
              const cu = fbm(lon / 25, lat / 25, 3, layerSeed + 30);
              const cv = fbm(lon / 25, lat / 25, 3, layerSeed + 40);
              uComponent[idx] = cu * 1.5;
              vComponent[idx] = cv * 1.0;
            }
            break;
          }
          default:
            normalizedVal = 0.5;
        }

        scalar[idx] = rangeMin + Math.max(0, Math.min(1, normalizedVal)) * (rangeMax - rangeMin);
      }
    }

    const field: GridField = {
      layerId,
      W: GRID_W,
      H: GRID_H,
      scalar,
      u: uComponent,
      v: vComponent,
      mask,
      timeIso,
    };

    this.gridCache.set(cacheKey, field);
    return field;
  }

  async getPointReport(lat: number, lon: number, timeIso: string): Promise<PointReport> {
    const layerIds: LayerId[] = [
      'temperature',
      'anomaly',
      'aqi',
      'wind',
      'sst',
      'waves',
      'currents',
    ];

    const reports: PointLayerReport[] = [];

    for (const lid of layerIds) {
      const field = await this.getGridField(lid, timeIso);
      const def = LAYER_REGISTRY[lid];
      const sampledVal = bilinearSample(field.scalar, field.W, field.H, lat, lon);

      // Deterministic seed derived from coordinate and layer
      const pointSeed = Math.abs(Math.floor(lat * 1000 + lon * 100 + lid.charCodeAt(0)));
      const rng = createSeededRng(pointSeed);

      const [rMin, rMax] = def.range;
      const fallbackMid = (rMin + rMax) / 2;
      const currentVal = Number.isFinite(sampledVal) ? sampledVal : fallbackMid;

      // 30-day historical trend
      const trend30: number[] = [];
      let walk = currentVal;
      const volatility = (rMax - rMin) * 0.03;

      for (let d = 29; d >= 0; d--) {
        const step = (rng() - 0.48) * volatility;
        walk = Math.max(rMin, Math.min(rMax, walk + step));
        trend30.unshift(parseFloat(walk.toFixed(2)));
      }

      // 12 monthly climatological averages
      const climatology: number[] = [];
      const seasonalAmp = (rMax - rMin) * 0.15 * (lat >= 0 ? 1 : -1);

      for (let m = 0; m < 12; m++) {
        const seasonOffset = Math.sin(((m - 3) / 12) * Math.PI * 2) * seasonalAmp;
        const climVal = fallbackMid + seasonOffset + (rng() - 0.5) * volatility;
        climatology.push(parseFloat(climVal.toFixed(2)));
      }

      const climMean = mean(climatology);
      const climStd = Math.max(0.2, stdDev(climatology));
      const anomalyVal = computeAnomaly(currentVal, climMean);
      const zScore = computeZScore(currentVal, climMean, climStd);
      const percentile = computePercentileRank(currentVal, trend30);

      // Monthly standardized anomalies
      const anomalyMonthly = climatology.map((c) =>
        parseFloat((computeAnomaly(currentVal, c)).toFixed(2))
      );

      // Factor breakdown
      const factors: FactorEntry[] = [
        { name: 'Atmospheric Circulation', zScore: parseFloat((zScore * 0.45).toFixed(2)) },
        { name: 'Surface Radiation Balance', zScore: parseFloat((zScore * 0.28).toFixed(2)) },
        { name: 'Ocean-Atmosphere Coupling', zScore: parseFloat((zScore * -0.18).toFixed(2)) },
        { name: 'Topographical Forcing', zScore: parseFloat((zScore * 0.09).toFixed(2)) },
      ].sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));

      const { recordLengthYears } = olsTrendPerDecade(trend30);

      reports.push({
        layerId: lid,
        value: parseFloat(currentVal.toFixed(2)),
        unit: def.unit,
        anomaly: parseFloat(anomalyVal.toFixed(2)),
        zScore: parseFloat(zScore.toFixed(2)),
        percentile,
        trend30DaySeries: trend30,
        climatologyMonthlySeries: climatology,
        anomalyMonthlySeries: anomalyMonthly,
        factorBreakdown: factors,
        climatologyMean: parseFloat(climMean.toFixed(2)),
        climatologyStd: parseFloat(climStd.toFixed(2)),
        recordLengthYears: Math.max(10, Math.round(recordLengthYears || 10)),
      });
    }

    return {
      lat: parseFloat(lat.toFixed(4)),
      lon: parseFloat(lon.toFixed(4)),
      timeIso,
      placeName: reverseGeocode(lat, lon),
      layers: reports,
      source: 'mock',
      fetchedAt: new Date().toISOString(),
    };
  }
}
