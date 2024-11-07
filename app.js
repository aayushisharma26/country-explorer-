
const API_URL = "https://restcountries.com/v3.1/all";
const countriesContainer = document.getElementById("countries-container");
const searchInput = document.getElementById("search-input");
const loadMoreButton = document.getElementById("load-more");
const filterDropdown = document.getElementById("filter-dropdown");
const languageDropdown = document.getElementById("language-dropdown");
const favoritesIcon = document.getElementById("favorites-icon");
const backButton = document.getElementById("back-button");

let countries = [];
let displayedCountries = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const pageSize = 10;
let currentPage = 1;
let showFavoritesOnly = false;

// Debounce function for search input
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Load countries data
async function loadCountries() {
    try {
        const response = await fetch(API_URL);
        countries = await response.json();
        displayCountries();
        updateLoadMoreButton();
    } catch (error) {
        console.error("Error loading countries:", error);
    }
}

// Display countries
function displayCountries() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const selectedFilter = filterDropdown.value;
    let filteredCountries = countries.filter(country => {
        if (selectedFilter === "") return true;
        return country.region === selectedFilter;
    });

    const selectedLanguage = languageDropdown.value.toLowerCase();
    filteredCountries = filteredCountries.filter(country => {
        if (selectedLanguage === "") return true;
        return Object.values(country.languages || {}).some(lang => lang.toLowerCase() === selectedLanguage);
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

    // Append countries instead of replacing them
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
        countriesContainer.appendChild(countryCard); // Append country cards
    });

    updateLoadMoreButton();
}

// Toggle favorite countries
function toggleFavorite(countryName) {
    if (favorites.includes(countryName)) {
        // Remove from favorites
        favorites = favorites.filter(fav => fav !== countryName);
    } else {
        if (favorites.length < 5) {
            favorites.push(countryName);
        } else {
            alert("You can only have 5 favorites.");
        }
    }

    // Update favorites in localStorage
    localStorage.setItem("favorites", JSON.stringify(favorites));

    // Re-render countries
    countriesContainer.innerHTML = ""; 
    currentPage = 1;
    displayCountries();
}

// Show details of selected country
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
            languages: Object.values(country.languages || {}).join(", ")
        }).toString();

        window.location.href = `country-details.html?${queryParams}`;
    }
}

// Update load more button visibility
function updateLoadMoreButton() {
    loadMoreButton.style.display = (currentPage * pageSize < countries.length && !showFavoritesOnly) ? "block" : "none";
}

// Load more countries
loadMoreButton.addEventListener("click", () => {
    currentPage++;
    displayCountries();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

// Event listeners for filters
filterDropdown.addEventListener("change", () => {
    currentPage = 1;
    countriesContainer.innerHTML = ""; 
    displayCountries();
});

languageDropdown.addEventListener("change", () => {
    currentPage = 1;
    countriesContainer.innerHTML = ""; 
    displayCountries();
});

searchInput.addEventListener("input", debounce(() => {
    currentPage = 1;
    countriesContainer.innerHTML = ""; 
    displayCountries();
}, 300));

// Toggle showing favorites only
favoritesIcon.addEventListener("click", () => {
    showFavoritesOnly = !showFavoritesOnly;
    favoritesIcon.textContent = showFavoritesOnly ? "⭐ Showing Favorites" : "⭐ Show Favorites";
    currentPage = 1;
    countriesContainer.innerHTML = ""; 
    displayCountries();
    backButton.style.display = showFavoritesOnly ? "block" : "none";
});

// Go back from favorites
backButton.addEventListener("click", () => {
    showFavoritesOnly = false;
    favoritesIcon.textContent = "⭐ Show Favorites";
    currentPage = 1;
    countriesContainer.innerHTML = ""; 
    displayCountries();
    backButton.style.display = "none";
});

// Load initial data on window load
window.onload = loadCountries;
