const IMG_BASE  = 'https://image.tmdb.org/t/p';
const tmdb = axios.create({
  timeout: 10000,
});


tmdb.interceptors.request.use(config =>{
config.params = {
... config.params,
path: config.url
};
config.baseURL = ''; 
  config.url = '/api/tmdb';

  return config;
});
tmdb.interceptors.response.use(
  res => res,
  err =>{
    console.error('[TMDB API Error]', err.response?.status, err.message);
    return Promise.reject(err);
  }
)
const api = {
  posterUrl  : (path, size = 'w342')  => path ? `${IMG_BASE}/${size}${path}` : 'https://placehold.co/342x513/1a1a2e/ffffff?text=Sem+Poster',
  backdropUrl: (path, size = 'w1280') => path ? `${IMG_BASE}/${size}${path}` : '',

  getPopularMovies(page = 1, sortBy = 'popularity.desc', genreId = 0) {
    const params = { page, sort_by: sortBy };
    if (genreId) params.with_genres = genreId;
    return tmdb.get('/discover/movie', { params });
  },

  getPopularTV(page = 1, sortBy = 'popularity.desc', genreId = 0) {
    const params = { page, sort_by: sortBy };
    if (genreId) params.with_genres = genreId;
    return tmdb.get('/discover/tv', { params });
  },

  getTrending(page = 1) {
    const dfd = $.Deferred();
    $.ajax({
      url     : '/api/tmdb',
      method  : 'GET',
      data    : { path: '/trending/all/week', page },
      success : data => dfd.resolve({ data }),
      error   : (_, __, err) => dfd.reject(new Error(err)),
    });
    return dfd.promise();
  },

  searchMulti(query, page = 1) {
    return axios.all([
      tmdb.get('/search/movie', { params: { query, page } }),
      tmdb.get('/search/tv',    { params: { query, page } }),
    ]).then(axios.spread((movies, tv) => {
      const combined = [
        ...movies.data.results.map(r => ({ ...r, media_type: 'movie' })),
        ...tv.data.results.map(r     => ({ ...r, media_type: 'tv'    })),
      ].sort((a, b) => b.popularity - a.popularity);

      return {
        results     : combined,
        total_results: movies.data.total_results + tv.data.total_results,
        total_pages : Math.max(movies.data.total_pages, tv.data.total_pages),
      };
    }));
  },

  /**
   * Busca detalhes, créditos e vídeos em paralelo com Axios.all().
   * @param {number} id - ID do título
   * @param {'movie'|'tv'} type - tipo de mídia
   */
  getDetails(id, type = 'movie') {
    return axios.all([
      tmdb.get(`/${type}/${id}`),
      tmdb.get(`/${type}/${id}/credits`),
      tmdb.get(`/${type}/${id}/videos`),
      tmdb.get(`/${type}/${id}/similar`),
    ]).then(axios.spread((details, credits, videos, similar) => ({
      details : details.data,
      credits : credits.data,
      videos  : videos.data,
      similar : similar.data,
    })));
  },

  getGenres(type = 'movie') {
    return tmdb.get(`/genre/${type}/list`);
  },
};
