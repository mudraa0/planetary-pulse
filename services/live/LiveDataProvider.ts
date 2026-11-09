import type { DataProvider } from '../provider';
import type { GridField, PointReport } from '@/types/data';

/**
 * LiveDataProvider stub connecting to external NASA Earthdata, OpenWeatherMap,
 * or Copernicus Marine APIs when credentials are provided.
 */
export class LiveDataProvider implements DataProvider {
  private openWeatherKey = process.env.OPENWEATHER_API_KEY;
  private copernicusUser = process.env.COPERNICUS_USER;
  private copernicusPass = process.env.COPERNICUS_PASSWORD;
  private nasaToken = process.env.NASA_EARTHDATA_TOKEN;

  async getGridField(layerId: string, timeIso: string): Promise<GridField> {
    if (!this.nasaToken && !this.openWeatherKey && !this.copernicusUser) {
      // Fallback gracefully to mock provider if keys are absent
      const { MockDataProvider } = await import('../mock/MockDataProvider');
      const fallback = new MockDataProvider();
      return fallback.getGridField(layerId, timeIso);
    }

    // Live endpoint integration hook
    throw new Error(
      `Live endpoint for layer "${layerId}" is not yet configured for direct streaming.`
    );
  }

  async getPointReport(lat: number, lon: number, timeIso: string): Promise<PointReport> {
    if (!this.openWeatherKey && !this.nasaToken) {
      const { MockDataProvider } = await import('../mock/MockDataProvider');
      const fallback = new MockDataProvider();
      return fallback.getPointReport(lat, lon, timeIso);
    }

    throw new Error('Live point report aggregation is pending configured API endpoints.');
  }
}
