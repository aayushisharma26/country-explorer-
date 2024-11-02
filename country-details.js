function goBack() {
    window.history.back();
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        name: params.get('name'),
        capital: params.get('capital'),
        region: params.get('region'),
        population: params.get('population'),
        area: params.get('area'),
        flag: params.get('flag'),
        languages: params.get('languages').split(',')
    };
}

const countryData = getQueryParams();
if (countryData.name) {
    document.getElementById('country-name').innerText = countryData.name;
    document.getElementById('country-details').innerHTML = `
        <img src="${countryData.flag}" alt="${countryData.name} flag" class="country-flag">
        <p><strong>Capital:</strong> ${countryData.capital}</p>
        <p><strong>Region:</strong> ${countryData.region}</p>
        <p><strong>Population:</strong> ${countryData.population}</p>
        <p><strong>Area:</strong> ${countryData.area} km²</p>
        <p><strong>Languages:</strong> ${countryData.languages.join(", ")}</p>
    `;
}
