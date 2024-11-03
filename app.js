
const API_URL = "https://restcountries.com/v3.1/all";
const countriesContainer = document.getElementById("countries-container");
const searchInput = document.getElementById("search-input");
const loadMoreButton = document.getElementById("load-more");
const filterDropdown = document.getElementById("filter-dropdown");
const favoritesIcon = document.getElementById("favorites-icon");
const backButton = document.getElementById("back-button");

let countries = [];
let displayedCountries = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const pageSize = 10;
let currentPage = 1;
let showFavoritesOnly = false;

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
    let filteredCountries = countries.filter(country => {
        if (selectedFilter === "") return true;
        return country.region === selectedFilter;
    });

    const searchQuery = searchInput.value.toLowerCase();
    filteredCountries = filteredCountries.filter(country =>
        country.name.common.toLowerCase().includes(searchQuery)
    );

    if (showFavoritesOnly) {
        filteredCountries = filteredCountries.filter(country =>
            favorites.includes(country.name.common)
        );
    }

    displayedCountries = filteredCountries.slice(startIndex, endIndex);

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
    displayCountries();
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

favoritesIcon.addEventListener("click", () => {
    showFavoritesOnly = !showFavoritesOnly;
    favoritesIcon.textContent = showFavoritesOnly ? "⭐ Showing Favorites" : "⭐ Show Favorites";
    currentPage = 1; 
    displayCountries();
    backButton.style.display = showFavoritesOnly ? "block" : "none";
});

backButton.addEventListener("click", () => {
    showFavoritesOnly = false; 
    favoritesIcon.textContent = "⭐ Show Favorites"; 
    currentPage = 1; 
    displayCountries(); 
    backButton.style.display = "none"; 
});
