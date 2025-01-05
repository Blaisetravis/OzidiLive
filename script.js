
//Home logo functions as refresh to home

document.getElementById('app-logo').addEventListener('click', function(){
    window.location.reload();
});

fetch('/config')
    .then(response => response.json())
    .then(config => {
        const apiKey = config.apiKey;
    })
    .catch(error => console.error('Error fetching apiKey', error));

//cle

async function getApiKey() {
    const response = await fetch('/config');
    const config = await response.json();
    return config.apiKey;
}

const menuToggle = document.getElementById('menu-toggle');
const mainMenu = document.querySelector('.main-menu');

menuToggle.addEventListener('click', ()=> {
    mainMenu.classList.toggle('active');
});

document.querySelectorAll('.main-menu .nav--buttons').forEach(button => {
    button.addEventListener('click',()=>{
        mainMenu.classList.remove('active');
    });
});


//Home button to refresh home
document.getElementById('home').addEventListener('click', function (){
    window.location.reload();
});

//movies button //Opens up Movies page tab
document.addEventListener('DOMContentLoaded', () => {
    const rightContainer = document.querySelector('.right-container');
    document.getElementById('movies').addEventListener('click', (event) => {
        event.preventDefault();
        rightContainer.innerHTML =`<div class="movies-page-contruction">


            <div class="coming-soon-holder">
                <h1>
                    Coming Soon
                </h1>

                <p>
                    This page is currently under construction.
                </p>

                <p id="return-home">
                    Please return home or search for a movie in the mean time.
                </p>
            </div>

        
        </div>`;
        
    })
})


//movies button //Opens up Movies page tab
document.addEventListener('DOMContentLoaded', () => {
    const rightContainer = document.querySelector('.right-container');
    document.getElementById('tv-shows').addEventListener('click', (event) => {
        event.preventDefault();
        rightContainer.innerHTML =`<div class="movies-page-contruction">


            <div class="coming-soon-holder">
                <h1>
                    Coming Soon
                </h1>

                <p>
                    This page is currently under construction.
                </p>

                <p id="return-home">
                    Please return home or search for a tv-show in the mean time.
                </p>
            </div>

        
        </div>`;
        
    })
})







// SEARCH FUNCTION TO WORK//

document.getElementById('search-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const query = document.getElementById('search-bar-input').value.trim();
    if (query) {
        const results = await searchMoviesOrShows(query);
        const filteredResults = await filterByStreamingProvider(results, ['Apple TV Plus', 'Starz', 'Hulu', 'Max','Peacock','Netflix','Paramount+','Amazon Prime Video']);
        displaySearchResults(filteredResults);
    } else {
        alert('Please search for a movie or TV show');
    }
});





async function searchMoviesOrShows(query){
    const apiKey = await getApiKey();
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(query)}&page=1`;


    try {
        const response = await fetch(searchUrl);
        const data = await response.json();
        return data.results;
    }catch (error) {
        console.error('Error fetching search results',error);
        return[];
    }
}

//FILTER RESULTS FUNCTION
async function filterByStreamingProvider(results, providersList) {
    const apiKey = await getApiKey();
    const filteredResults = [];

    for (let item of results) {
        const itemId = item.id;
        const mediaType = item.media_type; //movie or tv show 

        const providerUrl = `https://api.themoviedb.org/3/${mediaType}/${itemId}/watch/providers?api_key=${apiKey}`;

        try {
            const response = await fetch(providerUrl);
            const data = await response.json();

            const providers = data.results?.US || {}; 

            
            if (providers?.flatrate) {
                const isOnStreamingProvider = providers.flatrate.some(
                    (provider) => providersList.includes(provider.provider_name)
                );
                if (isOnStreamingProvider) {
                    filteredResults.push(item);
                }
            }

        } catch (error) {
            console.error(`Error fetching providers for ${item.title || item.name}`, error);
        }
    }

    return filteredResults; 
}




//DISPLAY SEARCH RESULTS 

async function displaySearchResults(results) {
    const rightContainer = document.querySelector('.right-container');
    rightContainer.innerHTML = '';

    const resultsHolder = document.createElement('div');
    resultsHolder.className = 'search-results';
    rightContainer.appendChild(resultsHolder);

    if (results.length === 0) {
        resultsHolder.innerHTML = '<p>No results found</p>';
        return;
    }

    
    for (const item of results) {
        const itemElement = document.createElement('div');
        itemElement.className = 'search-item';

        const backdropUrl = item.backdrop_path
            ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
            : `https://via.placeholder.com/300x450?text=No+Image`;

        let logoUrl = '';

        
        if (item.media_type === 'movie') {
            logoUrl = await fetchMovieImages(item.id);  // Fetch movie logo
        } else if (item.media_type === 'tv') {
            logoUrl = await fetchTvShowImages(item.id);  // Fetch TV show logo
        }

        
        itemElement.innerHTML = `
            <div class='top-rated-movies-backdrop'>
                <div class='backdrop-image'>
                    <img src="${backdropUrl}" alt="${item.title || item.name}" />
                </div>
                <div class="top-rated-movies-logos">
                    <img src="${logoUrl || 'https://via.placeholder.com/300x150?text=No+Logo'}" alt="${item.title || item.name} Logo" />
                </div>
            </div>
            <p>${item.title || item.name}</p>
        `;

        resultsHolder.appendChild(itemElement);

        itemElement.addEventListener('click', () => {
            if (item.media_type === 'movie') {
                displayMovieDetails(item.id); // Movie click handler
            } else if (item.media_type === 'tv') {
                displayTVShowDetails(item.id); // TV show click handler
            }
        });

    }

    
}







