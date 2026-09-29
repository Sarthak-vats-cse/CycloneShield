import { NextResponse } from 'next/server';
import ee from '@google/earthengine';

const initializeGEE = () => {
  return new Promise((resolve, reject) => {
    // Read from Vercel env variable if available, otherwise fallback to local JSON file
    let privateKey;
    if (process.env.GEE_SERVICE_ACCOUNT_KEY) {
      privateKey = JSON.parse(process.env.GEE_SERVICE_ACCOUNT_KEY);
    } else {
      privateKey = require('../../../../gee-service-account.json');
    }

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

    const region = ee.Geometry.BBox(83.0, 17.5, 88.0, 22.5);

    const sentinel = new ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(region)
      .filterDate('2024-05-01', '2024-05-30')
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
      .median()
      .clip(region);

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
