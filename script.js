// ===== GLOBAL STATE =====
const apiKey = "0defc0fc05c4547370b38caa132c44a3";

let isFahrenheit = true;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// ===== TEMPERATURE CONVERSION =====
function convertTemp(kelvin){
    return isFahrenheit
        ? Math.round((kelvin - 273.15) * 1.8 + 32) + "°F"
        : Math.round(kelvin - 273.15) + "°C";
}

// ===== TOGGLES =====
function toggleUnits(){
    isFahrenheit = !isFahrenheit;
    getWeather();
}

function toggleDarkMode(){
    document.body.classList.toggle("dark");
}

// ===== MAIN FETCH FUNCTION (FIXED) =====
async function getWeather(){
    const city = document.getElementById("city").value;

    if(!city){
        alert("Please enter a city!");
        return;
    }

    try{
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`)
        ]);

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        if(weatherData.cod != 200){
            alert(`City not found: ${city}`);
            return;
        }

        displayWeather(weatherData);
        displayHourlyForecast(forecastData.list);
        displayDailyForecast(forecastData.list);

    }catch(error){
        console.error(error);
        alert("Failed to fetch weather data.");
    }
}

// ===== CURRENT WEATHER =====
function displayWeather(data){
    const tempDiv = document.getElementById("temp-div");
    const infoDiv = document.getElementById("weather-info");
    const icon = document.getElementById("weather-icon");

    // Clear old data
    tempDiv.innerHTML = "";
    infoDiv.innerHTML = "";

    const temperature = convertTemp(data.main.temp);
    const description = data.weather[0].description;
    const cityName = data.name;

    tempDiv.innerHTML = `<p>${temperature}</p>`;
    infoDiv.innerHTML = `<p>${cityName}</p><p>${description}</p>`;

    icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    icon.alt = description;
    icon.style.display = "block";
}

// ===== HOURLY FORECAST =====
function displayHourlyForecast(hourlyData){
    const container = document.getElementById("hourly-forecast");
    container.innerHTML = "";

    hourlyData.slice(0,8).forEach(item => {
        const hour = new Date(item.dt * 1000).getHours();

        container.innerHTML += `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
                <span>${convertTemp(item.main.temp)}</span>
            </div>
        `;
    });
}

// ===== 5-DAY FORECAST =====
function displayDailyForecast(data){
    const container = document.getElementById("daily-forecast");
    if(!container) return;

    container.innerHTML = "";

    const daily = data.filter(item => item.dt_txt.includes("12:00:00"));

    daily.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString();

        container.innerHTML += `
            <div class="day-item">
                <p>${date}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p>${convertTemp(day.main.temp)}</p>
            </div>
        `;
    });
}

// ===== FAVORITES =====
function saveFavorite(){
    const city = document.getElementById("city").value;

    if(city && !favorites.includes(city)){
        favorites.push(city);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderFavorites();
    }
}

function renderFavorites(){
    const list = document.getElementById("favorites");
    if(!list) return;

    list.innerHTML = "";

    favorites.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;

        li.onclick = () => {
            document.getElementById("city").value = city;
            getWeather();
        };

        list.appendChild(li);
    });
}

// ===== INIT =====
renderFavorites();