async function fetchMovieDetails(movieId) {

    try{
        const response = await fetch(`/api/movie-details/${movieId}`)
        const movieDetails = await response.json();
        return movieDetails;
        
    }catch(error){
        console.error('Error fetching movie details:',error);


    }
}



async function fetchTopRatedMovies(movieId){
    const apiKey = await getApiKey();
    const topRatedMoviesUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`;

    try {
        const response = await fetch(topRatedMoviesUrl);
        const data = await response.json();
        return data;
    }catch(error){
        console.error('error fetching top-rated movies', error);
        return{results: []};
    }
}


// FETCH TRENDING  ANIME SHOWS

    async function  fetchTrendingAnimes(tvShowiD){
        const apiKey = await getApiKey();
        const trendingAnimesUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_networks=213&with_genres=16`;

        try{
            const response = await fetch(trendingAnimesUrl);
            const data = await response.json();
            return data;
        }catch (error){
            console.error('error fetching trending anime shows', error);
            return{results: []};
        }
    }

//FETCH TOP RATED ACTION ,"EXCITING MOVIES"

async function fetchBlockbusterMovies(){
    const apiKey = await getApiKey();
    const blockusterMoviesUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=revenue.desc&vote_count.gte=500&include_adult=false
    `;

    try {
        const response = await fetch(blockusterMoviesUrl);

        if (!response.ok) {
            throw new Error(`HTTP error!`);
        }

        const data = await response.json();
        return data.results;
    }catch (error) {
        console.error('Error fetchign exciting movies', error);
        return [];
    }
}

// FETCH TVSHOW DETAILS

async function fetchTVShowDetails(tvShowId) {
    const apiKey = await getApiKey();
    const tvShowDetailsUrl = `https://api.themoviedb.org/3/tv/${tvShowId}?api_key=${apiKey}&language=en-US`;

    try {
        const response = await fetch(tvShowDetailsUrl);
        const tvShowDetails = await response.json();

        // Content ratings are handled separately for TV shows
        const contentRating = tvShowDetails.content_ratings?.results
            ?.find(item => item.iso_3166_1 === 'US')?.rating || 'No rating available';

        const seasons = tvShowDetails.seasons || [];

        return {
            ...tvShowDetails,
            contentRating,
            seasons
        };
    } catch (error) {
        console.error(`Error fetching TV show details ${tvShowId}:`, error);
        return { contentRating: 'No rating available' };
    }
}

//Fetch TV SHOW EPISODES

async function fetchSeasonEpisodes(tvShowId, seasonNumber){
    const apiKey = await getApiKey();
    const seasonUrl = `https://api.themoviedb.org/3/tv/${tvShowId}/season/${seasonNumber}?api_key=${apiKey}&language=en-US`

    try{
        const response = await fetch(seasonUrl);
        const seasonDetails = await response.json();
        return seasonDetails.episodes || [];
    } catch (error) {
        console.error(`Error fetching season ${seasonNumber}`, error);
        return [];
    }
}

//fetch TV SHOW PROVIDERS 

async function fetchTvShowProviders(tvShowId){
    const apiKey = await getApiKey();
    const providerUrl = `https://api.themoviedb.org/3/tv/${tvShowId}/watch/providers?api_key=${apiKey}`

    try {
        const response = await fetch(providerUrl);
        const providerData = await response.json();
        
        const logos = providerData.results?.US.providers || [];
        return logos.map(provider => `https://image.tmdb.org/t/p/original${provider.provider_logo}`);
    } catch (error) {
        console.error ('error fetching provider logos:',error);
        return [];
    }
}



//fetchin movie logos 
async function fetchMovieImages(movieId) {
    const apiKey = await getApiKey();
    const includeImageLanguage = 'null,en';
    const movieImagesUrl = `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${apiKey}&include_image_language=en${includeImageLanguage}`;


    try {
        const response = await fetch(movieImagesUrl);
        const movieImagesData = await response.json();

        
        const logos = movieImagesData.logos;

        if (logos && logos.length > 0) {
            return `https://image.tmdb.org/t/p/original${logos[0].file_path}`; // Return the URL of the first logo
        } else {
            return ''; 
        }
    } catch (error) {
        console.error(`Error fetching images for movie ${movieId}:`, error);
        return ''; 
    }
}

//fetch tv show logos 
async function fetchTvShowImages(tvShowId) {
    const apiKey = await getApiKey();
    const includeImageLanguage = 'null,en';
    const tvShowImagesUrl = `https://api.themoviedb.org/3/tv/${tvShowId}/images?api_key=${apiKey}&include_image_language=${includeImageLanguage}`;

    try {
        const response = await fetch(tvShowImagesUrl);
        const tvShowImagesData = await response.json();

        // Log the data to check if logos exist
        console.log(`Fetched images for TV show ${tvShowId}:`, tvShowImagesData);

        const logos = tvShowImagesData.logos;

        if (logos && logos.length > 0) {
            console.log(`Logo found for TV show ${tvShowId}: ${logos[0].file_path}`);
            return `https://image.tmdb.org/t/p/original${logos[0].file_path}`; // Return the URL of the first logo
        } else {
            console.log(`No logos available for TV show ${tvShowId}`);
            return ''; 
        }
    } catch (error) {
        console.error(`Error fetching images for TV show ${tvShowId}:`, error);
        return ''; 
    }
}














//Genre fetch 

let genreMapping = 1;

