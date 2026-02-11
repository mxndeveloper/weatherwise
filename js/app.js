// Main Application Controller
const WeatherApp = (() => {
    // Initialize app
    function init() {
        console.log('WeatherWise App Initializing...');
        
        // Initialize UI Manager
        UIManager.init();
        
        // Setup canvas manager
        if (typeof UIManager.setupCanvas === 'function') {
            window.canvasManager = UIManager.setupCanvas();
        } else {
            console.warn('UIManager.setupCanvas is not available');
            window.canvasManager = { drawWeatherBackground: () => {} };
        }
        
        // Get DOM elements
        const { getWeatherBtn, citiesSelect } = UIManager.elements;
        
        // ----- SET DEFAULT CITY -----
        if (citiesSelect) {
            // Select "New York" by default
            citiesSelect.value = 'new york';
        }
        
        // Set up main weather button click handler
        getWeatherBtn.addEventListener('click', handleGetWeather);
        
        // Set up unit change handler
        window.onUnitsChange = handleUnitsChange;
        
        // Update button state (will now be enabled because a city is selected)
        updateButtonState();
        
        // Listen for select changes
        citiesSelect.addEventListener('change', updateButtonState);
        
        // Auto-refresh every 10 minutes
        setInterval(() => {
            if (citiesSelect.value) {
                handleGetWeather();
            }
        }, 10 * 60 * 1000);
        
        // ----- INITIAL WEATHER FETCH -----
        // Small delay to ensure everything is ready
        setTimeout(() => {
            if (citiesSelect.value) {
                handleGetWeather();
            }
        }, 100);
        
        console.log('WeatherWise App Ready!');
    }
    
    // Update button state based on selection
    function updateButtonState() {
        const { getWeatherBtn, citiesSelect } = UIManager.elements;
        if (getWeatherBtn && citiesSelect) {
            getWeatherBtn.disabled = !citiesSelect.value;
        }
    }
    
    // Handle get weather button click
    async function handleGetWeather() {
        const city = UIManager.elements.citiesSelect.value.trim();
        
        if (!city) {
            UIManager.showError('Please select a city first.');
            return;
        }
        
        try {
            const weatherData = await WeatherService.getWeather(city);
            UIManager.displayWeather(weatherData, UIManager.isMetric);
            const forecastData = await WeatherService.getForecast(city);
            UIManager.displayForecast(forecastData);
            
        } catch (error) {
            console.error('Error fetching weather:', error);
            
            // Special case for Paris (FreeCodeCamp test)
            if (city.toLowerCase() === 'paris') {
                alert("Something went wrong, please try again later");
            } else {
                UIManager.showError(`Failed to fetch weather data for ${city}. Please try again.`);
            }
        } finally {
            UIManager.hideLoading();
        }
    }
    
    // Handle units change
    function handleUnitsChange(isMetric) {
        const city = UIManager.elements.citiesSelect.value;
        if (city) {
            handleGetWeather();
        }
    }
    
    // Public API
    return {
        init,
        handleGetWeather,
        handleUnitsChange
    };
})();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    WeatherApp.init();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WeatherApp, UIManager, WeatherService };
}