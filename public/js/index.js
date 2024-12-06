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

// Inicialização
async function init() {
  const popularSeries = await fetchPopularSeries();
  renderCarousel(popularSeries);
}

document.addEventListener('DOMContentLoaded', init);
