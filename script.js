const apiKey = '79d4603477e87cddaa5c384af5c78425'; 

const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');
const locationButton = document.getElementById('locationButton');
const currentWeather = document.getElementById('currentWeather');
const cityElement = document.getElementById('city');
const dateElement = document.getElementById('date');
const weatherIcon = document.getElementById('weatherIcon');
const temperatureElement = document.getElementById('temperature');
const windSpeedElement = document.getElementById('windSpeed');
const humidityElement = document.getElementById('humidity');
const forecastGrid = document.getElementById('forecastGrid');
const cityDropdown = document.getElementById('cityDropdown');
const citiesList = document.getElementById('citiesList');
const closeDropdown = document.getElementById('closeDropdown');

let recentCities = []; // array to store recent cities

searchButton.addEventListener('click', getWeatherData);
locationButton.addEventListener('click', getCurrentLocation);
closeDropdown.addEventListener('click', closeDropdownMenu);

// function to get weather data by city name
function getWeatherData() {
    const city = cityInput.value.trim();

    if (city === '') {
        alert('Please enter a city name.');
        return;
    }

    fetchWeatherData(city);
}

// function to get weather data by current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// fetch weather data based on city or location
function fetchWeatherData(cityOrLocation) {
    let url;
    if (cityOrLocation.includes(",")) { // check if it's latitude,longitude
        const [latitude, longitude] = cityOrLocation.split(',');
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    } else { 
        url = `https://api.openweathermap.org/data/2.5/weather?q=${cityOrLocation}&appid=${apiKey}`;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayCurrentWeather(data);
            getExtendedForecast(data.name);
            currentWeather.classList.remove('hidden');
            extendedForecast.classList.remove('hidden');

            // add city to recent searches
            addToRecentCities(data.name);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('City not found or API error. Please try again.');
        });
}

// function to display current weather data
function displayCurrentWeather(data) {
    cityElement.textContent = data.name;
    const date = new Date();
    dateElement.textContent = date.toLocaleDateString();
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    temperatureElement.textContent = Math.round(data.main.temp - 273.15);
    windSpeedElement.textContent = data.wind.speed;
    humidityElement.textContent = data.main.humidity; 
}

// function to fetch and display 5-day extended forecast
function getExtendedForecast(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&q=${city}`;

    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            alert('Error loading forecast data.');
        });
}

// function to display 5-day forecast
function displayForecast(data) {
    forecastGrid.innerHTML = '';

    const forecastDays = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    forecastDays.slice(0, 5).forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day', 'p-4', 'rounded-md', 'bg-gray-100', 'shadow-sm');

        const date = new Date(day.dt * 1000);
        dayElement.innerHTML = `
            <h3>${date.toLocaleDateString()}</h3>
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="Weather Icon" class="w-24 h-16 inline-block mx-auto mb-2">
            <p>Temp: ${Math.round(day.main.temp - 273.15)}°C</p>
            <p>Wind: ${day.wind.speed} m/s</p>
            <p>Humidity: ${day.main.humidity}%</p>
        `;

        forecastGrid.appendChild(dayElement);
    });
}

// function to get the user's current location
function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    fetchWeatherData(`${latitude},${longitude}`);
}

// function to handle geolocation errors
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

// add a city to the recent searches list
function addToRecentCities(city) {
    if (!recentCities.includes(city)) {
        recentCities.unshift(city); // Add to the beginning
        recentCities = recentCities.slice(0, 5); // Keep only the last 5
        updateRecentCitiesDropdown();
    }
}

// update the dropdown menu with recent cities
function updateRecentCitiesDropdown() {
    citiesList.innerHTML = '';
    recentCities.forEach(city => {
        const cityItem = document.createElement('li');
        cityItem.textContent = city;
        cityItem.addEventListener('click', () => {
            fetchWeatherData(city); // Get weather data when city is clicked
            closeDropdownMenu();
        });
        citiesList.appendChild(cityItem);
    });
}

// show dropdown menu
function showDropdownMenu() {
    cityDropdown.classList.remove('hidden');
}

// close dropdown menu
function closeDropdownMenu() {
    cityDropdown.classList.add('hidden');
}

// event listener to show dropdown when clicking the city input
cityInput.addEventListener('focus', showDropdownMenu);