async function fetchGenres() {
    const apiKey = await getApiKey();
    const genreUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;

    try {
        const response = await fetch(genreUrl);
        const data = await response.json();
        if (data.genres) {
            genreMapping = data.genres.reduce((map, genre) => {
                map[genre.id] = genre.name;
                return map;
            }, {});
        }
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

//POPULAR MOVIE FETCH  // for main slideshow 
let movies = [];
let currentIndex = 0;


async function fetchPopularMovies() {
    await fetchGenres();
    const apiKey = await getApiKey();
    const apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&region=US`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error('No movies found');
        }

        movies = data.results;

        // Fetch additional details for each movie to get logos
        await Promise.all(movies.map(async (movie) => {
            const movieImagesUrl = `https://api.themoviedb.org/3/movie/${movie.id}/images?api_key=${apiKey}`;
            try {
                const movieImagesResponse = await fetch(movieImagesUrl);
                const movieImagesData = await movieImagesResponse.json();

                // Use the first logo if available
                movie.logo_path = movieImagesData.logos && movieImagesData.logos.length > 0 
                    ? movieImagesData.logos[0].file_path 
                    : null;
                movie.summary = movie.overview; // Using the overview from the initial response
            } catch (error) {
                console.error(`Error fetching images for movie ${movie.id}:`, error);
                movie.logo_path = null;
            }
        }));

        setupSlideshow();

        if (movies.length > 0) {
            showMovie(currentIndex);
        } else {
            const homeContent = document.getElementById('popular-movie-slideshow');
            homeContent.innerHTML += "<h2>No movies available</h2>";
        }

    } catch (error) {
        console.error('Error fetching popular movies:', error);
        const homeContent = document.getElementById('popular-movie-slideshow');
        homeContent.innerHTML += "<h2>Movie unavailable</h2>";
    }
}

// Slide Show setup 

function setupSlideshow() {
    const homeContent = document.getElementById('popular-movie-slideshow');
    const backdropContainer = document.createElement('div');
    backdropContainer.classList.add('backdrop-container');

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = `<svg fill="#fffffd" height="40px" opacity="0.5" width="40px" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="-4.04 -4.04 412.34 412.34"><polygon points="289.927,18 265.927,0 114.331,202.129 265.927,404.258 289.927,386.258 151.831,202.129"></polygon></svg>`;
    prevButton.id = "prevButton";
    prevButton.addEventListener('click', showPreviousMovie);
    buttonContainer.appendChild(prevButton);

    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<svg fill="#ffffff" height="40px" width="40px" opacity="0.5" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 407.436 407.436"><polygon points="112.814,0 91.566,21.178 273.512,203.718 91.566,386.258 112.814,407.436 315.869,203.718 "></polygon></svg>';
    nextButton.id = "nextButton";
    nextButton.addEventListener('click', showNextMovie);
    buttonContainer.appendChild(nextButton);

    const backdropElement = document.createElement('div');
    backdropElement.classList.add('backdrop-item');
    backdropContainer.appendChild(backdropElement);

    //Movie details for logos summary and genre

    const movieDetails = document.createElement('div');
    movieDetails.classList.add('movie-details');

    homeContent.appendChild(backdropContainer);
    homeContent.appendChild(buttonContainer);
    homeContent.appendChild(movieDetails);
}

async function showMovie(index) {
    const backdropElement = document.querySelector('.backdrop-item');
    const movieDetailsElement = document.querySelector('.movie-details');
    const movie = movies[index];

    if (movie) {
        const backdropUrl = movie.backdrop_path
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            : `https://via.placeholder.com/3840x2160?text=No+Image`;

        backdropElement.style.backgroundImage = `url(${backdropUrl})`;

        // Clear existing content
        backdropElement.innerHTML = '';
        movieDetailsElement.innerHTML = '';

        // Event listener to the backdrop to display movie details on click
        backdropElement.replaceWith(backdropElement.cloneNode(true));

        const newBackdropElement = document.querySelector('.backdrop-item');
        newBackdropElement.addEventListener('click', () => {
            displayMovieDetails(movie.id);
        });

        // Create and show logo per movie in slideshow
        const movieLogo = document.createElement('div');
        movieLogo.className = 'Movie-logo';

        // Fetch the movie logo from the API
        const logoUrl = await fetchMovieImages(movie.id); // Fetch the logo

        if (logoUrl) { // If a logo URL was returned
            const logoImg = document.createElement('img');
            logoImg.src = logoUrl; // Use the fetched logo URL
            logoImg.alt = 'movie logo';
            logoImg.onload = () => console.log(`Logo loaded: ${logoImg.src}`);
            logoImg.onerror = () => console.error(`Error loading logo: ${logoImg.src}`);
            movieLogo.appendChild(logoImg);
        } else {
            movieLogo.innerHTML = '<p>No Logo available</p>';
        }

        movieDetailsElement.appendChild(movieLogo);

        // Show movie genres
        const movieGenre = document.createElement('p');
        movieGenre.className = 'movie-genre';
        if (movie.genre_ids && movie.genre_ids.length > 1) {
            const genres = movie.genre_ids.map(id => genreMapping[id]).filter(name => name).join(', ');
            movieGenre.textContent = `${genres}`;
        } else {
            movieGenre.textContent = 'Genres: Not available';
        }
        movieDetailsElement.appendChild(movieGenre);

        // Show movie description
        const movieDescription = document.createElement('p');
        movieDescription.className = 'movie-description';
        movieDescription.textContent = movie.summary || 'No description available.';
        movieDetailsElement.appendChild(movieDescription);
    }
}



function showNextMovie() {
    currentIndex = (currentIndex + 1) % movies.length;
    showMovie(currentIndex);
}

function showPreviousMovie() {
    currentIndex = (currentIndex - 1 + movies.length) % movies.length;
    showMovie(currentIndex);
}

