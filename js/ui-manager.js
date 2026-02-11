// UI Manager Module
const UIManager = (() => {
    let isMetric = true;
    let currentTheme = 'light';
    
    // ==================== DOM ELEMENTS ====================
    const elements = {
        weatherContainer: document.getElementById('weather-container'),
        loadingState: document.getElementById('loading-state'),
        errorState: document.getElementById('error-state'),
        errorMessage: document.getElementById('error-message'),
        themeToggle: document.getElementById('theme-toggle'),
        unitsToggle: document.getElementById('units-toggle'),
        getWeatherBtn: document.getElementById('get-weather-btn'),
        currentLocationBtn: document.getElementById('current-location-btn'),
        retryBtn: document.getElementById('retry-btn'),
        citiesSelect: document.getElementById('cities'),
        historyList: document.getElementById('history-list'),
        weatherTips: document.getElementById('weather-tips'),
        weatherAdvice: document.getElementById('weather-advice'),
        weatherCanvas: document.getElementById('weather-canvas')
    };
    
    const weatherElements = {
        location: document.getElementById('location'),
        cityName: document.querySelector('.city-name'),
        localTime: document.getElementById('local-time'),
        currentDate: document.getElementById('current-date'),
        mainTemperature: document.getElementById('main-temperature'),
        feelsLike: document.getElementById('feels-like'),
        weatherIcon: document.getElementById('weather-icon'),
        weatherMain: document.getElementById('weather-main'),
        weatherDescription: document.getElementById('weather-description'),
        humidity: document.getElementById('humidity'),
        wind: document.getElementById('wind'),
        windGust: document.getElementById('wind-gust'),
        pressure: document.getElementById('pressure'),
        visibility: document.getElementById('visibility'),
        tempRange: document.getElementById('temp-range'),
        sunriseTime: document.getElementById('sunrise-time'),
        sunsetTime: document.getElementById('sunset-time'),
        uvIndex: document.getElementById('uv-index'),
        airQuality: document.getElementById('air-quality'),
        forecastContainer: document.getElementById('forecast-container'),
        weatherAdvice: document.getElementById('weather-advice')
    };
    
    // ==================== CANVAS / PARTICLE SYSTEM (PROFESSIONAL) ====================
    let ctx;
    let particles = [];
    let canvasAnimationFrame = null;
    let lastTimestamp = 0;
    let weatherCondition = 'Clear';

    // Particle profiles per weather condition
    const PARTICLE_CONFIG = {
        Clear: {
            count: 30,
            types: ['sparkle', 'haze'],
            colors: ['rgba(255, 220, 150, 0.6)', 'rgba(255, 200, 100, 0.4)'],
            speed: 0.05,
            size: [2, 6],
            opacity: [0.4, 0.8],
            blur: false
        },
        Clouds: {
            count: 18,
            types: ['cloud'],
            colors: ['rgba(220, 240, 255, 0.5)', 'rgba(200, 220, 240, 0.45)'],
            speed: 0.02,
            size: [40, 90],
            opacity: [0.2, 0.35],
            blur: true
        },
        Rain: {
            count: 85,
            types: ['rain'],
            colors: ['rgba(160, 210, 255, 0.7)', 'rgba(130, 190, 255, 0.65)'],
            speed: 6,
            size: [12, 22],
            opacity: [0.5, 0.8],
            angle: -0.2, // slant
            blur: false
        },
        Snow: {
            count: 60,
            types: ['snow'],
            colors: ['rgba(255, 255, 255, 0.9)', 'rgba(235, 245, 255, 0.85)'],
            speed: 2,
            size: [3, 8],
            opacity: [0.7, 1],
            drift: 0.3,
            blur: true
        },
        Thunderstorm: {
            count: 100,
            types: ['rain'],
            colors: ['rgba(100, 170, 255, 0.8)', 'rgba(70, 140, 255, 0.75)'],
            speed: 10,
            size: [16, 26],
            opacity: [0.6, 0.9],
            angle: -0.3,
            lightning: true,
            blur: false
        },
        Mist: {
            count: 15,
            types: ['cloud'],
            colors: ['rgba(210, 220, 230, 0.35)', 'rgba(190, 200, 210, 0.3)'],
            speed: 0.01,
            size: [70, 120],
            opacity: [0.15, 0.25],
            blur: true
        }
    };

    function initParticles(condition) {
        weatherCondition = condition || 'Clear';
        particles = [];

        const cfg = PARTICLE_CONFIG[weatherCondition] || PARTICLE_CONFIG.Clear;
        const w = window.innerWidth;
        const h = window.innerHeight;

        for (let i = 0; i < cfg.count; i++) {
            const type = cfg.types[Math.floor(Math.random() * cfg.types.length)];
            const baseParticle = {
                x: Math.random() * w,
                y: Math.random() * h,
                type,
                opacity: cfg.opacity[0] + Math.random() * (cfg.opacity[1] - cfg.opacity[0]),
                color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)]
            };

            switch (type) {
                case 'sparkle':
                    particles.push({
                        ...baseParticle,
                        radius: cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]),
                        speedX: (Math.random() - 0.5) * cfg.speed,
                        speedY: (Math.random() - 0.5) * cfg.speed * 0.6,
                        pulse: 0.5 + Math.random() * 0.5,
                        pulseSpeed: 0.02 + Math.random() * 0.03
                    });
                    break;
                case 'haze':
                    particles.push({
                        ...baseParticle,
                        radius: 10 + Math.random() * 30,
                        speedX: (Math.random() - 0.5) * 0.03,
                        speedY: (Math.random() - 0.5) * 0.02,
                        opacity: cfg.opacity[0] * 0.5,
                        color: 'rgba(255, 235, 200, 0.2)'
                    });
                    break;
                case 'cloud':
                    particles.push({
                        ...baseParticle,
                        radius: cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]),
                        speedX: cfg.speed + Math.random() * 0.02,
                        speedY: (Math.random() - 0.5) * 0.003,
                        subParticles: 3 + Math.floor(Math.random() * 3) // for fluffy look
                    });
                    break;
                case 'rain':
                    particles.push({
                        ...baseParticle,
                        length: cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]),
                        speedY: cfg.speed + Math.random() * 3,
                        angle: cfg.angle || 0,
                        thickness: 1 + Math.random() * 1.2
                    });
                    break;
                case 'snow':
                    particles.push({
                        ...baseParticle,
                        radius: cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]),
                        speedX: (Math.random() - 0.5) * (cfg.drift || 0.2),
                        speedY: cfg.speed * 0.5 + Math.random() * cfg.speed,
                        sway: Math.random() * 0.5,
                        phase: Math.random() * 100
                    });
                    break;
            }
        }
    }

    function drawAnimatedBackground(timestamp) {
        if (!ctx || !elements.weatherCanvas) return;

        if (!lastTimestamp) lastTimestamp = timestamp;
        const deltaTime = Math.min(100, timestamp - lastTimestamp); // cap for tab inactive
        lastTimestamp = timestamp;

        const canvas = elements.weatherCanvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ----- 1. DYNAMIC GRADIENT (smooth, atmospheric) -----
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        const time = Date.now() * 0.0003;

        switch(weatherCondition) {
            case 'Clear':
                gradient.addColorStop(0, `rgba(255, 225, 150, ${0.15 + Math.sin(time) * 0.05})`);
                gradient.addColorStop(1, `rgba(135, 206, 235, ${0.1 + Math.cos(time * 0.7) * 0.03})`);
                break;
            case 'Clouds':
            case 'Mist':
                gradient.addColorStop(0, `rgba(200, 210, 225, ${0.2 + Math.sin(time * 0.2) * 0.05})`);
                gradient.addColorStop(1, `rgba(160, 170, 190, ${0.15 + Math.cos(time * 0.25) * 0.04})`);
                break;
            case 'Rain':
            case 'Thunderstorm':
                gradient.addColorStop(0, `rgba(80, 110, 140, ${0.25 + Math.sin(time * 0.5) * 0.05})`);
                gradient.addColorStop(1, `rgba(40, 60, 90, ${0.2 + Math.cos(time * 0.6) * 0.04})`);
                break;
            case 'Snow':
                gradient.addColorStop(0, `rgba(230, 245, 255, ${0.25 + Math.sin(time * 0.3) * 0.05})`);
                gradient.addColorStop(1, `rgba(210, 230, 250, ${0.2 + Math.cos(time * 0.4) * 0.04})`);
                break;
            default:
                gradient.addColorStop(0, 'rgba(67, 97, 238, 0.15)');
                gradient.addColorStop(1, 'rgba(58, 12, 163, 0.1)');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ----- 2. GLOBAL BLUR FOR CLOUDS/MIST -----
        if (weatherCondition === 'Clouds' || weatherCondition === 'Mist') {
            ctx.filter = 'blur(12px)';
        } else {
            ctx.filter = 'none';
        }

        // ----- 3. DRAW PARTICLES -----
        particles.forEach(p => {
            // Update position
            switch (p.type) {
                case 'sparkle':
                case 'haze':
                    p.x += p.speedX * deltaTime * 0.1;
                    p.y += p.speedY * deltaTime * 0.1;
                    if (p.pulse) {
                        p.radius += Math.sin(Date.now() * p.pulseSpeed) * 0.05;
                    }
                    break;
                case 'cloud':
                    p.x += p.speedX * deltaTime * 0.1;
                    p.y += p.speedY * deltaTime * 0.1;
                    break;
                case 'rain':
                    p.y += p.speedY * deltaTime * 0.08;
                    if (p.angle) p.x += p.angle * deltaTime * 0.1;
                    break;
                case 'snow':
                    p.x += p.speedX * deltaTime * 0.1 + Math.sin(Date.now() * 0.002 + p.phase) * p.sway;
                    p.y += p.speedY * deltaTime * 0.08;
                    break;
            }

            // Wrap around edges
            const margin = 100;
            if (p.x > canvas.width + margin) p.x = -margin;
            if (p.x < -margin) p.x = canvas.width + margin;
            if (p.y > canvas.height + margin) p.y = -margin;
            if (p.y < -margin) p.y = canvas.height + margin;

            // Draw
            ctx.save();
            ctx.globalAlpha = p.opacity || 0.5;

            if (p.type === 'rain') {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + (p.angle || 0) * 5, p.y + p.length);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.thickness || 1.5;
                ctx.stroke();
            } else if (p.type === 'snow' || p.type === 'sparkle' || p.type === 'haze') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius || 3, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = p.type === 'snow' ? 6 : 10;
                ctx.fill();
            } else if (p.type === 'cloud') {
                // Draw fluffy cloud using multiple circles
                const baseRadius = p.radius;
                ctx.fillStyle = p.color;
                ctx.shadowColor = 'rgba(255,255,255,0.3)';
                ctx.shadowBlur = 20;
                for (let j = 0; j < (p.subParticles || 1); j++) {
                    const offsetX = (j - 1) * baseRadius * 0.4;
                    const offsetY = Math.sin(j) * baseRadius * 0.2;
                    ctx.beginPath();
                    ctx.arc(p.x + offsetX, p.y + offsetY, baseRadius * (0.7 + j * 0.2), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        });

        // Reset filter
        ctx.filter = 'none';

        // ----- 4. LIGHTNING FLASH (thunderstorm only) -----
        if (weatherCondition === 'Thunderstorm' && Math.random() < 0.002) {
            ctx.fillStyle = 'rgba(255, 255, 220, 0.25)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Secondary quick flash
            setTimeout(() => {
                if (ctx) {
                    ctx.fillStyle = 'rgba(255, 255, 220, 0.15)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }, 50);
        }

        canvasAnimationFrame = requestAnimationFrame(drawAnimatedBackground);
    }

    function setupCanvas() {
        const canvas = elements.weatherCanvas;
        if (!canvas) {
            console.warn('Weather canvas not found');
            return { drawWeatherBackground: () => {} };
        }

        ctx = canvas.getContext('2d');

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles(weatherCondition);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        if (canvasAnimationFrame) {
            cancelAnimationFrame(canvasAnimationFrame);
        }
        canvasAnimationFrame = requestAnimationFrame(drawAnimatedBackground);

        return {
            drawWeatherBackground: (condition = 'Clear') => {
                initParticles(condition);
            }
        };
    }
    
    // ==================== THEME ====================
    function loadTheme() {
        const savedTheme = localStorage.getItem('weatherAppTheme') || 'light';
        setTheme(savedTheme);
    }
    
    function setTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('weatherAppTheme', theme);
        
        const icon = elements.themeToggle?.querySelector('i');
        if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content',
            theme === 'dark' ? '#121212' : '#4361ee'
        );
    }
    
    function toggleTheme() {
        setTheme(currentTheme === 'light' ? 'dark' : 'light');
    }
    
    // ==================== UNITS ====================
    function loadUnits() {
        const savedUnits = localStorage.getItem('weatherAppUnits') || 'metric';
        isMetric = savedUnits === 'metric';
        updateUnitsDisplay();
    }
    
    function toggleUnits() {
        isMetric = !isMetric;
        localStorage.setItem('weatherAppUnits', isMetric ? 'metric' : 'imperial');
        updateUnitsDisplay();
        if (window.onUnitsChange) {
            window.onUnitsChange(isMetric);
        }
    }
    
    function updateUnitsDisplay() {
        if (elements.unitsToggle) {
            elements.unitsToggle.textContent = isMetric ? '°C' : '°F';
        }
    }
    
    // ==================== SEARCH HISTORY ====================
    function loadSearchHistory() {
        const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
        updateHistoryDisplay(history);
    }
    
    function addToHistory(city) {
        let history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
        history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
        history.unshift(city);
        history = history.slice(0, 5);
        localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
        updateHistoryDisplay(history);
    }
    
    function updateHistoryDisplay(history) {
        if (!elements.historyList) return;
        elements.historyList.innerHTML = '';
        history.forEach(city => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.textContent = city;
            item.addEventListener('click', () => {
                if (elements.citiesSelect) {
                    elements.citiesSelect.value = city.toLowerCase();
                    elements.getWeatherBtn?.click();
                }
            });
            elements.historyList.appendChild(item);
        });
    }
    
    // ==================== UI STATE ====================
    function showLoading() {
        elements.loadingState?.classList.add('active');
        elements.errorState?.classList.remove('active');
        elements.weatherContainer?.classList.remove('active');
    }
    
    function hideLoading() {
        elements.loadingState?.classList.remove('active');
    }
    
    function showError(message) {
        if (elements.errorMessage) elements.errorMessage.textContent = message;
        elements.errorState?.classList.add('active');
        elements.loadingState?.classList.remove('active');
        elements.weatherContainer?.classList.remove('active');
    }
    
    function hideError() {
        elements.errorState?.classList.remove('active');
    }
    
    function showWeather() {
        elements.weatherContainer?.classList.add('active');
        elements.loadingState?.classList.remove('active');
        elements.errorState?.classList.remove('active');
    }
    
    // ==================== DISPLAY WEATHER ====================
    function displayWeather(data, isMetric = true) {
        if (!data) return;
    
        // ----- Location & Time -----
        if (weatherElements.cityName) weatherElements.cityName.textContent = data.name || 'N/A';
        if (weatherElements.localTime) weatherElements.localTime.textContent = data.formatted?.time || '--:-- --';
        if (weatherElements.currentDate) weatherElements.currentDate.textContent = data.formatted?.date || '-- --- --';
    
        // ----- Temperatures -----
        const temp = isMetric ? data.main?.temp : WeatherService.convertTemp(data.main?.temp, true);
        const feelsLikeTemp = isMetric ? data.main?.feels_like : WeatherService.convertTemp(data.main?.feels_like, true);
        const tempMin = isMetric ? data.main?.temp_min : WeatherService.convertTemp(data.main?.temp_min, true);
        const tempMax = isMetric ? data.main?.temp_max : WeatherService.convertTemp(data.main?.temp_max, true);
    
        if (weatherElements.mainTemperature) {
            weatherElements.mainTemperature.textContent = temp !== undefined ? Math.round(temp) : '--';
        }
        if (weatherElements.feelsLike) {
            weatherElements.feelsLike.textContent = feelsLikeTemp !== undefined ? Math.round(feelsLikeTemp) : '--';
        }
    
        // ----- Weather Condition -----
        const weather = data.weather?.[0];
        if (weatherElements.weatherMain) weatherElements.weatherMain.textContent = weather?.main || 'N/A';
        if (weatherElements.weatherDescription) weatherElements.weatherDescription.textContent = weather?.description || 'N/A';
    
        // ----- Weather Icon (full URL) -----
        if (weather?.icon && weatherElements.weatherIcon) {
            const iconUrl = weather.icon.startsWith('http')
                ? weather.icon
                : `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
            weatherElements.weatherIcon.src = iconUrl;
            weatherElements.weatherIcon.alt = weather.description || 'Weather icon';
        }
    
        // ----- STATS CARDS (with .value / .unit structure) -----
    
        // 1. Humidity
        const humidityEl = weatherElements.humidity;
        if (humidityEl) {
            const valSpan = humidityEl.querySelector('.value');
            const unitSpan = humidityEl.querySelector('.unit');
            if (valSpan) valSpan.textContent = data.main?.humidity ?? '--';
            if (unitSpan) unitSpan.textContent = '%';
        }
    
        // 2. Wind Speed
        const windSpeed = isMetric ? data.wind?.speed : WeatherService.convertSpeed(data.wind?.speed, true);
        const windEl = weatherElements.wind;
        if (windEl) {
            const valSpan = windEl.querySelector('.value');
            const unitSpan = windEl.querySelector('.unit');
            if (valSpan) valSpan.textContent = windSpeed !== undefined ? windSpeed.toFixed(1) : '--';
            if (unitSpan) unitSpan.textContent = isMetric ? 'm/s' : 'mph';
        }
    
        // 3. Pressure
        const pressureEl = weatherElements.pressure;
        if (pressureEl) {
            const valSpan = pressureEl.querySelector('.value');
            const unitSpan = pressureEl.querySelector('.unit');
            if (valSpan) valSpan.textContent = data.main?.pressure ?? '--';
            if (unitSpan) unitSpan.textContent = 'hPa';
        }
    
        // 4. Visibility
        const visibility = isMetric
            ? WeatherService.convertVisibility(data.visibility)
            : WeatherService.convertVisibility(data.visibility, true);
        const visEl = weatherElements.visibility;
        if (visEl) {
            const valSpan = visEl.querySelector('.value');
            const unitSpan = visEl.querySelector('.unit');
            if (valSpan) valSpan.textContent = visibility !== undefined ? visibility.toFixed(1) : '--';
            if (unitSpan) unitSpan.textContent = isMetric ? 'km' : 'mi';
        }
    
        // 5. Min/Max Temperature (special structure)
        const tempRangeEl = weatherElements.tempRange;
        if (tempRangeEl) {
            const minValSpan = tempRangeEl.querySelector('.temp-range-value span:first-child .value');
            const maxValSpan = tempRangeEl.querySelector('.temp-range-value span:last-child .value');
            if (minValSpan) minValSpan.textContent = tempMin !== undefined ? Math.round(tempMin) : '--';
            if (maxValSpan) maxValSpan.textContent = tempMax !== undefined ? Math.round(tempMax) : '--';
            // Units are already in HTML ('°')
        }
    
        // 6. Wind Gust
        const windGustSpeed = isMetric ? data.wind?.gust : WeatherService.convertSpeed(data.wind?.gust, true);
        const gustEl = weatherElements.windGust;
        if (gustEl) {
            const valSpan = gustEl.querySelector('.value');
            const unitSpan = gustEl.querySelector('.unit');
            if (valSpan) valSpan.textContent = windGustSpeed !== undefined ? windGustSpeed.toFixed(1) : '--';
            if (unitSpan) unitSpan.textContent = isMetric ? 'm/s' : 'mph';
        }
    
        // ----- Sunrise / Sunset -----
        if (weatherElements.sunriseTime) weatherElements.sunriseTime.textContent = data.formatted?.sunrise || '--:-- AM';
        if (weatherElements.sunsetTime) weatherElements.sunsetTime.textContent = data.formatted?.sunset || '--:-- PM';
    
        // ----- UV Index & Air Quality (mock) -----
        if (weatherElements.uvIndex) weatherElements.uvIndex.textContent = data.uv || '--';
        if (weatherElements.airQuality) weatherElements.airQuality.textContent = data.airQuality || '--';
    
        // ----- Weather Tips -----
        if (weatherElements.weatherAdvice && data.tips && data.tips.length > 0) {
            weatherElements.weatherAdvice.textContent = data.tips[0];
        }
    
        // ----- Background Canvas (Particle System) -----
        if (window.canvasManager) {
            window.canvasManager.drawWeatherBackground(weather?.main || 'Clear');
        }
    
        // ----- Add to search history -----
        if (data.name) addToHistory(data.name);
    
        // ----- Show weather container -----
        showWeather();
    }
    
    // ==================== DISPLAY FORECAST ====================
    function displayForecast(forecastData) {
        if (!forecastData || !forecastData.length || !weatherElements.forecastContainer) return;
    
        weatherElements.forecastContainer.innerHTML = '';
    
        forecastData.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card';
    
            let iconUrl = day.icon;
            if (iconUrl && !iconUrl.startsWith('http')) {
                iconUrl = `https://openweathermap.org/img/wn/${iconUrl}@2x.png`;
            }
    
            card.innerHTML = `
                <div class="forecast-date">${day.date || ''}</div>
                <img src="${iconUrl || ''}" alt="${day.condition || 'Weather'}" class="forecast-icon">
                <div class="forecast-temp">${Math.round(day.temp) || '--'}°</div>
                <div class="forecast-desc">${day.condition || ''}</div>
            `;
    
            weatherElements.forecastContainer.appendChild(card);
        });
    }
    
    // ==================== EVENT LISTENERS ====================
    function setupEventListeners() {
        elements.themeToggle?.addEventListener('click', toggleTheme);
        elements.unitsToggle?.addEventListener('click', toggleUnits);
        elements.retryBtn?.addEventListener('click', () => {
            elements.getWeatherBtn?.click();
        });
        elements.currentLocationBtn?.addEventListener('click', async () => {
            try {
                showLoading();
                const coords = await WeatherService.getCurrentLocation();
                const city = await WeatherService.getCityFromCoords(coords.lat, coords.lon);
                if (elements.citiesSelect) {
                    elements.citiesSelect.value = city;
                    elements.getWeatherBtn?.click();
                }
            } catch (error) {
                showError('Unable to get your location. Please select a city manually.');
            }
        });
        elements.citiesSelect?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                elements.getWeatherBtn?.click();
            }
        });
        elements.getWeatherBtn?.addEventListener('click', (e) => {
            e.preventDefault();
        });
    }
    
    // ==================== INITIALIZATION ====================
    function init() {
        loadTheme();
        loadUnits();
        loadSearchHistory();
        setupEventListeners();
        setupCanvas(); // now returns canvasManager
    }
    
    // ==================== PUBLIC API ====================
    return {
        init,
        setupCanvas,   // may be called externally, but used internally
        showLoading,
        hideLoading,
        showError,
        hideError,
        showWeather,
        displayWeather,
        displayForecast,
        get isMetric() { return isMetric; },
        get currentTheme() { return currentTheme; },
        elements,
        weatherElements
    };
})();