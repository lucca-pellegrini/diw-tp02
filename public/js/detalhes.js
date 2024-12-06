import CONFIG from './config.js';
import { fetchFavoriteSeries, addFavoriteSeries, removeFavoriteSeries } from './favorites.js';

const { BASE_URL, IMG_BASE_URL, HEADERS } = CONFIG;

// Função para buscar detalhes da série
async function fetchSeriesDetails(seriesId) {
  const url = `${BASE_URL}/tv/${seriesId}?language=pt-BR`;
  const options = {
    method: 'GET',
    headers: HEADERS
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar detalhes da série:', error);
    return null;
  }
}

// Função para buscar elenco da série
async function fetchSeriesCast(seriesId) {
  const url = `${BASE_URL}/tv/${seriesId}/aggregate_credits?language=pt-BR`;
  const options = {
    method: 'GET',
    headers: HEADERS
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data.cast;
  } catch (error) {
    console.error('Erro ao buscar elenco da série:', error);
    return [];
  }
}

// Função para renderizar os detalhes da série
function renderSeriesDetails(series) {
  const headerSection = document.getElementById('serie-header');
  const posterImage = document.getElementById('serie-poster');
  const titleElement = document.getElementById('serie-title');
  const genresElement = document.getElementById('serie-genres');
  const ratingElement = document.getElementById('serie-rating');
  const taglineElement = document.getElementById('serie-tagline');
  const synopsisElement = document.getElementById('serie-synopsis');
  const directorElement = document.getElementById('serie-director');
  const favoriteButton = document.getElementById('favorite-button');

  headerSection.style.backgroundImage = `url(${IMG_BASE_URL}${series.backdrop_path})`;
  posterImage.src = `${IMG_BASE_URL}${series.poster_path}`;
  posterImage.alt = `Pôster da Série ${series.name}`;
  titleElement.innerHTML = `${series.name} <span>(${series.first_air_date.split('-')[0]})</span>`;
  genresElement.textContent = series.genres.map(genre => genre.name).join(', ');
  ratingElement.innerHTML = Array(Math.floor(series.vote_average / 2)).fill('<i class="fas fa-star filled"></i>').join('') + 
                            (series.vote_average % 2 >= 0.5 ? '<i class="fas fa-star-half-alt filled"></i>' : '');
  taglineElement.textContent = series.tagline;
  synopsisElement.textContent = series.overview;
  directorElement.innerHTML = `<strong>Criador:</strong> ${series.created_by.map(creator => creator.name).join(', ')}`;

  // Verificar se a série está nos favoritos
  fetchFavoriteSeries().then(favoriteSeries => {
    const isFavorite = favoriteSeries.some(fav => fav.id === series.id);
    favoriteButton.textContent = isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos';
    favoriteButton.className = isFavorite ? 'btn btn-sm btn-danger ml-3' : 'btn btn-sm btn-orange ml-3';
    favoriteButton.onclick = isFavorite 
      ? () => removeFavoriteSeries(series.id).then(() => renderSeriesDetails(series))
      : () => addFavoriteSeries(series).then(() => renderSeriesDetails(series));
  });
}

// Função para renderizar o elenco da série
function renderSeriesCast(cast) {
  const castContainer = document.getElementById('cast-container');
  castContainer.innerHTML = ''; // Limpar o contêiner antes de renderizar

  cast.forEach(member => {
    const card = document.createElement('div');
    card.classList.add('card', 'cast-card', 'mr-3');
    card.innerHTML = `
      <img src="${IMG_BASE_URL}${member.profile_path}" alt="${member.name}" class="card-img-top" />
      <div class="card-body">
        <h5 class="card-title">${member.name}</h5>
        <p class="card-text">${member.roles.map(role => role.character).join(', ')}</p>
        <p class="card-text">
          <small class="text-muted">${member.total_episode_count} episódios</small>
        </p>
      </div>
    `;
    castContainer.appendChild(card);
  });
}

// Função para obter o ID da série da URL
function getSeriesIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('series_id');
}

// Inicialização
async function init() {
  const seriesId = getSeriesIdFromUrl();
  if (!seriesId) {
    console.error('ID da série não fornecido na URL');
    return;
  }

  const seriesDetails = await fetchSeriesDetails(seriesId);
  if (seriesDetails) {
    renderSeriesDetails(seriesDetails);

    const seriesCast = await fetchSeriesCast(seriesId);
    renderSeriesCast(seriesCast);
  }
}

document.addEventListener('DOMContentLoaded', init);