document.addEventListener('DOMContentLoaded', fetchPopularMovies);

//FETCH MOVIE CAST 

async function fetchMovieCast(movieId) {
    const apiKey = await getApiKey();
    const movieCastUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`;

    try {
        const response = await fetch(movieCastUrl);
        const castData = await response.json();
        return castData.cast;
    } catch (error) {
        console.error(`Error fetching cast for movie ${movieId}:`, error);
        return [];
    }
}

//DISPLAY MOVIE DETAILS SCREEN 

async function displayMovieDetails(movieId) {
    const rightContainer = document.querySelector('.right-container');
    rightContainer.innerHTML = ''; 
    // Fetch movie details and logo
    const movieDetails = await fetchMovieDetails(movieId);
    const movieLogoUrl = await fetchMovieImages(movieId);
    const trailerId = await showMovieTrailer(movieId);
    const relatedMovies = await fetchRelatedMovies(movieId);
    const castAndCrew = await fetchMovieCastAndCrew(movieId);

    // Fetch and format trailer URL
    const trailerUrl = trailerId ? `https://www.youtube.com/embed/${trailerId}` : null;

    // Set up the backdrop image
    const backdropUrl = movieDetails.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}`
        : `https://via.placeholder.com/3840x2160?text=No+Image`;

    const movieLink = `https://vidsrc.xyz/embed/movie?tmdb=${movieId}`;

   
    const movieDetailContent = `
        <div class="media-display-container">
            <div class="media-detail-holder">
                <div class="media-detail-content">
                <div class="media-backdrop" id="media-backdrop">
                    <img src="${backdropUrl}" alt="${movieDetails.title}" id="backdrop-img">
                </div>
                <div class="film-logo2">
                    <div id="Mlogo-placement"></div> <!-- Ensure this div exists -->
                </div>
                <div class="media-header-content-container">
                    <div id= "movie-logo-smallscreen">
                    <img src="${movieLogoUrl}"/>
                    </div>
                    <div class="media-detail-buttons">
                        <a href="${movieLink}" target="_blank" rel="noopener noreferrer" class="play-button">Play Movie</a>
                        <button class="play-button" id="play-trailer-button">Play Trailer</button>
                    </div>
                    <div class="media-content-details">
                        <p id="movie-genre"><strong>Genres:</strong> ${movieDetails.genres.map(genre => genre.name).join(', ')}</p>
                        <p>${movieDetails.overview || 'No description available.'}</p>
                    </div>
                </div>
        </div>
            </div>
        </div>
    `;

    // Insert movie details into the right container
    rightContainer.innerHTML = movieDetailContent;

    const playMovieButton = rightContainer.querySelector('.play-button');
    if(playMovieButton){
        playMovieButton.addEventListener('click', function (event){
            event.preventDefault();
            playMovie(movieId);

        });
    }

    function playMovie(movieId){
        const movieUrl = `https://vidsrc.xyz/embed/movie?tmdb=${movieId}`;

        const mediaPlayer = document.getElementById('media-player');

        if(mediaPlayer){
            mediaPlayer.src = movieUrl;
            const player = document.querySelector('.player');
            if(player){
                player.style.display='block';
            }else{
                console.log('media player not found');
            }
        }else{
            console.log('media player unable to connect');
        }
    }

    const closeMedia = document.getElementById('media-closer');
    if (closeMedia) {
        closeMedia.addEventListener('click', function () {
            const mediaPlayer = document.getElementById('media-player');
            const player = document.querySelector('.player');
    
            if (mediaPlayer) {
                mediaPlayer.src = '';  
            }
    
            if (player) {
                player.style.display = 'none';  
            }
            
            const playerContainer = document.getElementById('player-container');
            if (playerContainer) {
                playerContainer.style.display = 'none';  
            }
        });
    

    }

    // Handle movie logos
    const filmLogoDivs = document.querySelectorAll('.film-logo > div, .film-logo2 > div');

    filmLogoDivs.forEach(filmLogoDiv => {
        if (filmLogoDiv) {
            if (movieLogoUrl) {
                const logoImg = document.createElement('img');
                logoImg.src = movieLogoUrl;
                logoImg.alt = 'movie logo';
                logoImg.onload = () => console.log(`Logo Loaded: ${logoImg.src}`);
                logoImg.onerror = () => console.error(`Error loading logo: ${logoImg.src}`);
                filmLogoDiv.appendChild(logoImg);
            } else {
                console.log('No Logo Path found.');
                filmLogoDiv.innerHTML = '<p>No Logo available</p>';
            }
        } else {
            console.error('The film logo div was not found in the DOM.');
        }
    });

    try {
        // Fetch and display related movies, wait for it to complete
        await displayRelatedMovies(relatedMovies);

        // After related movies are displayed, fetch and display cast and crew
        displayCastAndCrew(castAndCrew);
    } catch (error) {
        console.error('Error displaying related movies or cast and crew:', error);
    }

    // Set up trailer functionality
    const playTrailerButton = document.getElementById('play-trailer-button');
    playTrailerButton.addEventListener('click', async () => {
        const trailerPlayer = document.getElementById('trailer-player');
        const trailerDiv = document.querySelector('.trailer-div');

        if (trailerUrl) {
            trailerPlayer.src = `${trailerUrl}?autoplay=1&controls=0&modestbranding=1&rel=0`;

            trailerDiv.style.display = 'flex'; 
        } else {
            alert('Trailer not available');
        }
    });

    // Close button functionality for trailers
    const closeButton = document.getElementById('close-button');
    const trailerDiv = document.querySelector('.trailer-div');
    const trailerIframe = document.getElementById('trailer-player');

    closeButton.addEventListener('click', function() {
        trailerIframe.src = '';
        trailerDiv.style.display = 'none';
    });
}
    

