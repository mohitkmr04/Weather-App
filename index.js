const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const grantAccessContainer = document.querySelector(".grant-location-container");
const grantAccessButton = document.querySelector("[data-grantAccess]");
const searchForm = document.querySelector("[data-searchForm]");
const loadingPage = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const apiErrorContainer = document.querySelector(".api-error-container");
const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");
const apiErrorBtn = document.querySelector("[data-apiErrorBtn]");
const messageText = document.querySelector("[data-messageText]");
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";

let initialTab = userTab;
initialTab.classList.add("current-tab");
//If I'm in user tab then i should display my current location weather
// getfromSessionStorage();

function switchTab(newTab) {
    apiErrorContainer.classList.remove("active");
    if (newTab !== initialTab) {
        initialTab.classList.remove("current-tab");
        initialTab = newTab;
        initialTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {

            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {

            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");

            getfromSessionStorage();
        }
        console.log(initialTab);
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        //If i won't get coordionates then i should display grantaccesscontainer to take access
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    //Let's vanish grantAccessContainer
    grantAccessContainer.classList.remove("active");
    //Enable loaderpage meanwhile location is finding
    loadingPage.classList.add("active");
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        console.log("User - Api Fetch Data", data);
        if (!data.sys) {
            throw data;
          }
        loadingPage.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch (error) {
        loadingPage.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorImg.style.display = "none";
        apiErrorMessage.innerText = `Error: ${error?.message}`;
        apiErrorBtn.addEventListener("click", fetchUserWeatherInfo);

    }

}

function renderWeatherInfo(data) {
    const cityName = document.querySelector("[data-cityName]");
    const countryFlag = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloud = document.querySelector("[data-cloudiness]");

    //Now let's extract values from data object and insert in UI
    cityName.innerText = data?.name;
    countryFlag.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    desc.innerText = data?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerText = `${data?.main?.temp} °C`;
    windspeed.innerText = `${data?.wind?.speed} m/s`;
    humidity.innerText = `${data?.main?.humidity}%`;
    cloud.innerText = `${data?.clouds?.all}%`;

}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition,showError);
    }
    else {
        grantAccessButton.style.display = "none";
        messageText.innerText = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}
// Handle any errors
function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        messageText.innerText = "You denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        messageText.innerText = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        messageText.innerText = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        messageText.innerText = "An unknown error occurred.";
        break;
    }
  }
getfromSessionStorage();


grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // let cityName = searchInput.value;

    if (searchInput.value === "") return;
    console.log(searchInput.value);   
    fetchSearchWeatherInfo(searchInput.value);
    // searchInput.value = "";
});

async function fetchSearchWeatherInfo(city) {
    loadingPage.classList.add("active");
    userInfoContainer.classList.remove("active");
    // grantAccessContainer.classList.remove("active");
    apiErrorContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        console.log("Search - Api Fetch Data", data);
        if (!data.sys) {
            throw data;
          }
        loadingPage.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);

    }
    catch (error) {
        console.log("Error", error.message);
        loadingPage.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorMessage.innerText = `${error?.message}`;
        apiErrorBtn.style.display = "none";
    }

}




// Important concept behind the used lines of code

// try {
//     const response = await fetch(
//         `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
//     );
//     const data = await response.json();
//     console.log("Search - Api Fetch Data", data);
//     if (!data.sys) {
//         throw data;
//       }
//     loadingPage.classList.remove("active");
//     userInfoContainer.classList.add("active");
//     renderWeatherInfo(data);

// }
// catch (error) {
//     console.log("Search - Api Fetch Error", error.message);
//     loadingPage.classList.remove("active");
//     apiErrorContainer.classList.add("active");
//     apiErrorMessage.innerText = `${error?.message}`;
//     apiErrorBtn.style.display = "none";
// }

// This code is attempting to fetch the current weather data for a specified city from the OpenWeatherMap API. It first tries to fetch the data from the API, then it checks if the data object contains a "sys" property. If it does not, an error is thrown. If the data is successfully fetched, the loading page is removed from view and the weather info is rendered. If an error occurs, the loading page is removed and an error message is displayed.


// what is sys property?

// The sys property is an object that contains information about the current system status of the weather data, such as the sunrise and sunset times, the type of weather, and other related information.
                                                        