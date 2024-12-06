import CONFIG from './config.js';
import { fetchFavoriteSeries } from './favorites.js';

const { BASE_URL, IMG_BASE_URL, HEADERS } = CONFIG;

// Função para calcular datas
function getDateRangeForLastMonths(num) {
  const today = new Date();
  const maxDate = today.toISOString().split('T')[0]; // Data de hoje

  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(today.getMonth() - num);
  const minDate = twoMonthsAgo.toISOString().split('T')[0]; // Data de n meses atrás

  return { maxDate, minDate };
}

// Função para buscar séries populares
async function fetchPopularSeries() {
  const url = `${BASE_URL}/trending/tv/week?language=pt-BR`;
  const options = {
    method: 'GET',
    headers: HEADERS
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Erro ao buscar séries populares:', error);
    return [];
  }
}

// Função para buscar séries com episódios novos
async function fetchNewSeries() {
  const { maxDate, minDate } = getDateRangeForLastMonths(1);
  const url = `${BASE_URL}/discover/tv?air_date.gte=${minDate}&air_date.lte=${maxDate}&include_adult=false&include_null_first_air_dates=false&language=pt-BR&page=1&sort_by=popularity.desc&vote_count.gte=100&without_genres=10763,10767`;
  const options = {
    method: 'GET',
    headers: HEADERS
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Erro ao buscar novas séries:', error);
    return [];
  }
}

// Função para renderizar o carrossel
function renderCarousel(series) {
  const carouselIndicators = document.getElementById('carousel-indicators');
  const carouselInner = document.getElementById('carousel-inner');

  series.forEach((serie, index) => {
    // Criar indicadores do carrossel
    const indicator = document.createElement('li');
    indicator.setAttribute('data-target', '#carouselSeriesPopulares');
    indicator.setAttribute('data-slide-to', index);
    if (index === 0) indicator.classList.add('active');
    carouselIndicators.appendChild(indicator);

    // Criar itens do carrossel
    const carouselItem = document.createElement('div');
    carouselItem.classList.add('carousel-item');
    if (index === 0) carouselItem.classList.add('active');
    carouselItem.innerHTML = `
      <a href="/serie.html?series_id=${serie.id}">
        <img src="${IMG_BASE_URL}${serie.backdrop_path}" class="d-block w-100 rounded" alt="${serie.name}" />
        <div class="carousel-caption d-none d-md-block">
          <h5>${serie.name}</h5>
          <p>${serie.overview}</p>
        </div>
      </a>
    `;
    carouselInner.appendChild(carouselItem);
  });
}

// Função para renderizar os cards de novas séries
function renderNewSeries(series, favoriteSeries) {
  const newSeriesContainer = document.getElementById('new-series');
  const limitedSeries = series.slice(0, 12); // Limitar a 12 séries

  limitedSeries.forEach(serie => {
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
    newSeriesContainer.appendChild(card);
  });
}

// Função para renderizar os cards de séries favoritas
function renderFavoriteSeries(series) {
  const favoriteSeriesContainer = document.getElementById('favorite-series');
  favoriteSeriesContainer.innerHTML = ''; // Limpar o contêiner antes de renderizar

  if (series.length === 0) {
    favoriteSeriesContainer.innerHTML = '<p class="text-muted text-center w-100">Sua lista de favoritos está vazia. Adicione uma série aos favoritos para exibi-la aqui.</p>';
    return;
  }

  series.forEach(serie => {
    const card = document.createElement('div');
    card.classList.add('col-md-4', 'mb-4');
    card.innerHTML = `
      <div class="card border-orange rounded">
        <img src="${serie.backdrop_path}" class="card-img-top rounded-top" alt="${serie.name}" />
        <div class="card-body">
          <h5 class="card-title">${serie.name}</h5>
          <p class="card-text">${serie.overview}</p>
          <a href="/serie.html?series_id=${serie.id}" class="btn btn-primary">Ver Detalhes</a>
          <button class="btn btn-danger float-right" onclick="removeFavoriteSeries(${serie.id})">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    favoriteSeriesContainer.appendChild(card);
  });
}

// Função para atualizar os botões de adicionar/remover favoritos nas novas séries
function updateNewSeriesButtons(series, favoriteSeries) {
  const newSeriesContainer = document.getElementById('new-series');
  newSeriesContainer.innerHTML = ''; // Limpar o contêiner antes de renderizar

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
    newSeriesContainer.appendChild(card);
  });
}

// Tornar as funções globais
window.fetchNewSeries = fetchNewSeries;
window.renderFavoriteSeries = renderFavoriteSeries;
window.updateNewSeriesButtons = updateNewSeriesButtons;

// Inicialização
async function init() {
  const popularSeries = await fetchPopularSeries();
  renderCarousel(popularSeries);

  const newSeries = await fetchNewSeries();
  const favoriteSeries = await fetchFavoriteSeries();
  renderNewSeries(newSeries, favoriteSeries);
  renderFavoriteSeries(favoriteSeries);
}

document.addEventListener('DOMContentLoaded', init);
