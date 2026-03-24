const Movie = require('../models/Movie');
const { getMovieDetails } = require('./tmdbClient');

const saveMovieToCache = async (tmdbMovie) => {
  const releaseYear = tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null;
  const genres = tmdbMovie.genres ? tmdbMovie.genres.map(g => g.name) : [];

  const movieData = {
    tmdbId: tmdbMovie.id,
    title: tmdbMovie.title,
    overview: tmdbMovie.overview,
    genres: genres,
    posterPath: tmdbMovie.poster_path,
    releaseYear: releaseYear,
    voteAverage: tmdbMovie.vote_average,
    popularity: tmdbMovie.popularity
  };

  return await Movie.findOneAndUpdate(
    { tmdbId: tmdbMovie.id },
    movieData,
    { new: true, upsert: true }
  );
};

const getOrFetchMovie = async (tmdbId) => {
  let movie = await Movie.findOne({ tmdbId });
  if (movie) return movie;

  const tmdbMovie = await getMovieDetails(tmdbId);
  return await saveMovieToCache(tmdbMovie);
};

module.exports = {
  saveMovieToCache,
  getOrFetchMovie
};
