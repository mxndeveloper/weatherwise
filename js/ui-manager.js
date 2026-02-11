// UI Manager Module
const UIManager = (() => {
    let isMetric = true;
    let currentTheme = 'light';
    
    // DOM Elements
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
    
    // Weather display elements
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
    
    // Initialize UI
    function init() {
        loadTheme();
        loadUnits();
        loadSearchHistory();
        setupEventListeners();
        setupCanvas();
    }
    
    // ==================== CANVAS BACKGROUND ====================
    function setupCanvas() {
        const canvas = elements.weatherCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        function drawWeatherBackground(condition = 'Clear') {
            if (!canvas.width || !canvas.height) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            
            switch(condition) {
                case 'Clear':
                    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
                    gradient.addColorStop(1, 'rgba(255, 140, 0, 0.05)');
                    drawSun(ctx, canvas);
                    break;
                case 'Clouds':
                    gradient.addColorStop(0, 'rgba(176, 196, 222, 0.1)');
                    gradient.addColorStop(1, 'rgba(112, 128, 144, 0.05)');
                    drawClouds(ctx, canvas);
                    break;
                case 'Rain':
                    gradient.addColorStop(0, 'rgba(70, 130, 180, 0.1)');
                    gradient.addColorStop(1, 'rgba(25, 25, 112, 0.05)');
                    drawRain(ctx, canvas);
                    break;
                default:
                    gradient.addColorStop(0, 'rgba(67, 97, 238, 0.1)');
                    gradient.addColorStop(1, 'rgba(58, 12, 163, 0.05)');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        function drawSun(ctx, canvas) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
            ctx.beginPath();
            ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 40, 0, Math.PI * 2);
            ctx.fill();
        }
        
        function drawClouds(ctx, canvas) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            for (let i = 0; i < 5; i++) {
                const x = (canvas.width * 0.1) + (i * canvas.width * 0.2);
                const y = canvas.height * (0.2 + Math.sin(Date.now() * 0.001 + i) * 0.05);
                const size = 30 + Math.sin(Date.now() * 0.001 + i) * 10;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.arc(x + size * 0.7, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
                ctx.arc(x - size * 0.7, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        function drawRain(ctx, canvas) {
            ctx.strokeStyle = 'rgba(135, 206, 235, 0.3)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 50; i++) {
                const x = (Math.random() * canvas.width);
                const y = (Date.now() * 0.1 + i * 20) % canvas.height;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 5, y + 20);
                ctx.stroke();
            }
        }
        
        resizeCanvas();
        drawWeatherBackground();
        
        function animate() {
            drawWeatherBackground();
            requestAnimationFrame(animate);
        }
        window.addEventListener('resize', resizeCanvas);
        animate();
        
        return { drawWeatherBackground };
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
            // Units are already in HTML, no need to change
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
        
        // ----- Background Canvas -----
        if (window.canvasManager) {
            window.canvasManager.drawWeatherBackground(weather?.main);
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
        // Theme toggle
        elements.themeToggle?.addEventListener('click', toggleTheme);
        
        // Units toggle
        elements.unitsToggle?.addEventListener('click', toggleUnits);
        
        // Retry button
        elements.retryBtn?.addEventListener('click', () => {
            elements.getWeatherBtn?.click();
        });
        
        // Current location button
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
        
        // Enter key in select
        elements.citiesSelect?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                elements.getWeatherBtn?.click();
            }
        });
        
        // Prevent form submission
        elements.getWeatherBtn?.addEventListener('click', (e) => {
            e.preventDefault();
        });
    }
    
    // ==================== PUBLIC API ====================
    return {
        init,
        setupCanvas,
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