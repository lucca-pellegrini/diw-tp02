import CONFIG from './config.js';

const { IMG_BASE_URL } = CONFIG;

// Função para buscar séries favoritas do JSON Server
export async function fetchFavoriteSeries() {
  const url = 'http://localhost:3001/favorites';
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar séries favoritas:', error);
    return [];
  }
}

// Função para adicionar uma série aos favoritos no JSON Server
export async function addFavoriteSeries(series) {
  if (!series || !series.id) {
    console.error('Série inválida:', series);
    return;
  }

  const url = 'http://localhost:3001/favorites';
  const favoriteSeries = {
    id: series.id,
    name: series.name,
    overview: series.overview,
    backdrop_path: `${IMG_BASE_URL}${series.backdrop_path}`
  };

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(favoriteSeries)
    });
    // Atualizar os favoritos após adicionar
    const updatedFavoriteSeries = await fetchFavoriteSeries();
    const favoriteSeriesContainer = document.getElementById('favorite-series');
    if (favoriteSeriesContainer) {
      window.renderFavoriteSeries(updatedFavoriteSeries);
    }
    const newSeriesContainer = document.getElementById('new-series');
    if (newSeriesContainer) {
      const newSeries = await fetchNewSeries(); // Atualizar a lista de novas séries
      window.updateNewSeriesButtons(newSeries, updatedFavoriteSeries);
    }
    const searchResultsContainer = document.getElementById('search-results');
    if (searchResultsContainer) {
      const query = document.getElementById('search-input').value.trim();
      if (query) {
        const searchResults = await searchSeries(query);
        renderSearchResults(searchResults, updatedFavoriteSeries);
      }
    }
  } catch (error) {
    console.error('Erro ao adicionar série aos favoritos:', error);
  }
}

// Função para remover uma série favorita do JSON Server
export async function removeFavoriteSeries(id) {
  const url = `http://localhost:3001/favorites/${id}`;
  try {
    await fetch(url, { method: 'DELETE' });
    // Atualizar os favoritos após remover
    const updatedFavoriteSeries = await fetchFavoriteSeries();
    const favoriteSeriesContainer = document.getElementById('favorite-series');
    if (favoriteSeriesContainer) {
      window.renderFavoriteSeries(updatedFavoriteSeries);
    }
    const newSeriesContainer = document.getElementById('new-series');
    if (newSeriesContainer) {
      const newSeries = await fetchNewSeries(); // Atualizar a lista de novas séries
      window.updateNewSeriesButtons(newSeries, updatedFavoriteSeries);
    }
    const searchResultsContainer = document.getElementById('search-results');
    if (searchResultsContainer) {
      const query = document.getElementById('search-input').value.trim();
      if (query) {
        const searchResults = await searchSeries(query);
        renderSearchResults(searchResults, updatedFavoriteSeries);
      }
    }
  } catch (error) {
    console.error('Erro ao remover série favorita:', error);
  }
}

// Tornar as funções globais
window.addFavoriteSeries = addFavoriteSeries;
window.removeFavoriteSeries = removeFavoriteSeries;
