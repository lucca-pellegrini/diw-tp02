import CONFIG from './config.js';
import { fetchFavoriteSeries, addFavoriteSeries, removeFavoriteSeries } from './favorites.js';

const { BASE_URL, IMG_BASE_URL, HEADERS } = CONFIG;

// Função para buscar séries por nome
export async function searchSeries(query) {
  const url = `${BASE_URL}/search/tv?query=${query}&include_adult=false&language=pt-BR&page=1`;
  const options = {
    method: 'GET',
    headers: HEADERS
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Erro ao buscar séries:', error);
    return [];
  }
}

// Função para renderizar os resultados da busca
export function renderSearchResults(series, favoriteSeries) {
  const searchResultsContainer = document.getElementById('search-results');
  searchResultsContainer.innerHTML = ''; // Limpar o contêiner antes de renderizar

  if (series.length === 0) {
    searchResultsContainer.innerHTML = '<p class="text-muted text-center w-100">Nenhuma série encontrada.</p>';
    return;
  }

  series.forEach(serie => {
    const isFavorite = favoriteSeries.some(fav => fav.id === serie.id);
    const card = document.createElement('div');
    card.classList.add('col-md-4', 'mb-4');
    card.innerHTML = `
      <div class="card border-orange rounded">
        <img src="${IMG_BASE_URL}${serie.backdrop_path}" class="card-img-top rounded-top" alt="${serie.name}" />
        <div class="card-body">
          <h5 class="card-title">${serie.name}</h5>
          <p class="card-text">${serie.overview}</p>
          <a href="/serie.html?series_id=${serie.id}" class="btn btn-primary">Ver Detalhes</a>
          ${isFavorite ? `
            <button class="btn btn-danger float-right" onclick="removeFavoriteSeries(${serie.id})">
              <i class="fa fa-trash"></i>
            </button>
          ` : `
            <button class="btn btn-warning float-right" onclick='addFavoriteSeries(${JSON.stringify(serie).replace(/'/g, "&apos;")})'>
              <i class="fa fa-plus"></i>
            </button>
          `}
        </div>
      </div>
    `;
    searchResultsContainer.appendChild(card);
  });
}

// Inicialização
async function init() {
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');

  searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query) {
      const series = await searchSeries(query);
      const favoriteSeries = await fetchFavoriteSeries();
      renderSearchResults(series, favoriteSeries);
    }
  });

  searchInput.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        const series = await searchSeries(query);
        const favoriteSeries = await fetchFavoriteSeries();
        renderSearchResults(series, favoriteSeries);
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

// Tornar as funções globais para serem usadas em favorites.js
window.searchSeries = searchSeries;
window.renderSearchResults = renderSearchResults;
