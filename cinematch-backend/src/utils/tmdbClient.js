const axios = require('axios');
const AppError = require('./AppError');

const tmdbApi = axios.create({
  baseURL: process.env.TMDB_BASE_URL,
  timeout: 10000
});

tmdbApi.interceptors.request.use((config) => {
  config.params = config.params || {};
  config.params.api_key = process.env.TMDB_API_KEY;
  return config;
});

tmdbApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      throw new AppError('TMDB API key is invalid or missing', 502);
    }

    if (status === 404) {
      throw new AppError('Movie data was not found on TMDB', 404);
    }

    if (status === 429) {
      throw new AppError('TMDB rate limit reached. Please try again in a moment.', 503);
    }

    if (error.code === 'ECONNABORTED') {
      throw new AppError('TMDB request timed out. Please try again.', 504);
    }

    throw new AppError('Failed to fetch movie data from TMDB', 502);
  }
);

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

const discoverMovies = async (params) => {
  const response = await tmdbApi.get('/discover/movie', { params });
  return response.data;
};

module.exports = {
  fetchPopularMovies,
  searchMovies,
  getMovieDetails,
  discoverMovies
};
