// Weather Service Module
const WeatherService = (() => {
    const API_BASE_URL = 'https://weather-proxy.freecodecamp.rocks/api/city';
    const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
    const cache = new Map();
    
    // Enhanced API endpoints for future expansion
    const APIS = {
        current: (city) => `${API_BASE_URL}/${city}`,
        forecast: (city) => `${API_BASE_URL}/${city}/forecast`,
        historical: (city) => `${API_BASE_URL}/${city}/historical`
    };
    
    // Weather condition mappings for icons and tips
    const WEATHER_CONDITIONS = {
        'Clear': { 
            icon: '☀️', 
            color: '#FFD700',
            tips: ['Perfect day for outdoor activities!', 'Wear sunscreen if going outside.', 'Stay hydrated in the sun.']
        },
        'Clouds': { 
            icon: '☁️', 
            color: '#B0B0B0',
            tips: ['Good day for a walk!', 'Carry an umbrella just in case.', 'Light jacket recommended.']
        },
        'Rain': { 
            icon: '🌧️', 
            color: '#4682B4',
            tips: ['Stay dry with an umbrella!', 'Perfect day to stay in and read.', 'Drive carefully on wet roads.']
        },
        'Snow': { 
            icon: '❄️', 
            color: '#87CEEB',
            tips: ['Wear warm clothing!', 'Watch for icy surfaces.', 'Perfect for hot cocoa!']
        },
        'Thunderstorm': { 
            icon: '⛈️', 
            color: '#483D8B',
            tips: ['Stay indoors if possible!', 'Unplug electronic devices.', 'Avoid using landline phones.']
        },
        'Drizzle': { 
            icon: '🌦️', 
            color: '#6495ED',
            tips: ['Light rain expected.', 'Carry an umbrella.', 'Good day for photography.']
        },
        'Mist': { 
            icon: '🌫️', 
            color: '#D3D3D3',
            tips: ['Drive carefully in fog!', 'Use fog lights if available.', 'Allow extra travel time.']
        }
    };
    
    // Unit conversion functions
    const convertTemp = (temp, toFahrenheit = false) => {
        if (toFahrenheit) {
            return (temp * 9/5) + 32;
        }
        return temp;
    };
    
    const convertSpeed = (speed, toMph = false) => {
        if (toMph) {
            return speed * 2.237;
        }
        return speed;
    };
    
    const convertVisibility = (visibility, toMiles = false) => {
        if (toMiles) {
            return visibility / 1609.34;
        }
        return visibility / 1000; // Convert meters to kilometers
    };
    
    // Cache management
    const getFromCache = (key) => {
        const cached = cache.get(key);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
            return cached.data;
        }
        cache.delete(key);
        return null;
    };
    
    const setToCache = (key, data) => {
        cache.set(key, {
            data,
            timestamp: Date.now()
        });
    };
    
    // Format date and time
    const formatTime = (timestamp, timezone) => {
        const date = new Date((timestamp + timezone) * 1000);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'UTC'
        });
    };
    
    const formatDate = (timestamp, timezone) => {
        const date = new Date((timestamp + timezone) * 1000);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        });
    };
    
    // Get weather tips based on conditions
    const getWeatherTips = (condition, temp) => {
        const baseTips = WEATHER_CONDITIONS[condition]?.tips || ['Check local weather updates.'];
        let tempTips = [];
        
        if (temp > 30) {
            tempTips = ['Stay hydrated!', 'Avoid direct sun during peak hours.', 'Wear light clothing.'];
        } else if (temp < 5) {
            tempTips = ['Wear layers to stay warm!', 'Protect exposed skin from cold.', 'Check heating systems.'];
        }
        
        return [...baseTips, ...tempTips];
    };
    
    // Main API call function
    async function getWeather(city) {
        const cacheKey = `weather_${city.toLowerCase()}`;
        const cachedData = getFromCache(cacheKey);
        
        if (cachedData) {
            console.log(`Returning cached data for ${city}`);
            return Promise.resolve(cachedData);
        }
        
        try {
            const response = await fetch(APIS.current(city));
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Enhance data with additional calculations
            const enhancedData = {
                ...data,
                timestamp: Date.now(),
                formatted: {
                    time: formatTime(data.dt, data.timezone || 0),
                    date: formatDate(data.dt, data.timezone || 0),
                    sunrise: formatTime(data.sys?.sunrise, data.timezone || 0),
                    sunset: formatTime(data.sys?.sunset, data.timezone || 0)
                },
                tips: getWeatherTips(
                    data.weather?.[0]?.main || 'Clear',
                    data.main?.temp || 20
                ),
                conditionInfo: WEATHER_CONDITIONS[data.weather?.[0]?.main] || WEATHER_CONDITIONS.Clear
            };
            
            // Cache the enhanced data
            setToCache(cacheKey, enhancedData);
            
            return enhancedData;
            
        } catch (error) {
            console.error('Error in getWeather:', error);
            throw error;
        }
    }
    
    // Get forecast (placeholder for future implementation)
    async function getForecast(city) {
        try {
            // This is a placeholder - you would implement actual forecast API
            const currentData = await getWeather(city);
            
            // Generate mock forecast data based on current conditions
            const forecast = [];
            for (let i = 1; i <= 5; i++) {
                const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
                forecast.push({
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    temp: currentData.main.temp + (Math.random() * 6 - 3),
                    condition: currentData.weather[0].main,
                    icon: currentData.weather[0].icon
                });
            }
            
            return forecast;
        } catch (error) {
            console.error('Error in getForecast:', error);
            throw error;
        }
    }
    
    // Get user's current location
    function getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    reject(new Error('Unable to retrieve your location'));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }
    
    // Get city from coordinates (reverse geocoding placeholder)
    async function getCityFromCoords(lat, lon) {
        // In a real app, you would call a reverse geocoding API here
        // For now, we'll return a default city
        return 'new york';
    }
    
    return {
        getWeather,
        getForecast,
        getCurrentLocation,
        getCityFromCoords,
        convertTemp,
        convertSpeed,
        convertVisibility,
        WEATHER_CONDITIONS
    };
})();