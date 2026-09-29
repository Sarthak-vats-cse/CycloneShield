import { NextResponse } from 'next/server';
import ee from '@google/earthengine';
import privateKey from '../../../../gee-service-account.json';

const initializeGEE = () => {
  return new Promise((resolve, reject) => {
    ee.data.authenticateViaPrivateKey(
      privateKey,
      () => {
        ee.initialize(
          null,
          null,
          () => resolve(true),
          (err: any) => reject(err)
        );
      },
      (err: any) => reject(err)
    );
  });
};

export async function GET() {
  try {
    await initializeGEE();

    // 1. Define regional bounds covering the whole coastal state (Odisha region)
    const region = ee.Geometry.BBox(83.0, 17.5, 88.0, 22.5);

    // 2. Fetch Sentinel-2 Surface Reflectance and clip to region
    const sentinel = new ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(region)
      .filterDate('2024-05-01', '2024-05-30')
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) // Filter out heavy clouds
      .median()
      .clip(region);

    // RGB True Color Parameters
    const visParams = {
      bands: ['B4', 'B3', 'B2'],
      min: 0,
      max: 3000,
      gamma: 1.2,
    };

    const mapId: any = await new Promise((resolve, reject) => {
      sentinel.getMap(visParams, (map: any, err: any) => {
        if (err) reject(err);
        else resolve(map);
      });
    });

    return NextResponse.json({
      urlFormat: mapId.urlFormat,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to initialize GEE' }, { status: 500 });
  }
}
