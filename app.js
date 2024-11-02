const API_URL = "https://restcountries.com/v3.1/all";
const countriesContainer = document.getElementById("countries-container");
const searchInput = document.getElementById("search-input");
const loadMoreButton = document.getElementById("load-more");
const favoritesContainer = document.getElementById("favorites-list");
const favoritesSection = document.getElementById("favorites-section");

let countries = [];
let displayedCountries = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
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

    countriesContainer.innerHTML = ""; // Clear previous countries
    displayedCountries.forEach(country => {
        const countryCard = document.createElement("div");
        countryCard.classList.add("country-card");
        
        const isFavorite = favorites.includes(country.name.common);

        countryCard.innerHTML = `
            <img src="${country.flags.svg}" alt="${country.name.common} flag">
            <h2>${country.name.common}</h2>
            <button onclick="toggleFavorite('${country.name.common}')">
                <span class="heart-icon">${isFavorite ? '❤️' : '🤍'}</span> 
                ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
            <button onclick="showDetails('${country.name.common}')">Details</button>
        `;
        countriesContainer.appendChild(countryCard);
    });
}

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
    displayCountries(); // Update icons in cards
}

// Show favorite countries
function updateFavorites() {
    favoritesContainer.innerHTML = "";
    favorites.forEach(fav => {
        const favoriteItem = document.createElement("div");
        favoriteItem.classList.add("favorite-item");
        favoriteItem.textContent = fav;
        favoritesContainer.appendChild(favoriteItem);
    });
    favoritesSection.style.display = favorites.length > 0 ? "block" : "none";
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
    updateFavorites();
    loadCountries();
};
