const API_URL = "https://restcountries.com/v3.1/all";
const countriesContainer = document.getElementById("countries-container");
const searchInput = document.getElementById("search-input");
const loadMoreButton = document.getElementById("load-more");
const filterDropdown = document.getElementById("filter-dropdown");
const languageDropdown = document.getElementById("language-dropdown");
const favoritesIcon = document.getElementById("favorites-icon");
const backButton = document.getElementById("back-button");
const sidebarContent = document.getElementById("sidebar-content");

let countries = [];
let displayedCountries = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const pageSize = 8; 
let currentPage = 1;
let showFavoritesOnly = false;

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

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

    if (currentPage === 1) {
        countriesContainer.innerHTML = "";
    }

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
        `;

        countryCard.addEventListener("click", () => showDetails(country.name.common));

        countriesContainer.appendChild(countryCard); 
    });

    updateLoadMoreButton();
    updateSidebarFavorites();
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
            languages: Object.values(country.languages || {}).join(", ")
        }).toString();

        window.location.href = `country-details.html?${queryParams}`;
    }
}

function updateLoadMoreButton() {
    const selectedFilter = filterDropdown.value;
    const selectedLanguage = languageDropdown.value.toLowerCase();
    const searchQuery = searchInput.value.toLowerCase();

    let filteredCountries = countries.filter(country => {
        if (selectedFilter !== "" && country.region !== selectedFilter) return false;
        if (selectedLanguage !== "" && !Object.values(country.languages || {}).some(lang => lang.toLowerCase() === selectedLanguage)) return false;
        if (searchQuery !== "" && !country.name.common.toLowerCase().includes(searchQuery)) return false;
        if (showFavoritesOnly && !favorites.includes(country.name.common)) return false;
        return true;
    });

    const filteredCountriesCount = filteredCountries.length;

    if (filteredCountriesCount <= currentPage * pageSize) {
        loadMoreButton.style.display = "none";
    } else {
        loadMoreButton.style.display = "block";
    }
}

loadMoreButton.addEventListener("click", () => {
    currentPage++;
    displayCountries();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

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

function updateSidebarFavorites() {
    sidebarContent.innerHTML = ""; 
    if (favorites.length > 0) {
        favorites.forEach(favCountry => {
            const favItem = document.createElement("li");
            favItem.textContent = favCountry;
            sidebarContent.appendChild(favItem);
        });
    } else {
        sidebarContent.innerHTML = "<p>No favorites selected</p>";
    }
}

function toggleFavorite(countryName) {
    const isFavorite = favorites.includes(countryName);

    if (isFavorite) {
        favorites = favorites.filter(fav => fav !== countryName);
    } else {
        favorites.push(countryName);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));

    displayCountries(); 
    updateSidebarFavorites(); 
}

window.onload = loadCountries;
