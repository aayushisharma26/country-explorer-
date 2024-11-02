const API_URL = "https://restcountries.com/v3.1/all";
const countriesContainer = document.getElementById("countries-container");
const searchInput = document.getElementById("search-input");
const loadMoreButton = document.getElementById("load-more");
const favoritesContainer = document.getElementById("favorites-list");

let countries = [];
let displayedCountries = [];
let favorites = [];
const pageSize = 10;
let currentPage = 1;

// Load countries from the API
async function loadCountries() {
    const response = await fetch(API_URL);
    countries = await response.json();
    displayCountries();
}

// Display countries in cards
function displayCountries() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    displayedCountries = countries.slice(startIndex, endIndex);

    displayedCountries.forEach(country => {
        const countryCard = document.createElement("div");
        countryCard.classList.add("country-card");
        countryCard.innerHTML = `
            <img src="${country.flags.svg}" alt="${country.name.common} flag">
            <h2>${country.name.common}</h2>
            <button onclick="toggleFavorite('${country.name.common}')">
                ${favorites.includes(country.name.common) ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
            <button onclick="showDetails('${country.name.common}')">Details</button>
        `;
        countriesContainer.appendChild(countryCard);
    });
}

// Load more countries on button click
loadMoreButton.addEventListener("click", () => {
    currentPage++;
    displayCountries();
});

// Search countries
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filteredCountries = countries.filter(country => 
        country.name.common.toLowerCase().includes(query)
    );
    countriesContainer.innerHTML = "";
    displayedCountries = filteredCountries.slice(0, currentPage * pageSize);
    displayedCountries.forEach(country => {
        const countryCard = document.createElement("div");
        countryCard.classList.add("country-card");
        countryCard.innerHTML = `
            <img src="${country.flags.svg}" alt="${country.name.common} flag">
            <h2>${country.name.common}</h2>
            <button onclick="toggleFavorite('${country.name.common}')">
                ${favorites.includes(country.name.common) ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
            <button onclick="showDetails('${country.name.common}')">Details</button>
        `;
        countriesContainer.appendChild(countryCard);
    });
});

// Toggle favorite countries
function toggleFavorite(countryName) {
    if (favorites.includes(countryName)) {
        favorites = favorites.filter(fav => fav !== countryName);
    } else {
        if (favorites.length < 5) {
            favorites.push(countryName);
        } else {
            alert("You can only have 5 favorites.");
        }
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavorites();
}

// Show favorite countries
function updateFavorites() {
    favoritesContainer.innerHTML = "";
    favorites.forEach(fav => {
        const favoriteItem = document.createElement("div");
        favoriteItem.textContent = fav;
        favoritesContainer.appendChild(favoriteItem);
    });
}

// Show country details
function showDetails(countryName) {
    const country = countries.find(c => c.name.common === countryName);
    if (country) {
        const queryParams = new URLSearchParams({
            name: country.name.common,
            capital: country.capital,
            region: country.region,
            population: country.population,
            area: country.area,
            flag: country.flags.svg,
            languages: Object.values(country.languages).join(",")
        }).toString();

        // Navigate to the details page with query parameters
        window.location.href = `country-details.html?${queryParams}`;
    }
}

// Load favorites from local storage on page load
window.onload = () => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = storedFavorites;
    updateFavorites();
    loadCountries();
};