//Display  TV Show Details

let currentTvShowId = null;

async function displayTVShowDetails(tvShowId) {
    currentTvShowId = tvShowId;
    const rightContainer2 = document.querySelector('.right-container');
    rightContainer2.innerHTML = '';

    // Fetch details and logos
    const tvShowDetails = await fetchTVShowDetails(tvShowId);
    const tvShowLogos = await fetchTvShowImages(tvShowId);
    let seasonNumber = 1; // Initialize with the first season
    let seasonEpisodes = await fetchSeasonEpisodes(tvShowId, seasonNumber); // Fetch episodes for the first season

    const filteredEpisodes = seasonEpisodes.filter(episode => episode.still_path);

    const showLink = `https://vidsrc.xyz/embed/tv?tmdb=${tvShowId}`;

    // Construct the HTML content
    const backdropUrl = tvShowDetails.backdrop_path
        ? `https://image.tmdb.org/t/p/original${tvShowDetails.backdrop_path}`
        : `https://via.placeholder.com/3840x2160?text=No+Image`;

    const tvShowDetailContent = `
        <div class="media-display-container">
            <div class="media-detail-holder">
                <div class="media-detail-content">
                    <div class="media-backdrop" id="media-backdrop">
                        <img src="${backdropUrl}" alt="${tvShowDetails.name}" id="backdrop-img" />
                    </div>
                    <div class="tvshow-logo2 film-logo2">
                        <div id="Tlogo-placement"></div>
                    </div>
                    <div class="media-header-content-container">
                        <div id="movie-logo-smallscreen">
                            <img src="${tvShowLogos}" />
                        </div>
                        <div class="media-detail-buttons">
                            <a href="${showLink}" target="" rel="noopener noreferrer" class="play-button">Play</a>
                        </div>
                        <div class="media-content-details">
                            <p id="movie-genre"><strong></strong> ${tvShowDetails.genres.map(genre => genre.name).join(', ')}</p>
                            <p>${tvShowDetails.overview || 'No description available.'}</p>
                        </div>
                        <div>
                            <div id="Provider-logo-placement"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    //MEDIA PLAYER WINDOW TO OPEN INSIDE WINDOW







    const seasonsDropDown = `
        <div class="seasons-menu">
            <button id="seasons-dropdown">
                <h3>Season </h3>
                <span class="chevron">&#9662;</span>
            </button>
            <ul class="seasons-list" style="display: none;">
                ${tvShowDetails.seasons
                    .filter(season => season.season_number !== 0) // Exclude Season 0
                    .map(season => `
                        <li>
                            <button class="season-button" data-season-number="${season.season_number}">
                                Season ${season.season_number}
                            </button>
                        </li>
                    `).join('')}
            </ul>
        </div>
    `;

    // Create a single episodes container only once
    const episodesContainerHtml = `
        <div class="episodes-container">
            ${createEpisodesHtml(filteredEpisodes, seasonNumber)}
        </div>
    `;

    // Set the inner HTML of rightContainer2
    rightContainer2.innerHTML = tvShowDetailContent + seasonsDropDown + episodesContainerHtml;

    const playButton = rightContainer2.querySelector('.play-button');
    if (playButton) {
        playButton.addEventListener('click', function (event){
            event.preventDefault();
            playTvShow(tvShowId);
        });
    }

    function playTvShow(tvShowId) {
        const tvShowUrl = `https://vidsrc.xyz/embed/tv?tmdb=${tvShowId}`;

        const mediaPlayer = document.getElementById('media-player');

        if (mediaPlayer){
            mediaPlayer.src = tvShowUrl;

            const player = document.querySelector('.player');
            if (player){
                player.style.display='block';
            }else{
                console.error('Player container not found');
            }   
        }else{
            console.log('media player or container not working');
        }

        const mediaOverlay = document.getElementById('player-container');
        if (mediaOverlay) {
            mediaPlayer.src = tvShowUrl;
        } else {
            console.error('Media overlay not found.');
        }
    }
    


    
    

    






    // Function to create episodes HTML
    function createEpisodesHtml(episodes, season) {
        return episodes.map(episode => `
            <div class="episode-item" data-episode-id="${episode.id}" data-season-number="${season}" data-episode-number="${episode.episode_number}">
                <div class="episode-backdrop">
                    <img src="https://image.tmdb.org/t/p/original${episode.still_path}" alt="${episode.name}" />
                </div>
                <h6>Episode ${episode.episode_number}: ${episode.name}</h6>
                <div class="episode-description">
                    <p>${episode.overview || 'No description available.'}</p>
                </div>
            </div>
        `).join('');
    }

    function playEpisode(episodeId, seasonNumber, episodeNumber) {
        const episodeUrl = `https://vidsrc.xyz/embed/tv?tmdb=${tvShowId}&season=${seasonNumber}&episode=${episodeNumber}`;
        
        const mediaPlayer = document.getElementById('media-player');
        if (mediaPlayer) {
            mediaPlayer.src = episodeUrl;  
            
            // Show the player container and media player
            const player = document.querySelector('.player');
            if (player) {
                player.style.display = 'block';  
                console.error('Player container not found.');
            }

            mediaPlayer.style.display = 'block';
        } else {
            console.error('Media player iframe not found.');
        }
    
        // Show (player-container)
        const mediaOverlay = document.getElementById('player-container');
        if (mediaOverlay) {
            mediaOverlay.style.display = 'block';
        } else {
            console.error('Media overlay not found.');
        }
    }

    const closeMedia = document.getElementById('media-closer');
    if (closeMedia) {
        closeMedia.addEventListener('click', function () {
            const mediaPlayer = document.getElementById('media-player');
            const player = document.querySelector('.player');
    
            if (mediaPlayer) {
                mediaPlayer.src = ''; 
            }
    
            if (player) {
                player.style.display = 'none'; 
            }
            
            const playerContainer = document.getElementById('player-container');
            if (playerContainer) {
                playerContainer.style.display = 'none';  
            }
        });
    

    }

    // Add click event to each episode item
    document.querySelectorAll('.episode-item').forEach(episode => {
        episode.addEventListener('click', function () {
            const episodeId = this.getAttribute('data-episode-id');
            const seasonNumber = this.getAttribute('data-season-number');
            const episodeNumber = this.getAttribute('data-episode-number');
            playEpisode(episodeId, seasonNumber, episodeNumber);
        });
    });

    // Display TV show logos
    const tvShowLogoDiv = document.getElementById("Tlogo-placement");
    if (tvShowLogoDiv) {
        if (tvShowLogos) {
            const showImg = document.createElement('img');
            showImg.src = tvShowLogos;
            tvShowLogoDiv.appendChild(showImg);
        } else {
            console.log('No logo found.');
            tvShowLogoDiv.innerHTML = '';
        }
    } else {
        console.error('Logo container div not found.');
    }

    // Handle seasons dropdown and update episodes
    const seasonsDropdownButton = document.getElementById('seasons-dropdown');
    const seasonsList = document.querySelector('.seasons-list');
    if (seasonsDropdownButton && seasonsList) {
        seasonsDropdownButton.addEventListener('click', () => {
            seasonsList.style.display = seasonsList.style.display === 'none' ? 'block' : 'none';
        });
    } else {
        console.error('Seasons dropdown button or list not found.');
    }

    // Event delegation for season buttons
    document.querySelectorAll('.season-button').forEach(seasonButton => {
        seasonButton.addEventListener('click', async function() {
            seasonNumber = this.getAttribute('data-season-number'); // Get selected season number
            seasonEpisodes = await fetchSeasonEpisodes(tvShowId, seasonNumber); // Fetch episodes for the selected season
            const filteredEpisodes = seasonEpisodes.filter(episode => episode.still_path); // Filter episodes

            // Update the existing episodes container
            const episodesContainer = document.querySelector('.episodes-container');
            if (episodesContainer) {
                episodesContainer.innerHTML = createEpisodesHtml(filteredEpisodes, seasonNumber); // Update episodes
            }

            // Re-attach click event listeners to the new episode items
            document.querySelectorAll('.episode-item').forEach(episode => {
                episode.addEventListener('click', function () {
                    const episodeId = this.getAttribute('data-episode-id');
                    const seasonNum = this.getAttribute('data-season-number');
                    const episodeNum = this.getAttribute('data-episode-number');
                    playEpisode(episodeId, seasonNum, episodeNum);
                });
            });
        });
    });
}







    

