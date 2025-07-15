import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const Key = "dc83bc1c";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function OnSelectedId(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function OnBackToWatchedList() {
    setSelectedId(null);
  }

  function OnAddWatchedMovie(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function OndeleteWatchedMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      const controller = new AbortController();
      async function getMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${Key}&s=${query}`,
            { signal: controller.signal }
          );
          const data = await res.json();
          if (data.Response === "False") throw new Error(data.Error);
          setMovies(data.Search);
        } catch (err) {
          if (err.name !== "AbortError") setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      getMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {error && <ErrorMessage message={error} />}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} OnSelectedId={OnSelectedId} />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              OnBackToWatchedList={OnBackToWatchedList}
              OnAddWatchedMovie={OnAddWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                OndeleteWatchedMovie={OndeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>🧧</span>
      {message}
    </p>
  );
}
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, OnSelectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} OnSelectedId={OnSelectedId} />
      ))}
    </ul>
  );
}

function Movie({ movie, OnSelectedId }) {
  return (
    <li key={movie.imdbID} onClick={() => OnSelectedId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedId,
  OnBackToWatchedList,
  OnAddWatchedMovie,
  watched,
}) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const inWatchedList = watched.filter(
    (watchedMovie) => watchedMovie.imdbID === selectedId
  );

  const newMovie = {
    imdbID: selectedId,
    Title: movie?.Title,
    Poster: movie?.Poster,
    imdbRating: movie?.imdbRating,
    userRating: userRating,
    runtime: movie?.Runtime.split(" ").at(0),
  };

  useEffect(
    function () {
      function escape(e) {
        if (e.code === "Escape") {
          console.log("hi");
          OnBackToWatchedList();
        }
      }
      document.addEventListener("keydown", escape);

      return function () {
        document.removeEventListener("keydown", escape);
      };
    },
    [OnBackToWatchedList]
  );

  useEffect(
    function () {
      async function getMovie(id) {
        setLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${Key}&i=${id}`
        );
        const data = await res.json();
        setLoading(false);
        setMovie(data);
      }
      getMovie(selectedId);
      return function () {
        document.title = "usePopcorn";
      };
    },
    [selectedId]
  );
  useEffect(
    function () {
      if (!movie) return;
      document.title = `Movie | ${movie?.Title}`;
    },
    [movie]
  );

  return (
    <div className="details">
      {loading ? (
        <Loader />
      ) : (
        <>
          <button className="btn-back" onClick={OnBackToWatchedList}>
            &larr;
          </button>
          <header>
            <img src={movie?.Poster} alt=""></img>
            <div className="details-overview">
              <h2>{movie?.Title}</h2>
              <p>
                {movie?.Released} • {movie?.Runtime}
              </p>
              <p>{movie?.Genre}</p>
              <p>
                <span>⭐️</span>
                {movie?.imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {inWatchedList.length > 0 ? (
                <p>You rated with movie {inWatchedList[0].userRating} ⭐️</p>
              ) : (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating && (
                    <button
                      className="btn-add"
                      onClick={() => {
                        OnAddWatchedMovie(newMovie);
                        OnBackToWatchedList();
                      }}
                    >
                      + Add to list
                    </button>
                  )}
                </>
              )}
            </div>
            <p>
              <em>{movie?.Plot}</em>
            </p>
            <p>Starring {movie?.Actors}</p>
            <p>Directed by {movie?.Director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, OndeleteWatchedMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          OndeleteWatchedMovie={OndeleteWatchedMovie}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, watched, OndeleteWatchedMovie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => OndeleteWatchedMovie(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
