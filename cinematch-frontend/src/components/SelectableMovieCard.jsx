const getPosterUrl = (posterPath) => (
  posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : 'https://via.placeholder.com/500x750?text=No+Poster'
);

export default function SelectableMovieCard({ movie, isSelected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={`group relative overflow-hidden rounded-[1.5rem] border text-left transition duration-300 ${
        isSelected
          ? 'scale-[1.02] border-[#f3c56b] bg-[#1a1420] shadow-[0_20px_50px_rgba(243,197,107,0.22)]'
          : 'border-white/10 bg-white/[0.04] hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]'
      }`}
    >
      <div className="relative">
        <img
          src={getPosterUrl(movie.posterPath)}
          alt={movie.title}
          className={`aspect-[2/3] w-full object-cover transition duration-500 ${
            isSelected ? 'scale-105 saturate-110' : 'group-hover:scale-105'
          }`}
        />
        <div className={`absolute inset-0 transition ${
          isSelected
            ? 'bg-gradient-to-t from-[#120d18] via-transparent to-transparent'
            : 'bg-gradient-to-t from-black/75 via-transparent to-transparent'
        }`} />
        <div className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition ${
          isSelected
            ? 'border-[#f3c56b] bg-[#f3c56b] text-[#1d1620]'
            : 'border-white/20 bg-black/35 text-white/75'
        }`}>
          {isSelected ? (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : '+'}
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-white sm:text-base">{movie.title}</h3>
          {movie.releaseYear ? (
            <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-300">
              {movie.releaseYear}
            </span>
          ) : null}
        </div>
        <p className="line-clamp-3 text-xs leading-5 text-neutral-400">
          {movie.overview || 'No synopsis available yet, but it is trending now.'}
        </p>
      </div>
    </button>
  );
}
