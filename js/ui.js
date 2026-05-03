const ui = {
  ratingBadge(vote) {
    const v = parseFloat(vote).toFixed(1);
    if (v >= 7) {
      return `<span class="badge bg-success"><i class="bi bi-star-fill me-1"></i>${v}</span>`;
    } else if (v >= 5) {
      return `<span class="badge text-dark" style="background-color:#E8650A;"><i class="bi bi-star-fill me-1"></i>${v}</span>`;
    } else {
      return `<span class="badge bg-danger"><i class="bi bi-star-fill me-1"></i>${v}</span>`;
    }
  },

  year(dateStr) {
    return dateStr ? dateStr.substring(0, 4) : '—';
  },

  runtime(min) {
    if (!min) return '—';
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  },

  showSkeletons() {
    const skeletons = Array.from({ length: 10 }, () => `
      <article class="col">
        <div class="card bg-secondary-subtle border-secondary h-100 placeholder-glow">
          <div class="placeholder rounded-top" style="height:280px;"></div>
          <div class="card-body">
            <p class="placeholder col-8 mb-2"></p>
            <p class="placeholder col-5 mb-1"></p>
            <p class="placeholder col-12"></p>
            <p class="placeholder col-12"></p>
            <p class="placeholder col-7"></p>
          </div>
        </div>
      </article>
    `).join('');
    $('#cards-grid').html(skeletons);
    $('#empty-state').addClass('d-none');
  },

  renderCards(items, category) {
    const $grid = $('#cards-grid').empty();

    if (!items || items.length === 0) {
      $('#empty-state').removeClass('d-none');
      $('#pagination').addClass('d-none');
      return;
    }

    $('#empty-state').addClass('d-none');
    $('#pagination').removeClass('d-none');

    $.each(items, (_, item) => {
      const type    = item.media_type || (category === 'tv' ? 'tv' : 'movie');
      const title   = item.title || item.name;
      const date    = item.release_date || item.first_air_date;
      const poster  = api.posterUrl(item.poster_path, 'w185');

      const $article = $('<article>').addClass('col');
      const $card = $('<div>')
        .addClass('card bg-secondary-subtle text-body border border-secondary h-100 shadow-sm')
        .css({ cursor: 'pointer', transition: 'transform .2s, border-color .2s' })
        .on('mouseenter', function () {
          $(this).css({ transform: 'translateY(-4px)' })
                 .addClass('border-warning');
        })
        .on('mouseleave', function () {
          $(this).css({ transform: '' })
                 .removeClass('border-warning');
        })
        .on('click', function () {
          app.openDetails(item.id, type);
        })
        .attr({ 'data-id': item.id, 'data-type': type, role: 'button', tabindex: '0' })
        .on('keypress', function (e) {
          if (e.key === 'Enter') app.openDetails(item.id, type);
        });

      const $img = $('<img>')
        .addClass('card-img-top card-poster')
        .attr({ 
          src: poster, 
          alt: title, 
          loading: 'lazy',
          width: '185',
          height: '278'
        });

      const $badge = $('<span>')
        .addClass(`badge position-absolute top-0 start-0 m-2 ${type === 'tv' ? 'bg-info text-dark' : 'bg-warning text-dark'}`)
        .text(type === 'tv' ? 'Série' : 'Filme');

      const $imgWrapper = $('<div>').addClass('position-relative').append($img, $badge);

      const $body  = $('<div>').addClass('card-body p-2 d-flex flex-column');
      const $title = $('<h3>').addClass('card-title h6 fw-bold mb-1 text-truncate').text(title);

      const overview = item.overview || 'Sinopse não disponível.';
      const $overview = $('<p>')
        .addClass('card-text text-body-secondary mb-2 card-overview')
        .text(overview);

      const $meta = $('<p>').addClass('card-text small text-body-secondary mt-auto mb-0 d-flex justify-content-between');
      $meta.append(
        $('<span>').text(this.year(date)),
        $(this.ratingBadge(item.vote_average))
      );

      $body.append($title, $overview, $meta);
      $card.append($imgWrapper, $body);
      $article.append($card);
      $grid.append($article);
    });
  },

  renderHero(items) {
    if (!items || items.length === 0) return;

    const firstId = items[0]?.id;
    if (this._heroFirstId === firstId && this._heroInterval) return;
    this._heroFirstId = firstId;

    if (this._heroInterval) {
      clearInterval(this._heroInterval);
      this._heroInterval = null;
    }

    let current = 0;

    const update = (item, animate = true) => {
      const type  = item.media_type || 'movie';
      const title = item.title || item.name;
      const date  = item.release_date || item.first_air_date;
      const bg    = api.backdropUrl(item.backdrop_path);

      if (current === 0 && !document.getElementById('lcp-preload') && bg) {
      const $preload = $('<link>')
        .attr('id', 'lcp-preload')
        .attr('rel', 'preload')
        .attr('as', 'image')
        .attr('href', bg)
        .attr('fetchpriority', 'high');
      $('head').append($preload);
    }
      const $heroBg = $('#hero-bg');
      if (animate) {
        $heroBg.fadeOut(200, function () {
          $(this).css('backgroundImage', bg ? `url(${bg})` : 'none').fadeIn(400);
        });
        $('#hero-title').fadeOut(150, function () { $(this).text(title).fadeIn(300); });
      } else {
        $heroBg.css('backgroundImage', bg ? `url(${bg})` : 'none');
        $('#hero-title').text(title);
      }

      $('#hero-overview').text(item.overview || '');
      $('#hero-badge').text(type === 'tv' ? 'Série em Alta' : 'Filme em Alta');

      const $meta = $('#hero-meta').empty();
      $('<li>').addClass('list-inline-item')
        .append($('<span>').addClass('badge bg-secondary').html(`<i class="bi bi-calendar me-1"></i>${ui.year(date)}`))
        .appendTo($meta);
      $('<li>').addClass('list-inline-item')
        .append($(ui.ratingBadge(item.vote_average)))
        .appendTo($meta);

      $('#hero-details-btn').data('id', item.id).data('type', type);
      $('#hero-watchlist-btn').data('id', item.id).data('title', title);
    };

    const $dots = $('#hero-dots').empty();
    const maxDots = Math.min(items.length, 5);
    for (let i = 0; i < maxDots; i++) {
      const $dot = $('<button>')
        .addClass(`rounded-circle p-0 mx-1 ${i === 0 ? 'bg-warning' : 'bg-secondary'}`)
        .attr('aria-label', `Ir para slide ${i + 1}`)
        .on('click', () => {
          current = i;
          update(items[i], true);
          $dots.find('button').removeClass('bg-warning').addClass('bg-secondary');
          $dot.removeClass('bg-secondary').addClass('bg-warning');
          resetInterval();
        });
      $dots.append($dot);
    }

    update(items[0], false);

    const resetInterval = () => {
      if (this._heroInterval) clearInterval(this._heroInterval);
      this._heroInterval = setInterval(() => {
        current = (current + 1) % maxDots;
        update(items[current], true);
        $dots.find('button').eq(current)
          .removeClass('bg-secondary').addClass('bg-warning')
          .siblings().removeClass('bg-warning').addClass('bg-secondary');
      }, 6000);
    };
    resetInterval();
  },

  renderGenres(genres) {
    const $container = $('#genre-filters');
    $container.find('button:not(#filter-all)').remove();

    $.each(genres, (_, genre) => {
      $('<button>')
        .addClass('btn btn-outline-light btn-sm')
        .attr('data-genre', genre.id)
        .text(genre.name)
        .on('click', function () {
          $container.find('button').removeClass('btn-warning active').addClass('btn-outline-light');
          $(this).removeClass('btn-outline-light').addClass('btn-warning active');
          app.state.genre = genre.id;
          app.state.page  = 1;
          app.fetchContent();
        })
        .appendTo($container);
    });
  },

  renderModal({ details, credits, videos, similar }, type) {
    const title   = details.title || details.name;
    const date    = details.release_date || details.first_air_date;
    const poster  = api.posterUrl(details.poster_path, 'w185');
    const backdrop= api.backdropUrl(details.backdrop_path);

    $('#modal-backdrop').attr({ src: backdrop || poster, alt: title });
    $('#modal-poster').attr({ src: poster, alt: title });
    $('#modal-title').text(title);

    const $badges = $('#modal-badges').empty();
    $.each(details.genres || [], (_, g) => {
      $('<span>').addClass('badge bg-secondary').text(g.name).appendTo($badges);
    });

    const $stats = $('#modal-stats').empty();
    const durationStat = type === 'tv'
      ? [
          { icon: 'bi-collection-play text-warning', label: 'Temporadas', value: details.number_of_seasons  ?? '—' },
          { icon: 'bi-camera-video text-warning',     label: 'Episódios',  value: details.number_of_episodes ?? '—' },
        ]
      : [
          { icon: 'bi-clock', label: 'Duração', value: ui.runtime(details.runtime || details.episode_run_time?.[0]) },
        ];

    const statsData = [
      { icon: 'bi-star-fill text-warning', label: 'Nota',       value: `${parseFloat(details.vote_average).toFixed(1)} / 10` },
      { icon: 'bi-people text-info',       label: 'Votos',      value: details.vote_count?.toLocaleString('pt-BR') || '—' },
      { icon: 'bi-calendar text-success',  label: 'Lançamento', value: date || '—' },
      ...durationStat,
    ];
    $.each(statsData, (_, s) => {
      $('<li>')
        .addClass('list-inline-item text-center mx-3 mb-2')
        .html(`
          <div class="h5 mb-0"><i class="bi ${s.icon}"></i></div>
          <div class="fw-bold">${s.value}</div>
          <div class="text-muted small">${s.label}</div>
        `)
        .appendTo($stats);
    });

    $('#modal-overview').addClass('text-body-secondary').text(details.overview || 'Sinopse não disponível.');

    const $cast = $('#modal-cast').empty();
    const cast  = credits.cast?.slice(0, 8) || [];
    if (cast.length === 0) {
      $cast.html('<p class="text-muted small">Elenco não disponível.</p>');
    } else {
      $.each(cast, (_, actor) => {
        const photo = api.posterUrl(actor.profile_path, 'w92');
        $('<figure>')
          .addClass('text-center mb-0')
          .html(`
            <img src="${photo}" alt="${actor.name}"
              class="rounded-circle mb-1 object-fit-cover border border-secondary"
              style="width:64px; height:64px;"
              onerror="this.src='https://placehold.co/64x64/343a40/adb5bd?text=?'"
            />
            <figcaption class="small fw-semibold text-truncate" style="max-width:80px;">${actor.name}</figcaption>
            <figcaption class="text-muted" style="font-size:.7rem; max-width:80px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">${actor.character || ''}</figcaption>
          `)
          .appendTo($cast);
      });
    }

    const $videos = $('#modal-videos').empty();
    const allYt   = (videos.results || []).filter(v => v.site === 'YouTube');
    const trailers = allYt.filter(v => v.type === 'Trailer');
    const ytVideos = (trailers.length ? trailers : allYt).slice(0, 3);

    if (ytVideos.length === 0) {
      $videos.html('<p class="text-muted small">Nenhum vídeo disponível.</p>');
    } else {
      const $row = $('<div>').addClass('row g-3 w-100');

      $.each(ytVideos, (_, v) => {
        const embedUrl = `https://www.youtube.com/embed/${v.key}`
          + `?vq=hd2160&hd=1&rel=0&modestbranding=1`;

        const $col = $('<div>').addClass('col-12 col-md-6 col-xl-4');
        const $figure = $('<figure>').addClass('mb-0');
        const $iframeWrapper = $('<div>').addClass('ratio ratio-16x9 rounded overflow-hidden shadow');

        const $iframe = $('<iframe>')
          .attr({
            src            : embedUrl,
            title          : v.name,
            allow          : 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
            allowfullscreen: true,
            loading        : 'lazy',
            frameborder    : '0',
          });

        const $caption = $('<figcaption>')
          .addClass('text-muted small mt-2 text-truncate fw-semibold')
          .attr('title', v.name)
          .html(`<i class="bi bi-youtube text-danger me-1"></i>${v.name} <span class="badge bg-secondary ms-1" style="font-size:.65rem;">4K</span>`);

        $iframeWrapper.append($iframe);
        $figure.append($iframeWrapper, $caption);
        $col.append($figure);
        $row.append($col);
      });

      $videos.append($row);
    }

    const $similar = $('#modal-similar').empty();
    const similarItems = (similar.results || []).slice(0, 5);
    if (similarItems.length === 0) {
      $similar.html('<p class="text-muted small col-12">Nenhum título similar encontrado.</p>');
    } else {
      $.each(similarItems, (_, item) => {
        const stitle  = item.title || item.name;
        const sposter = api.posterUrl(item.poster_path, 'w154');
        $('<article>')
          .addClass('col')
          .html(`
            <div class="card bg-secondary border-0 h-100" role="button" tabindex="0"
              style="cursor:pointer;"
              data-id="${item.id}" data-type="${type}">
              <img src="${sposter}" alt="${stitle}"
                class="card-img-top object-fit-cover" style="height:150px;"
                onerror="this.src='https://placehold.co/154x231/343a40/adb5bd?text=?'"
              />
              <div class="card-body p-1 text-center">
                <p class="card-text small text-white fw-semibold text-truncate mb-0">${stitle}</p>
              </div>
            </div>
          `)
          .on('click', function () {
            const bsModal = bootstrap.Modal.getInstance(document.getElementById('detail-modal'));
            bsModal.hide();
            setTimeout(() => app.openDetails(item.id, type), 350);
          })
          .appendTo($similar);
      });
    }
    const existingModal = bootstrap.Modal.getInstance(document.getElementById('detail-modal'));
    if (!existingModal) {
      bootstrap.Modal.getOrCreateInstance(document.getElementById('detail-modal')).show();
    }
  },

  renderPagination(current, total) {
    const $pages = $('#page-numbers').empty();
    const maxPages = Math.min(total, 500);

    $('#prev-btn').prop('disabled', current <= 1);
    $('#next-btn').prop('disabled', current >= maxPages);

    let start = Math.max(1, current - 2);
    let end   = Math.min(maxPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    for (let p = start; p <= end; p++) {
      $('<li>')
        .addClass(`page-item ${p === current ? 'active' : ''}`)
        .html(`<button class="page-link bg-dark text-white border-secondary px-3 py-2" data-page="${p}">${p}</button>`)
        .on('click', function () {
          app.state.page = parseInt($(this).find('button').data('page'));
          app.fetchContent();
        })
        .appendTo($pages);
    }
  },

  toast(message, type = 'success') {
    $('#toast-container').remove();

    const colorMap = { success: 'bg-success', warning: 'bg-warning text-dark', danger: 'bg-danger', info: 'bg-info text-dark' };
    const icon = { success: 'bi-check-circle-fill', warning: 'bi-exclamation-triangle-fill', danger: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };

    const $toast = $('<div>')
      .attr({ id: 'toast-container', role: 'alert', 'aria-live': 'assertive' })
      .addClass('position-fixed bottom-0 end-0 p-3')
      .css('zIndex', 9999)
      .html(`
        <div class="toast show align-items-center ${colorMap[type] || 'bg-secondary'} border-0">
          <div class="d-flex">
            <div class="toast-body fw-semibold">
              <i class="bi ${icon[type]} me-2"></i>${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
          </div>
        </div>
      `);

    $('body').append($toast);
    setTimeout(() => $toast.fadeOut(400, () => $toast.remove()), 3500);
  },

  setSectionTitle(category, query = '') {
    const titles = {
      movie   : '<i class="bi bi-camera-reels me-2"></i>Filmes Populares',
      tv      : '<i class="bi bi-tv me-2"></i>Séries Populares',
      trending: '<i class="bi bi-fire me-2"></i>Trending da Semana',
      search  : `<i class="bi bi-search me-2"></i>Resultados para: <em>${query}</em>`,
    };
    $('#section-title').html(titles[query ? 'search' : category] || titles.movie);
  },
};