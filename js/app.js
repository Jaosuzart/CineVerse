
const app = {

  state: {
    category: 'movie',
    page: 1,
    sort: 'popularity.desc',
    genre: 0,
    query: '',
    watchlist: JSON.parse(localStorage.getItem('cineverse_watchlist') || '[]'),
  },


  init() {
    this.bindEvents();
    this.loadGenres();
    this.fetchContent();
  },


  bindEvents() {
    // Abas de categoria
    $('#category-tabs').on('click', 'button[data-category]', (e) => {
      const category = $(e.currentTarget).data('category');
      this.switchCategory(category);
    });

    $('#search-form').on('submit', (e) => {
      e.preventDefault();
      const query = $('#search-input').val().trim();
      if (!query) return;
      this.state.query = query;
      this.state.page = 1;
      this.state.category = 'search';
      ui.setSectionTitle('search', query);
      this.fetchContent();
    });

    $('#search-input').on('input', function () {
      if ($(this).val() === '' && app.state.query) {
        app.state.query = '';
        app.switchCategory(app.state.category === 'search' ? 'movie' : app.state.category);
      }
    });

    $('#sort-select').on('change', function () {
      app.state.sort = $(this).val();
      app.state.page = 1;
      app.fetchContent();
    });

    $('#prev-btn').on('click', () => {
      if (this.state.page > 1) {
        this.state.page--;
        this.fetchContent();
        $('html, body').animate({ scrollTop: $('#catalog-section').offset().top - 80 }, 400);
      }
    });

    $('#next-btn').on('click', () => {
      this.state.page++;
      this.fetchContent();
      $('html, body').animate({ scrollTop: $('#catalog-section').offset().top - 80 }, 400);
    });

    $(document).on('click', '#hero-details-btn', function () {
      const id = $(this).data('id');
      const type = $(this).data('type') || 'movie';
      app.openDetails(id, type);
    });

    $(document).on('click', '#hero-watchlist-btn', function () {
      const id = $(this).data('id');
      const title = $(this).data('title');
      if (id) app.toggleWatchlist(id, title);
    });

    $('#filter-all').on('click', function () {
      $('#genre-filters button').removeClass('btn-warning active').addClass('btn-outline-light');
      $(this).removeClass('btn-outline-light').addClass('btn-warning active');
      app.state.genre = 0;
      app.state.page = 1;
      app.fetchContent();
    });

    $(window).on('scroll', () => {
      const scrolled = $(window).scrollTop() > 50;
      $('#main-navbar').toggleClass('shadow-lg', scrolled);
    });
  },


  switchCategory(category) {
    this.state.category = category;
    this.state.page = 1;
    this.state.genre = 0;
    this.state.query = '';
    $('#search-input').val('');

    $('#category-tabs button').removeClass('active text-warning').addClass('text-white');
    $(`#tab-${category}`).addClass('active text-warning').removeClass('text-white');

    $('#genre-filters button').removeClass('btn-warning active').addClass('btn-outline-light');
    $('#filter-all').removeClass('btn-outline-light').addClass('btn-warning active');

    ui.setSectionTitle(category);
    this.loadGenres();
    this.fetchContent();
  },


  loadGenres() {
    const type = this.state.category === 'tv' ? 'tv' : 'movie';

    api.getGenres(type)
      .then(res => ui.renderGenres(res.data.genres))
      .catch(() => { });
  },

  fetchContent() {
    const { category, page, sort, genre, query } = this.state;

    ui.showSkeletons();

    if (query) {
      api.searchMulti(query, page)
        .then(data => {
          ui.renderCards(data.results, 'search');
          ui.renderPagination(page, data.total_pages);
          $('#section-count').text(`${data.total_results.toLocaleString('pt-BR')} resultados`);
        })
        .catch(() => {
          ui.renderCards([], 'search');
          ui.toast('Erro ao buscar resultados. Tente novamente.', 'danger');
        });
      return;
    }

    if (category === 'trending') {
      api.getTrending(page)
        .done(res => {
          const { results, total_pages, total_results } = res.data;
          ui.renderCards(results, 'trending');
          ui.renderHero(results.slice(0, 5));
          ui.renderPagination(page, total_pages);
          $('#section-count').text(`${total_results.toLocaleString('pt-BR')} títulos`);
        })
        .fail(() => {
          ui.renderCards([], 'trending');
          ui.toast('Erro ao carregar trending.', 'danger');
        });
      return;
    }

    const fetcher = category === 'tv'
      ? api.getPopularTV(page, sort, genre)
      : api.getPopularMovies(page, sort, genre);

    fetcher
      .then(res => {
        const { results, total_pages, total_results } = res.data;
        ui.renderCards(results, category);
        ui.renderPagination(page, total_pages);
        $('#section-count').text(`${total_results.toLocaleString('pt-BR')} títulos`);

        if (page === 1) {
          ui.renderHero(results.slice(0, 5));
        }
      })
      .catch(err => {
        ui.renderCards([], category);
        if (err.response?.status === 401) {
          ui.toast('Chave de API inválida. Configure o TMDB_KEY em js/api.js.', 'warning');
        } else {
          ui.toast('Erro ao carregar conteúdo. Verifique sua conexão.', 'danger');
        }
      });
  },


  openDetails(id, type) {
    if (!id) {
      console.warn('[CineVerse] openDetails chamado sem id válido');
      return;
    }

    $('#modal-title').text('Carregando…');
    $('#modal-overview').text('');
    $('#modal-stats').empty();
    $('#modal-cast').html('<div class="spinner-border spinner-border-sm text-warning"></div> Carregando elenco...');
    $('#modal-videos').html('');
    $('#modal-similar').html('');
    $('#modal-backdrop').attr('src', '');
    $('#modal-poster').attr('src', '');

    const bsModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('detail-modal'));
    bsModal.show();

    api.getDetails(id, type)
      .then(data => ui.renderModal(data, type))
      .catch(() => {
        $('#modal-title').text('Erro ao carregar');
        $('#modal-cast').html('<p class="text-danger"><i class="bi bi-exclamation-triangle me-1"></i>Não foi possível carregar os detalhes.</p>');
      });
  },


  toggleWatchlist(id, title) {
    const list = this.state.watchlist;
    const index = list.indexOf(id);
    const added = index === -1;

    if (added) {
      list.push(id);
      $('#hero-watchlist-btn').html('<i class="bi bi-bookmark-fill me-1"></i>Na Watchlist');
      ui.toast(`"${title}" adicionado à watchlist!`, 'success');
    } else {
      list.splice(index, 1);
      $('#hero-watchlist-btn').html('<i class="bi bi-bookmark me-1"></i>Watchlist');
      ui.toast(`"${title}" removido da watchlist.`, 'info');
    }

    this.state.watchlist = list;
    localStorage.setItem('cineverse_watchlist', JSON.stringify(list));
  },
};

$(document).ready(() => {
  app.init();
});
