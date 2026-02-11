// Weather Service Module – OpenWeatherMap + Intelligent Mock Fallback
const WeatherService = (() => {
    // ==================== CONFIGURATION ====================
    const OPENWEATHER_API_KEY = 'YOUR_API_KEY_HERE'; // 🔑 Get free key: https://home.openweathermap.org/users/sign_up
    const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
    const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
    const cache = new Map();

    // ==================== CITY COORDINATES (for fallback only) ====================
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

    // ==================== WEATHER CONDITION LIBRARY ====================
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
        },
        'Haze': { 
            icon: '🌫️', 
            color: '#C0C0C0',
            tips: ['Reduced visibility – drive carefully.', 'Limit outdoor exposure if sensitive.', 'Keep windows closed.']
        }
    };

    // ==================== UNIT CONVERSIONS ====================
    const convertTemp = (temp, toFahrenheit = false) => {
        if (temp === undefined || temp === null) return temp;
        return toFahrenheit ? (temp * 9/5) + 32 : temp;
    };

    const convertSpeed = (speed, toMph = false) => {
        if (speed === undefined || speed === null) return speed;
        return toMph ? speed * 2.237 : speed;
    };

    const convertVisibility = (visibility, toMiles = false) => {
        if (visibility === undefined || visibility === null) return visibility;
        return toMiles ? visibility / 1609.34 : visibility / 1000;
    };

    // ==================== CACHE ====================
    const getFromCache = (key) => {
        const cached = cache.get(key);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) return cached.data;
        cache.delete(key);
        return null;
    };

    const setToCache = (key, data) => {
        cache.set(key, { data, timestamp: Date.now() });
    };

    // ==================== FORMATTING ====================
    const formatTime = (timestamp) => {
        try {
            return new Date(timestamp * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } catch { return '--:-- --'; }
    };

    const formatDate = (timestamp) => {
        try {
            return new Date(timestamp * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return '-- --- --'; }
    };

    const getWeatherTips = (condition, temp) => {
        const baseTips = WEATHER_CONDITIONS[condition]?.tips || ['Check local weather updates.'];
        let tempTips = [];
        if (temp > 30) tempTips = ['Stay hydrated!', 'Avoid direct sun.', 'Wear light clothing.'];
        else if (temp < 5) tempTips = ['Wear layers!', 'Protect exposed skin.', 'Check heating.'];
        return [...baseTips, ...tempTips];
    };

    // ==================== ENHANCE RAW API DATA ====================
    const enhanceWeatherData = (data, cityName) => ({
        ...data,
        name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
        formatted: {
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            sunrise: formatTime(data.sys?.sunrise),
            sunset: formatTime(data.sys?.sunset)
        },
        tips: getWeatherTips(data.weather?.[0]?.main, data.main?.temp),
        uv: Math.floor(Math.random() * 8) + 1,        // mock – real UV requires separate API
        airQuality: ['Good', 'Moderate', 'Poor'][Math.floor(Math.random() * 3)]
    });

    // ==================== REALISTIC MOCK DATA (PER CITY) ====================
    const generateMockData = (cityName) => {
        const city = cityName.toLowerCase();
        
        // Realistic conditions for each city
        const cityConditions = {
            'london': 'Rain',
            'paris': 'Clouds',
            'tokyo': 'Clear',
            'mumbai': 'Mist',
            'beijing': 'Haze',
            'sydney': 'Clear',
            'chicago': 'Snow',
            'new york': 'Clouds',
            'los angeles': 'Clear',
            'dubai': 'Clear'
        };
        
        const condition = cityConditions[city] || 'Clear';
        const tempRanges = {
            'Rain': [8, 15],
            'Clouds': [12, 20],
            'Clear': [18, 28],
            'Snow': [-3, 4],
            'Mist': [10, 17],
            'Haze': [15, 25],
            'Thunderstorm': [20, 30],
            'Drizzle': [10, 18]
        };
        
        const [min, max] = tempRanges[condition] || [18, 24];
        const temp = Math.floor(min + Math.random() * (max - min));
        const humidity = 40 + Math.floor(Math.random() * 40);
        const pressure = 1000 + Math.floor(Math.random() * 30);
        const windSpeed = 2 + Math.random() * 8;
        
        return {
            name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
            main: {
                temp,
                feels_like: temp - 2 + Math.floor(Math.random() * 5),
                temp_min: temp - 3,
                temp_max: temp + 3,
                humidity,
                pressure
            },
            weather: [{
                main: condition,
                description: condition.toLowerCase(),
                icon: getIconForCondition(condition)
            }],
            wind: {
                speed: windSpeed,
                gust: windSpeed + 2 + Math.random() * 4
            },
            visibility: 8000 + Math.floor(Math.random() * 4000),
            sys: {
                sunrise: Math.floor(Date.now() / 1000) - 21600,
                sunset: Math.floor(Date.now() / 1000) + 21600
            },
            formatted: {
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                sunrise: '6:30 AM',
                sunset: '6:45 PM'
            },
            tips: getWeatherTips(condition, temp),
            uv: Math.floor(Math.random() * 8) + 1,
            airQuality: ['Good', 'Moderate', 'Poor'][Math.floor(Math.random() * 3)]
        };
    };

    const getIconForCondition = (condition) => {
        const icons = {
            'Clear': '01d',
            'Clouds': '03d',
            'Rain': '10d',
            'Snow': '13d',
            'Thunderstorm': '11d',
            'Drizzle': '09d',
            'Mist': '50d',
            'Haze': '50d'
        };
        return `https://openweathermap.org/img/wn/${icons[condition] || '01d'}@2x.png`;
    };

    // ==================== FORECAST (MOCK, BUT VARIED) ====================
    async function getForecast(city) {
        try {
            const current = await getWeather(city);
            const condition = current.weather[0].main;
            const forecast = [];
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            for (let i = 1; i <= 5; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dayName = days[date.getDay()];
                
                // Slight variation each day
                const possible = [condition];
                if (condition === 'Clear') possible.push('Clouds');
                if (condition === 'Clouds') possible.push('Clear', 'Rain');
                if (condition === 'Rain') possible.push('Clouds');
                
                forecast.push({
                    date: dayName,
                    temp: current.main.temp - 2 + Math.floor(Math.random() * 5),
                    condition: possible[Math.floor(Math.random() * possible.length)],
                    icon: getIconForCondition(condition)
                });
            }
            return forecast;
        } catch {
            return [];
        }
    }

    // ==================== MAIN WEATHER FETCH ====================
    async function getWeather(cityName) {
        const city = cityName.toLowerCase();
        const cacheKey = `weather_${city}`;
        const cachedData = getFromCache(cacheKey);
        if (cachedData) return cachedData;

        // --- TRY OPENWEATHERMAP FIRST (if API key is set) ---
        if (OPENWEATHER_API_KEY && OPENWEATHER_API_KEY !== 'YOUR_API_KEY_HERE') {
            try {
                const url = `${OPENWEATHER_BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_API_KEY}`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    const enhanced = enhanceWeatherData(data, cityName);
                    setToCache(cacheKey, enhanced);
                    return enhanced;
                }
            } catch (e) {
                console.warn(`OpenWeatherMap failed for ${cityName}:`, e.message);
            }
        }

        // --- FALLBACK: REALISTIC MOCK DATA ---
        console.log(`ℹ️ Using mock data for ${cityName}`);
        const mockData = generateMockData(cityName);
        setToCache(cacheKey, mockData);
        return mockData;
    }

    // ==================== GEOLOCATION ====================
    function getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
                (error) => reject(new Error('Unable to get location')),
                { enableHighAccuracy: true, timeout: 5000 }
            );
        });
    }

    async function getCityFromCoords(lat, lon) {
        // Simple reverse lookup – you can replace with a real geocoding API later
        for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
            if (Math.abs(coords.lat - lat) < 2 && Math.abs(coords.lon - lon) < 2) {
                return city;
            }
        }
        return 'new york';
    }

    // ==================== PUBLIC API ====================
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