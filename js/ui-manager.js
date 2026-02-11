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
        forecastContainer: document.getElementById('forecast-container')
    };
    
    // Initialize UI
    function init() {
        loadTheme();
        loadUnits();
        loadSearchHistory();
        setupEventListeners();
        setupCanvas();
    }
    
    // Setup canvas for background effects
    function setupCanvas() {
        const canvas = elements.weatherCanvas;
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
        
        // Animation loop
        function animate() {
            drawWeatherBackground();
            requestAnimationFrame(animate);
        }
        
        window.addEventListener('resize', resizeCanvas);
        animate();
        
        return { drawWeatherBackground };
    }
    
    // Theme management
    function loadTheme() {
        const savedTheme = localStorage.getItem('weatherAppTheme') || 'light';
        setTheme(savedTheme);
    }
    
    function setTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('weatherAppTheme', theme);
        
        // Update theme toggle icon
        const icon = elements.themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        // Update meta theme color
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', 
            theme === 'dark' ? '#121212' : '#4361ee'
        );
    }
    
    function toggleTheme() {
        setTheme(currentTheme === 'light' ? 'dark' : 'light');
    }
    
    // Units management
    function loadUnits() {
        const savedUnits = localStorage.getItem('weatherAppUnits') || 'metric';
        isMetric = savedUnits === 'metric';
        updateUnitsDisplay();
    }
    
    function toggleUnits() {
        isMetric = !isMetric;
        localStorage.setItem('weatherAppUnits', isMetric ? 'metric' : 'imperial');
        updateUnitsDisplay();
        // Trigger unit conversion callback if set
        if (window.onUnitsChange) {
            window.onUnitsChange(isMetric);
        }
    }
    
    function updateUnitsDisplay() {
        elements.unitsToggle.textContent = isMetric ? '°C' : '°F';
    }
    
    // Search history management
    function loadSearchHistory() {
        const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
        updateHistoryDisplay(history);
    }
    
    function addToHistory(city) {
        let history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
        
        // Remove if already exists
        history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
        
        // Add to beginning
        history.unshift(city);
        
        // Keep only last 5 items
        history = history.slice(0, 5);
        
        localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
        updateHistoryDisplay(history);
    }
    
    function updateHistoryDisplay(history) {
        elements.historyList.innerHTML = '';
        
        history.forEach(city => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.textContent = city;
            item.addEventListener('click', () => {
                elements.citiesSelect.value = city.toLowerCase();
                elements.getWeatherBtn.click();
            });
            elements.historyList.appendChild(item);
        });
    }
    
    // UI State Management
    function showLoading() {
        elements.loadingState.classList.add('active');
        elements.errorState.classList.remove('active');
        elements.weatherContainer.classList.remove('active');
    }
    
    function hideLoading() {
        elements.loadingState.classList.remove('active');
    }
    
    function showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorState.classList.add('active');
        elements.loadingState.classList.remove('active');
        elements.weatherContainer.classList.remove('active');
    }
    
    function hideError() {
        elements.errorState.classList.remove('active');
    }
    
    function showWeather() {
        elements.weatherContainer.classList.add('active');
        elements.loadingState.classList.remove('active');
        elements.errorState.classList.remove('active');
    }
    
    // Display weather data
    function displayWeather(data, isMetric = true) {
        if (!data) return;
        
        // Update location and time
        weatherElements.cityName.textContent = data.name || 'N/A';
        weatherElements.localTime.textContent = data.formatted?.time || '--:-- --';
        weatherElements.currentDate.textContent = data.formatted?.date || '-- --- --';
        
        // Update temperature (with unit conversion if needed)
        const temp = isMetric ? data.main?.temp : WeatherService.convertTemp(data.main?.temp, true);
        const feelsLikeTemp = isMetric ? data.main?.feels_like : WeatherService.convertTemp(data.main?.feels_like, true);
        const tempMin = isMetric ? data.main?.temp_min : WeatherService.convertTemp(data.main?.temp_min, true);
        const tempMax = isMetric ? data.main?.temp_max : WeatherService.convertTemp(data.main?.temp_max, true);
        
        weatherElements.mainTemperature.textContent = temp !== undefined ? Math.round(temp) : '--';
        weatherElements.feelsLike.textContent = feelsLikeTemp !== undefined ? Math.round(feelsLikeTemp) : '--';
        weatherElements.tempRange.textContent = `${tempMin !== undefined ? Math.round(tempMin) : '--'}° / ${tempMax !== undefined ? Math.round(tempMax) : '--'}°`;
        
        // Update weather condition
        const weather = data.weather?.[0];
        weatherElements.weatherMain.textContent = weather?.main || 'N/A';
        weatherElements.weatherDescription.textContent = weather?.description || 'N/A';
        
        // Update icon
        if (weather?.icon) {
            weatherElements.weatherIcon.src = weather.icon;
            weatherElements.weatherIcon.alt = weather.description || 'Weather icon';
        }
        
        // Update other metrics
        weatherElements.humidity.textContent = data.main?.humidity !== undefined ? `${data.main.humidity}%` : 'N/A';
        
        const windSpeed = isMetric ? data.wind?.speed : WeatherService.convertSpeed(data.wind?.speed, true);
        const windGustSpeed = isMetric ? data.wind?.gust : WeatherService.convertSpeed(data.wind?.gust, true);
        const visibility = isMetric ? 
            WeatherService.convertVisibility(data.visibility) : 
            WeatherService.convertVisibility(data.visibility, true);
        
        weatherElements.wind.textContent = windSpeed !== undefined ? 
            `${windSpeed.toFixed(1)} ${isMetric ? 'm/s' : 'mph'}` : 'N/A';
        
        weatherElements.windGust.textContent = windGustSpeed !== undefined ? 
            `${windGustSpeed.toFixed(1)} ${isMetric ? 'm/s' : 'mph'}` : 'N/A';
        
        weatherElements.pressure.textContent = data.main?.pressure !== undefined ? `${data.main.pressure} hPa` : 'N/A';
        weatherElements.visibility.textContent = visibility !== undefined ? 
            `${visibility.toFixed(1)} ${isMetric ? 'km' : 'mi'}` : 'N/A';
        
        // Update sunrise/sunset
        weatherElements.sunriseTime.textContent = data.formatted?.sunrise || '--:-- AM';
        weatherElements.sunsetTime.textContent = data.formatted?.sunset || '--:-- PM';
        
        // Update tips
        if (data.tips && data.tips.length > 0) {
            weatherElements.weatherAdvice.textContent = data.tips[0];
        }
        
        // Update background canvas
        if (window.canvasManager) {
            window.canvasManager.drawWeatherBackground(weather?.main);
        }
        
        // Add to search history
        addToHistory(data.name);
        
        // Show weather container
        showWeather();
    }
    
    // Display forecast
    function displayForecast(forecastData) {
        if (!forecastData || !forecastData.length) return;
        
        weatherElements.forecastContainer.innerHTML = '';
        
        forecastData.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card';
            
            card.innerHTML = `
                <div class="forecast-date">${day.date}</div>
                <img src="${day.icon}" alt="${day.condition}" class="forecast-icon">
                <div class="forecast-temp">${Math.round(day.temp)}°</div>
                <div class="forecast-desc">${day.condition}</div>
            `;
            
            weatherElements.forecastContainer.appendChild(card);
        });
    }
    
    // Event listeners setup
    function setupEventListeners() {
        // Theme toggle
        elements.themeToggle.addEventListener('click', toggleTheme);
        
        // Units toggle
        elements.unitsToggle.addEventListener('click', toggleUnits);
        
        // Retry button
        elements.retryBtn.addEventListener('click', () => {
            elements.getWeatherBtn.click();
        });
        
        // Current location button
        elements.currentLocationBtn.addEventListener('click', async () => {
            try {
                showLoading();
                const coords = await WeatherService.getCurrentLocation();
                const city = await WeatherService.getCityFromCoords(coords.lat, coords.lon);
                elements.citiesSelect.value = city;
                elements.getWeatherBtn.click();
            } catch (error) {
                showError('Unable to get your location. Please select a city manually.');
            }
        });
        
        // Enter key in select
        elements.citiesSelect.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                elements.getWeatherBtn.click();
            }
        });
        
        // Prevent form submission
        elements.getWeatherBtn.addEventListener('click', (e) => {
            e.preventDefault();
        });
    }
    
    // Public API
    return {
        init,
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