//FETCH AND DISPLAY Trending TV SHOWS 

// where the trending TV shows will be displayed
const trendingTvShowContainer = document.getElementById('trending-tv-shows');

// fetch trending TV shows
async function fetchTrendingTVShows() {
    const apiKey = await getApiKey();
    const trendingTvShowUrl = `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&region=US
    `;

    try {
        const response = await fetch(trendingTvShowUrl);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching trending TV shows', error);
        trendingTvShowContainer.innerHTML = '<p>Sorry, there was an error fetching trending TV shows</p>';
        return [];
    }
}

// display trending TV shows
async function displayTrendingTVShows() {
    const tvShows = await fetchTrendingTVShows();

    if (tvShows.length === 0) {
        trendingTvShowContainer.innerHTML = '<p>No trending TV shows found</p>';
        return;
    }

    const tvShowItems = await Promise.all(tvShows.map(async (tvShow) => {
        const TVShowBackdropUrl = tvShow.backdrop_path
            ? `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`
            : `https://via.placeholder.com/3840x2160?text=No+Image`;

        // Fetch TV show logo URL
        const tvShowLogoUrl = await fetchTvShowImages(tvShow.id);

        // Log the logo URL to verify
        console.log(`Logo URL for TV show ${tvShow.id}:`, tvShowLogoUrl);

        return `
        <div class="tv-show-item" data-tvshow-id="${tvShow.id}">
            <div class="trending-tv-show-backdrop"> 
                <div class="tv-show-backdrop">
                <img src="${TVShowBackdropUrl}" alt="${tvShow.name}" id="tvshow-backdrop" />
                </div> 
                <div class="tv-show-logo">
                <img src="${tvShowLogoUrl}"  />
            </div>
            </div>
            <p>${tvShow.name}</p>
        </div>`;
    }));

    trendingTvShowContainer.innerHTML = `
    <h3 id="TrendingTvShows">Trending TV Shows</h3>
    <div class="trending-tv-show-list">
        ${tvShowItems.join('')}
    </div>
    `;


    const tvShowElements = document.querySelectorAll(".tv-show-item");
    tvShowElements.forEach(tvShowElement => {
        tvShowElement.addEventListener('click', () => {
            const tvShowId = tvShowElement.getAttribute('data-tvshow-id');
            displayTVShowDetails(tvShowId);
        });
    });

}


// calls the function to actually work
displayTrendingTVShows();


//DISPLAY TRENDING ANIMES

const trendingAnimeContainer = document.getElementById('trending-animes');

