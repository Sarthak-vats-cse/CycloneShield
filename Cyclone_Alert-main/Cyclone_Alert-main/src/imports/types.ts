export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface CycloneData {
  cyclone_name: string;
  category: string;
  wind_speed_kmh: number;
  pressure_hpa: number;
  location: {
    lat: number;
    lng: number;
  };
  projected_path: Array<{ lat: number; lng: number; time: string }>;
  infrastructure_risk: Array<{
    id: string;
    name: string;
    type: string;
    risk_level: RiskLevel;
    distance_km: number;
  }>;
  advisories: Array<{
    id: string;
    sector: string;
    action: string;
    risk_level: RiskLevel;
  }>;
}
