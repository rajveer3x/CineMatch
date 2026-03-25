const { fetchPopularMovies, searchMovies } = require('../utils/tmdbClient');
const { saveMovieToCache, getOrFetchMovie } = require('../utils/movieCache');
const AppError = require('../utils/AppError');

const getPopular = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const data = await fetchPopularMovies(page);

    const cachedMovies = await Promise.all(
      data.results.map((movie) => saveMovieToCache(movie))
    );

    res.status(200).json({
      page: data.page,
      results: cachedMovies,
      total_pages: data.total_pages,
      total_results: data.total_results
    });
  } catch (error) {
    next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query || query.trim().length < 1) {
      throw new AppError('Search query must be at least 1 character long', 400);
    }

    const data = await searchMovies(query, page);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getDetails = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const movie = await getOrFetchMovie(tmdbId);
    res.status(200).json(movie);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPopular,
  search,
  getDetails
};
