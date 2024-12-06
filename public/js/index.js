import CONFIG from './config.js';

const { BASE_URL, IMG_BASE_URL, HEADERS } = CONFIG;

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
  const url = `${BASE_URL}/tv/airing_today?language=pt-BR&page=1`;
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
function renderNewSeries(series) {
  const newSeriesContainer = document.getElementById('new-series');
  const limitedSeries = series.slice(0, 12); // Limitar a 12 séries

  limitedSeries.forEach(serie => {
    const card = document.createElement('div');
    card.classList.add('col-md-4', 'mb-4');
    card.innerHTML = `
      <div class="card border-orange rounded">
        <img src="${IMG_BASE_URL}${serie.backdrop_path}" class="card-img-top rounded-top" alt="${serie.name}" />
        <div class="card-body">
          <h5 class="card-title">${serie.name}</h5>
          <p class="card-text">${serie.overview}</p>
          <a href="/serie.html?series_id=${serie.id}" class="btn btn-primary">Ver Detalhes</a>
        </div>
      </div>
    `;
    newSeriesContainer.appendChild(card);
  });
}

// Inicialização
async function init() {
  const popularSeries = await fetchPopularSeries();
  renderCarousel(popularSeries);

  const newSeries = await fetchNewSeries();
  renderNewSeries(newSeries);
}

document.addEventListener('DOMContentLoaded', init);