async function displayTrendingAnimes(){
    const trendingAnimes = await fetchTrendingAnimes();

    if (trendingAnimes.results.length === 0){
        trendingAnimeContainer.innerHTML ='<p> No trending animes found</p>';
        return;
    }

    const animeItems = await Promise.all(trendingAnimes.results.map(async (tvShow)=> {
        const animeBackdropUrl = tvShow.backdrop_path
            ? `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`
            :  `https://via.placeholder.com/3840x2160?text=No+Image`;

            const animeLogo = await fetchTvShowImages(tvShow.id);


        console.log(`Logo for anime Tv shows not found`);

        return `
        <div class="tv-show-item" data-tvshow-id="${tvShow.id}">
            <div class="trending-tv-show-backdrop"> 
                <div class="tv-show-backdrop">
                <img src="${animeBackdropUrl}" alt="${tvShow.name}" id="tvshow-backdrop" />
                </div> 
                <div class="tv-show-logo">
                <img src="${animeLogo}"  />
            </div>
            </div>
            <p>${tvShow.name}</p>
        </div>`;

    }));

    trendingAnimeContainer.innerHTML =`
    <h3 id="TrendingTvShows">Trending Animes</h3>
        <div class="trending-tv-show-list">
        ${animeItems.join('')}
    </div>
    `;

    const trendingAnimeItems = document.querySelectorAll('.tv-show-item');
    trendingAnimeItems.forEach(trendingAnimeItem => {
        trendingAnimeItem.addEventListener('click', () => {
            const tvShowId = trendingAnimeItem.getAttribute('data-tvshow-id');
            displayTVShowDetails(tvShowId);
        });
    });



}


displayTrendingAnimes();


// DISPLAY TOP RATED MOVIES
async function displayTopRatedMovies() {
    const topratedMovies = await fetchTopRatedMovies(); // Fetch top-rated movies

    if (topratedMovies.results.length === 0) {
        topRatedContainer.innerHTML = '<p>No top-rated movies found</p>';
        return;
    }

    const movieItems = await Promise.all(topratedMovies.results.map(async (movie) => {

        const movieBackdropUrl = movie.backdrop_path
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            : `https://via.placeholder.com/3840x2160?text=No+Image`;

        const movieLogoUrl = await fetchMovieImages(movie.id);

  
        console.log(`Logo URL for movie ${movie.id}:`, movieLogoUrl);

        return `
        <div class="movie-item" data-movie-id="${movie.id}">
            <div class="top-rated-movies-backdrop"> 
                <div class="backdrop-image">
                    <img src="${movieBackdropUrl}" alt="${movie.title}" id="movie-backdrop" />
                </div>
                <div class="top-rated-movies-logos">
                    <img src="${movieLogoUrl}" alt="${movie.title} Logo"/>
                </div>
            </div>
            <p>${movie.title}</p>
        </div>`;
    }));

    const topRatedContainer = document.getElementById('top-rated-movies');
    topRatedContainer.innerHTML = `
        <h3 id="TopRatedMovies">Top Rated Movies</h3>
        <div class="top-rated-movie-list">
            ${movieItems.join('')}
        </div>
    `;


    const movieElements = document.querySelectorAll(".movie-item");
    movieElements.forEach(movieElement => {
        movieElement.addEventListener('click', () => {
            const movieId = movieElement.getAttribute('data-movie-id');
            displayMovieDetails(movieId); // Assuming you have a function to display movie details
        });
    })
}

//FUNCTION TO DISPLAY THE EXCITING MOVIES WITH THE FETCH IS TOP RATED ACTION MOVIES 

async function displayBlockbustermovies() {
    const excitingMovies = await fetchBlockbusterMovies(); // Fetch top-rated action movies

    const blockusterMoviesContainer = document.getElementById('blockbuster-action-movies');

    if (excitingMovies.length === 0) {
        blockusterMoviesContainer.innerHTML = '<p>No top-rated action movies found</p>';
        return;
    }

    const movieItems = await Promise.all(excitingMovies.map(async (movie) => {

        const movieBackdropUrl = movie.backdrop_path
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            : `https://via.placeholder.com/3840x2160?text=No+Image`;

        const movieLogoUrl = await fetchMovieImages(movie.id); // Assuming you have a function to fetch movie logos

        console.log(`Logo URL for action movie ${movie.id}:`, movieLogoUrl);

        return `
        <div class="movie-item" data-movie-id="${movie.id}">
            <div class="top-rated-movies-backdrop"> 
                <div class="backdrop-image">
                    <img src="${movieBackdropUrl}" alt="${movie.title}" id="movie-backdrop" />
                </div>
                <div class="top-rated-movies-logos">
                    <img src="${movieLogoUrl}" alt="${movie.title} Logo"/>
                </div>
            </div>
            <p>${movie.title}</p>
        </div>`;
    }));

    blockusterMoviesContainer.innerHTML = `
        <h3 id="ExcitingActionMovies">Blockbuster Movies</h3>
        <div class="blockbuster-movie-list">
            ${movieItems.join('')}
        </div>
    `;

    const movieElements = document.querySelectorAll(".movie-item");
    movieElements.forEach(movieElement => {
        movieElement.addEventListener('click', () => {
            const movieId = movieElement.getAttribute('data-movie-id');
            displayMovieDetails(movieId); // Assuming you have a function to display movie details
        });
    });
}

displayBlockbustermovies();


// Call the function to display top-rated movies
displayTopRatedMovies();


displayRelatedMovies();





    


