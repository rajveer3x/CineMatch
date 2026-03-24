const axios = require('axios');

const tmdbApi = axios.create({
  baseURL: process.env.TMDB_BASE_URL
});

tmdbApi.interceptors.request.use((config) => {
  config.params = config.params || {};
  config.params.api_key = process.env.TMDB_API_KEY;
  return config;
});

const fetchPopularMovies = async (page = 1) => {
  const response = await tmdbApi.get('/movie/popular', { params: { page } });
  return response.data;
};

const searchMovies = async (query, page = 1) => {
  const response = await tmdbApi.get('/search/movie', { params: { query, page } });
  return response.data;
};

const getMovieDetails = async (tmdbId) => {
  const response = await tmdbApi.get(`/movie/${tmdbId}`, { params: { append_to_response: 'keywords' } });
  return response.data;
};

module.exports = {
  fetchPopularMovies,
  searchMovies,
  getMovieDetails
};
