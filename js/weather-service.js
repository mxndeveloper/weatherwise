// Weather Service Module
const WeatherService = (() => {
    // Use the correct FreeCodeCamp API URL
    const API_BASE_URL = 'https://weather-proxy.freecodecamp.rocks/api/current';
    const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
    const cache = new Map();
    
    // Enhanced API endpoints
    const APIS = {
        current: (lat, lon) => `${API_BASE_URL}?lat=${lat}&lon=${lon}`,
        forecast: (city) => `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=demo&units=metric`
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
    
    // City coordinates mapping
    const CITY_COORDINATES = {
        'new york': { lat: 40.7128, lon: -74.0060 },
        'los angeles': { lat: 34.0522, lon: -118.2437 },
        'chicago': { lat: 41.8781, lon: -87.6298 },
        'london': { lat: 51.5074, lon: -0.1278 },
        'paris': { lat: 48.8566, lon: 2.3522 },
        'tokyo': { lat: 35.6762, lon: 139.6503 },
        'sydney': { lat: -33.8688, lon: 151.2093 },
        'mumbai': { lat: 19.0760, lon: 72.8777 },
        'beijing': { lat: 39.9042, lon: 116.4074 },
        'dubai': { lat: 25.2048, lon: 55.2708 }
    };
    
    // Unit conversion functions
    const convertTemp = (temp, toFahrenheit = false) => {
        if (temp === undefined || temp === null) return temp;
        if (toFahrenheit) {
            return (temp * 9/5) + 32;
        }
        return temp;
    };
    
    const convertSpeed = (speed, toMph = false) => {
        if (speed === undefined || speed === null) return speed;
        if (toMph) {
            return speed * 2.237;
        }
        return speed;
    };
    
    const convertVisibility = (visibility, toMiles = false) => {
        if (visibility === undefined || visibility === null) return visibility;
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
        try {
            const date = new Date(timestamp * 1000);
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
            });
        } catch (error) {
            return '--:-- --';
        }
    };
    
    const formatDate = (timestamp) => {
        try {
            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return '-- --- --';
        }
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
    async function getWeather(cityName) {
        const city = cityName.toLowerCase();
        const cacheKey = `weather_${city}`;
        const cachedData = getFromCache(cacheKey);
        
        if (cachedData) {
            console.log(`Returning cached data for ${city}`);
            return Promise.resolve(cachedData);
        }
        
        try {
            // Get coordinates for the city
            const coords = CITY_COORDINATES[city];
            if (!coords) {
                throw new Error(`City "${cityName}" not found in our database.`);
            }
            
            // Fetch from FreeCodeCamp API
            const response = await fetch(`${API_BASE_URL}?lat=${coords.lat}&lon=${coords.lon}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Mock additional data for demo purposes
            const enhancedData = {
                ...data,
                name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
                main: {
                    temp: data.main?.temp || 20,
                    feels_like: data.main?.feels_like || 20,
                    temp_min: (data.main?.temp || 20) - 2,
                    temp_max: (data.main?.temp || 20) + 3,
                    humidity: data.main?.humidity || 50,
                    pressure: data.main?.pressure || 1013
                },
                wind: {
                    speed: data.wind?.speed || 3,
                    gust: (data.wind?.speed || 3) + 2
                },
                visibility: data.visibility || 10000,
                sys: {
                    sunrise: data.sys?.sunrise || 1678867200,
                    sunset: data.sys?.sunset || 1678910400
                },
                formatted: {
                    time: new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    date: new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    sunrise: formatTime(data.sys?.sunrise || 1678867200),
                    sunset: formatTime(data.sys?.sunset || 1678910400)
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
            
            // Fallback to mock data if API fails
            const mockData = {
                name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
                main: {
                    temp: 22,
                    feels_like: 24,
                    temp_min: 18,
                    temp_max: 25,
                    humidity: 65,
                    pressure: 1013
                },
                weather: [{
                    main: 'Clear',
                    description: 'clear sky',
                    icon: '01d'
                }],
                wind: {
                    speed: 3.5,
                    gust: 4.2
                },
                visibility: 10000,
                sys: {
                    sunrise: 1678867200,
                    sunset: 1678910400
                },
                formatted: {
                    time: new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    date: new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    sunrise: '6:30 AM',
                    sunset: '6:45 PM'
                },
                tips: getWeatherTips('Clear', 22),
                conditionInfo: WEATHER_CONDITIONS.Clear
            };
            
            setToCache(cacheKey, mockData);
            return mockData;
        }
    }
    
    // Get forecast (mock implementation)
    async function getForecast(city) {
        try {
            // Mock forecast data
            const forecast = [];
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            for (let i = 1; i <= 5; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dayName = days[date.getDay()];
                
                forecast.push({
                    date: dayName,
                    temp: 20 + Math.floor(Math.random() * 10) - 3,
                    condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
                    icon: `https://openweathermap.org/img/wn/01d@2x.png`
                });
            }
            
            return forecast;
        } catch (error) {
            console.error('Error in getForecast:', error);
            return [];
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
        // Simple reverse lookup
        for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
            if (Math.abs(coords.lat - lat) < 2 && Math.abs(coords.lon - lon) < 2) {
                return city;
            }
        }
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