async function displayRelatedMovies(relatedMovies) {

return new Promise((resolve, reject) => {
    try {
        
        const relatedMoviesContainer = document.querySelector('.related-movies-container');
        
        relatedMoviesContainer.innerHTML = relatedMovies.map(movie => 
            `<div class="related-movie-item">${movie.title}</div>`
        ).join('');

        
        resolve();
    } catch (error) {
        reject(error);
    }
});
}
    


    

    
    
    
    
    
    


// Function to display related movies
function displayRelatedMovies(movies, container) {
    
}

// Function to display cast and crew
function displayCastAndCrew(castAndCrew, container) {
    // Implementation for displaying cast and crew
}

    


//FETCH MOVIE TRAILERS 

async function showMovieTrailer(movie_id) {
    const apiKey = await getApiKey();
    const apiTrailerUrl = `https://api.themoviedb.org/3/movie/${movie_id}/videos?api_key=${apiKey}&language=en-US`;
    
    try{
        const response = await fetch(apiTrailerUrl);
        if (!response.ok) {
            throw new Error('Failed to load trailer');
        }
    
        const data = await response.json();
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

        if (trailer) {
        return trailer.key;
        }else{
        console.log('Trailer not found for this movie');
        return null;
    }
    
    } catch (error){
        console.error('Error fetching trailer', error);
        return null;
    }

}


    
// FETCH RELATED MOVIES 


async function fetchRelatedMovies(movieId) {
    const apiKey = await getApiKey();
    const relatedMoviesUrl = `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${apiKey}&language=en-US&page=1`;

    try {
        const response = await fetch(relatedMoviesUrl);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching related movies', error);
        return [];
    }
}


//Display Related Movies

async function displayRelatedMovies(relatedMovies) {
    const mediaDisplayContainer = document.querySelector('.media-display-container');

    if (relatedMovies.length > 0) {
        const relatedMoviesSection = document.createElement('div');
        relatedMoviesSection.className = 'related-movies';

        const relatedMoviesList = document.createElement('div');
        relatedMoviesList.className = 'related-movie-list';

        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = 'Related';
        relatedMoviesSection.appendChild(sectionTitle);

        for (const movie of relatedMovies) {
            const relatedMovieItem = document.createElement('div');
            relatedMovieItem.className = 'related-movie-item';

            const movieBackdropUrl = movie.backdrop_path
                ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                : `https://via.placeholder.com/500x281?text=No+Image`;

            // Fetch the movie logo URL
            const movieLogoUrl = await fetchMovieImages(movie.id);

            relatedMovieItem.innerHTML = `
                <div >
                    <div class="movie-logobackdrop-container">

                    <div class="movie-logo-container">
                    ${movieLogoUrl ? `<img src="${movieLogoUrl}" alt="${movie.title} Logo" class="related-movie-logo">` : ''}
                    </div>
                        <div class="movie-backdrop-container">
                        <img src="${movieBackdropUrl}" alt="${movie.title}" class="related-movie-backdrop">
                    </div>


                    </div>
                    <p>${movie.title}</p>
                </div>
            
            `;



            relatedMoviesList.appendChild(relatedMovieItem);  // Append to relatedMoviesList
            
            // Make the related movies clickable
            relatedMovieItem.addEventListener('click', () => {
                displayMovieDetails(movie.id);
            });
        }

        relatedMoviesSection.appendChild(relatedMoviesList);
        mediaDisplayContainer.appendChild(relatedMoviesSection);

    } else {
        console.log('No related movies found');
    }
}


//FETCH CAST AND CREW 
    

async function fetchMovieCastAndCrew(movieId) {
    const apiKey = await getApiKey();
    const castAndCrewUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`;

    try {
        const response = await fetch(castAndCrewUrl);
        const data = await response.json();

        const combineData = [...data.cast, ...data.crew];
        return combineData;
    } catch (error) {
        console.error('Error fetching cast and crew', error);
        return [];
    }
}


async function displayCastAndCrew(castAndCrew) {
    const castAndCrewContainer = document.querySelector('.media-display-container');

    // Clear previous cast and crew content
    const existingCastAndCrewSection = castAndCrewContainer.querySelector('.cast-and-crew');
    if (existingCastAndCrewSection) {
        existingCastAndCrewSection.remove(); // Remove the existing cast and crew section to avoid duplication
    }

    if (castAndCrew.length > 5) {
        const castAndCrewSection = document.createElement('div');
        castAndCrewSection.className = 'cast-and-crew';

        const castAndCrewList = document.createElement('div');
        castAndCrewList.className = 'cast-and-crew-list';

        const crewSectionTitle = document.createElement('h3');
        crewSectionTitle.textContent = 'Cast & Crew';
        castAndCrewSection.appendChild(crewSectionTitle);

        const limitedCastAndCrew = castAndCrew.slice(0, 25); // Limit to 25 cast and crew members

        for (const actor of limitedCastAndCrew) {
            const actorItem = document.createElement('div');
            actorItem.className = 'actor-item';

            const actorProfileUrl = actor.profile_path
                ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                : 'default_image_url';  // Optional: provide a default image URL if profile_path is null.
            
            actorItem.innerHTML = `
                <div class="crew-holder">
                    <div class="actor-profile-pic">
                        <img id="actor-name-alt" src="${actorProfileUrl}" alt="${actor.name}">
                    </div>
                    <div class="actor-name">
                        <p>${actor.name}</p>
                    </div>
                </div>
            `;

            castAndCrewList.appendChild(actorItem);
        }

        castAndCrewSection.appendChild(castAndCrewList);
        castAndCrewContainer.appendChild(castAndCrewSection);
    } else {
        console.log('No cast and crew found');
    }
}


    



    
    
    
    


// ALL THAT SHOWS UP IN THE MEDIA-DISPLAY CONTAINER ENDS HERE



