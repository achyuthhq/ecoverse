import { NextRequest, NextResponse } from "next/server";

// OpenWeatherMap API - Free tier available
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY?.trim() || '';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Debug: Log API key status (without exposing the actual key)
if (process.env.NODE_ENV === 'development') {
  console.log('[WEATHER_API] API Key status:', {
    exists: !!OPENWEATHER_API_KEY,
    length: OPENWEATHER_API_KEY.length,
    startsWith: OPENWEATHER_API_KEY.substring(0, 4) + '...',
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Validate lat/lon are valid numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude values' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90, longitude between -180 and 180' },
        { status: 400 }
      );
    }

    // If no API key, return mock data for development
    if (!OPENWEATHER_API_KEY) {
      console.warn('[WEATHER_API] No OpenWeatherMap API key found.');
      console.warn('[WEATHER_API] Please add OPENWEATHER_API_KEY to your .env.local file and restart the server.');
      return NextResponse.json({
        weather: {
          temp: 25,
          feelsLike: 24,
          humidity: 60,
          pressure: 1013,
          visibility: 10000,
          uvIndex: 0,
          description: 'Clear sky',
          icon: '01d',
          windSpeed: 2.5,
          windDirection: 180,
          clouds: 0,
          rain: null,
          snow: null,
        },
        airQuality: {
          aqi: 1,
          level: 'Good',
          pm25: 12,
          pm10: 18,
          o3: 85,
          no2: 25,
          so2: 8,
          co: 350,
          no: 0.5,
          nh3: 2.5,
        },
        location: {
          name: 'Your Location',
          country: 'IN',
        },
      });
    }

    // Fetch current weather data
    // API: https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}&units=metric
    const weatherUrl = `${OPENWEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    let weatherResponse;
    try {
      weatherResponse = await fetch(weatherUrl);
    } catch (fetchError: any) {
      console.error('[WEATHER_API] Network error fetching weather:', fetchError);
      return NextResponse.json(
        { error: `Network error: ${fetchError.message || 'Failed to connect to weather service'}` },
        { status: 503 }
      );
    }

    if (!weatherResponse.ok) {
      let errorData;
      try {
        errorData = await weatherResponse.json();
      } catch {
        errorData = { message: `HTTP ${weatherResponse.status}: ${weatherResponse.statusText}` };
      }
      
      const errorMessage = errorData.message || errorData.cod === 401 
        ? 'Invalid API key. Please check your OpenWeatherMap API key.'
        : `Failed to fetch weather data: ${errorData.message || weatherResponse.statusText}`;
      
      console.error('[WEATHER_API] Weather API error:', {
        status: weatherResponse.status,
        statusText: weatherResponse.statusText,
        errorData
      });
      
      // Handle specific API errors
      if (weatherResponse.status === 401 || errorData.cod === 401) {
        console.error('[WEATHER_API] Invalid API key detected. Please verify:');
        console.error('[WEATHER_API] 1. OPENWEATHER_API_KEY is set in .env.local (not .env)');
        console.error('[WEATHER_API] 2. The API key is correct and activated on openweathermap.org');
        console.error('[WEATHER_API] 3. The server has been restarted after adding the key');
        console.error('[WEATHER_API] 4. There are no extra spaces or quotes around the key');
        return NextResponse.json(
          { 
            error: 'Invalid API key. Please check your OpenWeatherMap API key in .env.local file and restart the server.',
            details: 'Make sure the key is in .env.local (not .env) and the server has been restarted.'
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: weatherResponse.status }
      );
    }

    const weatherData = await weatherResponse.json();

    // Validate weather data structure
    if (!weatherData.main || !weatherData.weather || !Array.isArray(weatherData.weather)) {
      throw new Error('Invalid weather data structure received from API');
    }

    // Fetch air pollution data
    // API: https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API key}
    let airQualityData = null;
    try {
      const aqUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`;
      const aqResponse = await fetch(aqUrl);
      
      if (aqResponse.ok) {
        airQualityData = await aqResponse.json();
      } else {
        console.warn('[WEATHER_API] Air quality API returned non-OK status:', aqResponse.status);
      }
    } catch (error) {
      console.error('[WEATHER_API] Error fetching air quality:', error);
    }

    // Format response according to OpenWeatherMap API documentation
    const response = {
      weather: {
        temp: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility ? weatherData.visibility / 1000 : 0, // Convert meters to km
        uvIndex: 0, // UV index requires separate One Call API call
        description: weatherData.weather[0]?.description || 'Clear',
        icon: weatherData.weather[0]?.icon || '01d',
        windSpeed: weatherData.wind?.speed || 0,
        windDirection: weatherData.wind?.deg || 0,
        windGust: weatherData.wind?.gust || null,
        clouds: weatherData.clouds?.all || 0,
        rain: weatherData.rain ? {
          '1h': weatherData.rain['1h'] || null,
          '3h': weatherData.rain['3h'] || null,
        } : null,
        snow: weatherData.snow ? {
          '1h': weatherData.snow['1h'] || null,
          '3h': weatherData.snow['3h'] || null,
        } : null,
        tempMin: weatherData.main.temp_min ? Math.round(weatherData.main.temp_min) : null,
        tempMax: weatherData.main.temp_max ? Math.round(weatherData.main.temp_max) : null,
        seaLevel: weatherData.main.sea_level || null,
        groundLevel: weatherData.main.grnd_level || null,
        sunrise: weatherData.sys?.sunrise || null,
        sunset: weatherData.sys?.sunset || null,
        timezone: weatherData.timezone || null,
      },
      airQuality: airQualityData && airQualityData.list && airQualityData.list[0]
        ? {
            aqi: airQualityData.list[0].main?.aqi || 1,
            level: getAQILevel(airQualityData.list[0].main?.aqi || 1),
            pm25: Math.round((airQualityData.list[0].components?.pm2_5 || 0) * 100) / 100,
            pm10: Math.round((airQualityData.list[0].components?.pm10 || 0) * 100) / 100,
            o3: Math.round((airQualityData.list[0].components?.o3 || 0) * 100) / 100,
            no2: Math.round((airQualityData.list[0].components?.no2 || 0) * 100) / 100,
            so2: Math.round((airQualityData.list[0].components?.so2 || 0) * 100) / 100,
            co: Math.round((airQualityData.list[0].components?.co || 0) * 100) / 100,
            no: Math.round((airQualityData.list[0].components?.no || 0) * 100) / 100,
            nh3: Math.round((airQualityData.list[0].components?.nh3 || 0) * 100) / 100,
          }
        : {
            aqi: 1,
            level: 'Good',
            pm25: 0,
            pm10: 0,
            o3: 0,
            no2: 0,
            so2: 0,
            co: 0,
            no: 0,
            nh3: 0,
          },
      location: {
        name: weatherData.name || 'Unknown',
        country: weatherData.sys?.country || '',
        coord: {
          lat: weatherData.coord?.lat || latitude,
          lon: weatherData.coord?.lon || longitude,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[WEATHER_API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

function getAQILevel(aqi: number): string {
  // OpenWeatherMap AQI: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
  const levels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  return levels[aqi - 1] || 'Unknown';
}

