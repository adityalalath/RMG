const pickMovie = document.getElementById("pickMovie");
const result = document.getElementById("result");
const genreSelect = document.getElementById("genreSelect");

const API_KEY = "2220c6d0451d440ef8f1ea8c9406c424";

function buildMovieURL() {
    const selectedGenre = genreSelect.value;
    const randomPage = Math.floor(Math.random() * 20) + 1;

    let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&vote_count.gte=200&page=${randomPage}`;

    if (selectedGenre) {
        url += `&with_genres=${selectedGenre}`;
    }

    return url;
}

async function fetchMovies() {
    const url = buildMovieURL();
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
}

let seenMovieIds = [];

function getRandomMovie(movies) {
    const unseenMovies = movies.filter(movie => !seenMovieIds.includes(movie.id));

    const pool = unseenMovies.length ? unseenMovies : movies;
    const index = Math.floor(Math.random() * pool.length);
    const chosenMovie = pool[index];

    seenMovieIds.push(chosenMovie.id);

    if (seenMovieIds.length > 20) {
        seenMovieIds.shift();
    }

    return chosenMovie;
}

function getPosterURL(path) {
    if (!path) return "";
    return `https://image.tmdb.org/t/p/w500${path}`;
}

function renderMovie(movie) {
    const posterURL = getPosterURL(movie.poster_path);
    const year = movie.release_date ? movie.release_date.slice(0, 4) : "Unknown year";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

    result.innerHTML = `
        ${posterURL ? `<img class="poster" src="${posterURL}" alt="${movie.title} poster" style="display:block;">` : ""}
        <h2 class="movie-title">${movie.title}</h2>
        <p class="movie-meta">${year} • Rating ${rating}</p>
        <p class="movie-overview">${movie.overview || "No overview available."}</p>
    `;
}

async function handlePickMovie() {
    try {
        result.innerHTML = `<p class="loading">Picking something for you...</p>`;

        const movies = await fetchMovies();

        if (!movies.length) {
            result.innerHTML = `<p class="loading">No movies found.</p>`;
            return;
        }

        const movie = getRandomMovie(movies);
        renderMovie(movie);
    } catch (error) {
        result.innerHTML = `<p class="loading">Something went wrong. Try again.</p>`;
        console.error(error);
    }
}

pickMovie.addEventListener("click", handlePickMovie);