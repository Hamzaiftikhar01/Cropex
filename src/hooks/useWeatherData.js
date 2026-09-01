import { useState, useEffect } from 'react';

// Coordinates mapping for selected Pakistani districts
export const DISTRICT_COORDINATES = {
  Faisalabad: { latitude: 31.4504, longitude: 73.1350 },
  Bahawalpur: { latitude: 29.3544, longitude: 71.6911 },
  Multan: { latitude: 30.1575, longitude: 71.5249 },
  Sargodha: { latitude: 32.0836, longitude: 72.6711 },
  Hyderabad: { latitude: 25.3960, longitude: 68.3578 },
};

// Generates 7-day dates starting from today
const getForecastDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

// Pre-seeded fallback/mock weather profiles to ensure robust demo under offline conditions
const MOCK_WEATHER_DATA = {
  Faisalabad: {
    // Wheat Farmer - Optimal/Normal weather
    current: {
      temp: 22,
      humidity: 45,
      windSpeed: 8,
      precipitation: 0,
      description: 'Clear & Mild',
      conditionCode: 0,
    },
    daily: getForecastDates().map((date, idx) => ({
      date,
      tempMin: 14 + (idx % 2),
      tempMax: 24 - (idx % 2),
      precipitationProb: 5,
      precipitationSum: 0,
      humidityAvg: 48,
      windSpeedMax: 10,
      description: 'Clear Sunny',
      conditionCode: 0,
    })),
  },
  Bahawalpur: {
    // Tomato/Potato Farmer - Late Blight Alert (Cool & Humid)
    current: {
      temp: 18,
      humidity: 92,
      windSpeed: 6,
      precipitation: 2,
      description: 'Overcast & Humid',
      conditionCode: 3,
    },
    daily: getForecastDates().map((date, idx) => ({
      date,
      tempMin: 14 + (idx % 3),
      tempMax: 20 - (idx % 2),
      precipitationProb: 85,
      precipitationSum: idx === 1 || idx === 3 ? 12 : 2,
      humidityAvg: 90 + (idx % 3), // consistently humid for late blight
      windSpeedMax: 9,
      description: idx % 2 === 0 ? 'Drizzle & Foggy' : 'Rainy & Humid',
      conditionCode: 51,
    })),
  },
  Multan: {
    // Cotton Farmer - Heatwave & Drought Warning
    current: {
      temp: 43,
      humidity: 15,
      windSpeed: 14,
      precipitation: 0,
      description: 'Extreme Heat',
      conditionCode: 0,
    },
    daily: getForecastDates().map((date, idx) => ({
      date,
      tempMin: 32 + (idx % 2),
      tempMax: 44 + (idx % 3), // > 40C heatwave
      precipitationProb: 0,
      precipitationSum: 0,
      humidityAvg: 18,
      windSpeedMax: 16,
      description: 'Dry Heat / Dust Storm',
      conditionCode: 0,
    })),
  },
  Sargodha: {
    current: {
      temp: 28,
      humidity: 50,
      windSpeed: 10,
      precipitation: 1,
      description: 'Partly Cloudy',
      conditionCode: 2,
    },
    daily: getForecastDates().map((date, idx) => ({
      date,
      tempMin: 20,
      tempMax: 31,
      precipitationProb: 20,
      precipitationSum: 0.5,
      humidityAvg: 55,
      windSpeedMax: 12,
      description: 'Partly Cloudy',
      conditionCode: 2,
    })),
  },
  Hyderabad: {
    current: {
      temp: 34,
      humidity: 60,
      windSpeed: 18,
      precipitation: 0,
      description: 'Breezy & Warm',
      conditionCode: 1,
    },
    daily: getForecastDates().map((date, idx) => ({
      date,
      tempMin: 26,
      tempMax: 36,
      precipitationProb: 10,
      precipitationSum: 0,
      humidityAvg: 62,
      windSpeedMax: 22,
      description: 'Sunny & Windy',
      conditionCode: 1,
    })),
  },
};

// Open-Meteo Weather Codes map to descriptions
const getWeatherDescription = (code) => {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Light Drizzle';
  if (code >= 61 && code <= 67) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorms';
  return 'Overcast';
};

export function useWeatherData(district) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let active = true;
    const coords = DISTRICT_COORDINATES[district] || DISTRICT_COORDINATES['Faisalabad'];
    const mock = MOCK_WEATHER_DATA[district] || MOCK_WEATHER_DATA['Faisalabad'];

    const fetchLiveWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,weather_code&timezone=auto`;
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`Open-Meteo HTTP error: ${res.status}`);
        }
        
        const json = await res.json();
        
        if (!active) return;

        // Parse into our standard weather data structure
        const dailyDates = json.daily.time;
        const dailyData = dailyDates.map((date, idx) => ({
          date,
          tempMin: Math.round(json.daily.temperature_2m_min[idx]),
          tempMax: Math.round(json.daily.temperature_2m_max[idx]),
          precipitationProb: json.daily.precipitation_probability_max[idx] || 0,
          precipitationSum: json.daily.precipitation_sum[idx] || 0,
          humidityAvg: idx === 0 ? json.current.relative_humidity_2m : 55, // open-meteo daily doesn't always have humidity, approximate
          windSpeedMax: Math.round(json.daily.wind_speed_10m_max[idx]),
          description: getWeatherDescription(json.daily.weather_code[idx]),
          conditionCode: json.daily.weather_code[idx],
        }));

        setData({
          current: {
            temp: Math.round(json.current.temperature_2m),
            humidity: Math.round(json.current.relative_humidity_2m),
            windSpeed: Math.round(json.current.wind_speed_10m),
            precipitation: json.current.precipitation,
            description: getWeatherDescription(json.current.weather_code),
            conditionCode: json.current.weather_code,
          },
          daily: dailyData,
        });
        setIsFallback(false);
      } catch (err) {
        console.warn('Weather API failed, using pre-seeded fallback:', err);
        if (active) {
          setData(mock);
          setIsFallback(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchLiveWeather();

    return () => {
      active = false;
    };
  }, [district]);

  return { weatherData: data, loading, error, isFallback };
}
