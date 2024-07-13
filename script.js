const apiKey = '52ebda0ba8227c0f6ed20687726d9610';
let isCelsius = true;
let searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];

document.getElementById('search').addEventListener('click', fetchWeather);
document.getElementById('toggle-units').addEventListener('click', toggleUnits);
document.getElementById('view-history').addEventListener('click', viewHistory);
document.getElementById('back').addEventListener('click', backToMainPage);

window.onload = () => {
    document.getElementById('location').value = '';
    fetchWeather();
};

function fetchWeather() {
    const location = document.getElementById('location').value.trim();
    if (!location) return;

    showLoader();

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather data not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            fetchForecast(location);
            updateSearchHistory(location);
            hideLoader();
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            hideLoader();
            alert('Weather data not found. Please try again.');
        });
}

function displayWeather(data) {
    const weatherContainer = document.getElementById('weather-container');
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

    weatherContainer.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <p>Temperature: ${data.main.temp}° ${isCelsius ? 'C' : 'F'}</p>
        <p>Feels like: ${data.main.feels_like}° ${isCelsius ? 'C' : 'F'}</p>
        <p>Weather: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} ${isCelsius ? 'm/s' : 'mph'}</p>
        <img src="${iconUrl}" class="weather-icon" alt="Weather icon">
        <p>Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</p>
        <p>Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</p>
    `;

    changeBackground(data.weather[0].main);
}

function fetchForecast(location) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Forecast data not found');
            }
            return response.json();
        })
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
        });
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '<h2>5-Day Forecast</h2>';
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

        forecastContainer.innerHTML += `
            <div class="forecast-box">
                <h3>${new Date(forecast.dt * 1000).toLocaleDateString()}</h3>
                <p>Temp: ${forecast.main.temp}° ${isCelsius ? 'C' : 'F'}</p>
                <p>Weather: ${forecast.weather[0].description}</p>
                <img src="${iconUrl}" class="weather-icon" alt="Weather icon">
            </div>
        `;
    }
}

function changeBackground(weather) {
    const body = document.body;
    if (weather.includes('rain')) {
        body.style.background = "linear-gradient(to bottom, #4f4f4f, #ffffff)";
    } else if (weather.includes('clear')) {
        body.style.background = "linear-gradient(to bottom, #87CEEB, #ffffff)";
    } else if (weather.includes('clouds')) {
        body.style.background = "linear-gradient(to bottom, #d3d3d3, #ffffff)";
    } else {
        body.style.background = "linear-gradient(to bottom, #87CEEB, #ffffff)";
    }
}

function toggleUnits() {
    isCelsius = !isCelsius;
    fetchWeather();
}

function showLoader() {
    document.getElementById('loader').classList.remove('hidden');
}

function hideLoader() {
    document.getElementById('loader').classList.add('hidden');
}

function updateSearchHistory(location) {
    if (!searchHistory.includes(location)) {
        searchHistory.push(location);
        localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
    }
}

function viewHistory() {
    document.getElementById('history-page').classList.remove('hidden');
    document.querySelector('.container').classList.add('hidden');
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    searchHistory.forEach(location => {
        const li = document.createElement('li');
        li.textContent = location;
        li.addEventListener('click', () => {
            document.getElementById('location').value = location;
            fetchWeather();
            backToMainPage();
        });
        historyList.appendChild(li);
    });
}

function backToMainPage() {
    document.getElementById('history-page').classList.add('hidden');
    document.querySelector('.container').classList.remove('hidden');
}