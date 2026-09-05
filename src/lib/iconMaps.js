import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  CloudFog
} from 'lucide-react';

export function getWeatherIcon(code) {
  if (code === undefined || code === null) return Sun;

  // WMO Weather interpretation codes (WW)
  // 0: Clear sky
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  // 45, 48: Fog and depositing rime fog
  // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
  // 56, 57: Freezing Drizzle: Light and dense intensity
  // 61, 63, 65: Rain: Slight, moderate and heavy intensity
  // 66, 67: Freezing Rain: Light and heavy intensity
  // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
  // 77: Snow grains
  // 80, 81, 82: Rain showers: Slight, moderate, and violent
  // 85, 86: Snow showers slight and heavy
  // 95: Thunderstorm: Slight or moderate
  // 96, 99: Thunderstorm with slight and heavy hail

  const c = Number(code);

  if (c === 0) return Sun;
  if (c === 1 || c === 2) return CloudSun;
  if (c === 3) return Cloud;
  if (c === 45 || c === 48) return CloudFog;
  if (c >= 51 && c <= 57) return CloudDrizzle;
  if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return CloudRain;
  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return Snowflake;
  if (c >= 95 && c <= 99) return CloudLightning;

  return CloudSun;
}
