const API_URL = "https://restcountries.com/v3.1/all";
const countriesContainer = document.getElementById("countries-container");
const searchInput = document.getElementById("search-input");
const loadMoreButton = document.getElementById("load-more");
const favoritesContainer = document.getElementById("favorites-list");
const favoritesSection = document.getElementById("favorites-section");
const filterDropdown = document.getElementById("filter-dropdown");

let countries = [];
let displayedCountries = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const pageSize = 10;
let currentPage = 1;

async function loadCountries() {
    const response = await fetch(API_URL);
    countries = await response.json();
    displayCountries();
    updateLoadMoreButton(); 
}

function displayCountries() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const selectedFilter = filterDropdown.value;
    const filteredCountries = countries.filter(country => {
        if (selectedFilter === "") return true; 
        return country.region === selectedFilter; 
    });

    const searchQuery = searchInput.value.toLowerCase();
    const searchedCountries = filteredCountries.filter(country =>
        country.name.common.toLowerCase().includes(searchQuery) 
    );

    displayedCountries = searchedCountries.slice(0, endIndex); 

    countriesContainer.innerHTML = ""; 
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

    updateLoadMoreButton();
}

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
    displayCountries(); 
}

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

        window.location.href = `country-details.html?${queryParams}`;
    }
}

function updateLoadMoreButton() {
    loadMoreButton.style.display = (currentPage * pageSize < countries.length) ? "block" : "none";
}

loadMoreButton.addEventListener("click", () => {
    currentPage++;
    displayCountries();
});

window.onload = () => {
    updateFavorites();
    loadCountries();
};

filterDropdown.addEventListener("change", () => {
    currentPage = 1; 
    displayCountries(); 
});

searchInput.addEventListener("input", () => {
    currentPage = 1; 
    displayCountries(); 
});
