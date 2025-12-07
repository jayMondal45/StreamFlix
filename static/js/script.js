/**
 * StreamFlix Platform - Professional JavaScript Implementation
 */

const AppState = {
    carouselMovies: [],
    allMovies: [],
    webSeriesData: [],
    continueWatchingData: [],
    currentSeriesIndex: 0,
    currentSeason: 1,
    isInitialized: false
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 StreamFlix Platform Initializing...');
    try {
        initializeApplication();
    } catch (error) {
        console.error('❌ Critical initialization error:', error);
        displayErrorNotification('Failed to initialize application.');
    }
});

function initializeApplication() {
    loadData()
        .then(() => {
            setupUserDropdown();
            setupSearch();
            setupMobileMenu();
            AppState.isInitialized = true;
            console.log('✅ All features initialized successfully');
        })
        .catch(error => {
            console.error('❌ Initialization failed:', error);
            setupUserDropdown();
            setupSearch();
            setupMobileMenu();
        });
}

async function loadData() {
    try {
        console.log('📡 Loading data from JSON endpoints...');

        const endpoints = {
            carousel: '/api/carousel',
            movies: '/api/movies',
            webseries: '/api/webseries',
            continueWatching: '/api/continue-watching'
        };

        const timeoutDuration = 10000;
        const fetchWithTimeout = (url) => {
            return Promise.race([
                fetch(url),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`Request timeout for ${url}`)), timeoutDuration)
                )
            ]);
        };

        const [carouselResponse, moviesResponse, seriesResponse, continueResponse] = await Promise.all([
            fetchWithTimeout(endpoints.carousel),
            fetchWithTimeout(endpoints.movies),
            fetchWithTimeout(endpoints.webseries),
            fetchWithTimeout(endpoints.continueWatching).catch(() => ({ ok: false }))
        ]);

        if (!carouselResponse.ok) throw new Error(`Carousel API error: ${carouselResponse.status}`);
        if (!moviesResponse.ok) throw new Error(`Movies API error: ${moviesResponse.status}`);
        if (!seriesResponse.ok) throw new Error(`Webseries API error: ${seriesResponse.status}`);

        AppState.carouselMovies = await carouselResponse.json();
        AppState.allMovies = await moviesResponse.json();
        AppState.webSeriesData = await seriesResponse.json();
        AppState.continueWatchingData = continueResponse.ok ? await continueResponse.json() : [];

        if (!Array.isArray(AppState.carouselMovies)) AppState.carouselMovies = [];
        if (!Array.isArray(AppState.allMovies)) AppState.allMovies = [];
        if (!Array.isArray(AppState.webSeriesData)) AppState.webSeriesData = [];
        if (!Array.isArray(AppState.continueWatchingData)) AppState.continueWatchingData = [];

        console.log(`📊 Data loaded: Carousel(${AppState.carouselMovies.length}), Movies(${AppState.allMovies.length}), Series(${AppState.webSeriesData.length}), Continue(${AppState.continueWatchingData.length})`);

        setupCarousel();
        generateMovieCards();
        setupWebSeries();
        setupContinueWatching();
        setTimeout(initializeSwipers, 500);

    } catch (error) {
        console.error('❌ Error loading data:', error);
        AppState.carouselMovies = [];
        AppState.allMovies = [];
        AppState.webSeriesData = [];
        AppState.continueWatchingData = [];
        setupCarousel();
        generateMovieCards();
        setupWebSeries();
        setupContinueWatching();
    }
}

function setupUserDropdown() {
    const userTrigger = document.getElementById('userProfileTrigger');
    const userDropdown = document.getElementById('userDropdown');
    const dropdownArrow = document.getElementById('dropdownArrow');

    if (!userTrigger || !userDropdown) return;

    userDropdown.style.display = 'none';

    userTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (userDropdown.style.display === 'block') {
            userDropdown.style.display = 'none';
            userTrigger.classList.remove('active');
            if (dropdownArrow) dropdownArrow.style.transform = 'rotate(0deg)';
        } else {
            const triggerRect = userTrigger.getBoundingClientRect();
            userDropdown.style.cssText = `
                position: fixed !important;
                top: ${triggerRect.bottom + 5}px !important;
                right: ${window.innerWidth - triggerRect.right}px !important;
                background: #141414 !important;
                border: 2px solid #e50914 !important;
                border-radius: 8px !important;
                padding: 15px 0 !important;
                min-width: 200px !important;
                z-index: 1001 !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(229, 9, 20, 0.7) !important;
                display: block !important;
            `;
            userDropdown.style.display = 'block';
            userTrigger.classList.add('active');
            if (dropdownArrow) dropdownArrow.style.transform = 'rotate(180deg)';
        }
    });

    document.addEventListener('click', (e) => {
        if (!userTrigger.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.style.display = 'none';
            userTrigger.classList.remove('active');
            if (dropdownArrow) dropdownArrow.style.transform = 'rotate(0deg)';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            userDropdown.style.display = 'none';
            userTrigger.classList.remove('active');
            if (dropdownArrow) dropdownArrow.style.transform = 'rotate(0deg)';
        }
    });
}

function setupSearch() {
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.querySelector('.search-input');
    const searchIcon = document.querySelector('.search-icon');
    const searchClose = document.querySelector('.search-close');

    if (!searchBox || !searchInput) return;

    let searchResults = document.querySelector('.search-results');
    if (!searchResults) {
        searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        searchResults.style.display = 'none';
        document.querySelector('.search-container').appendChild(searchResults);
    }

    searchIcon?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!searchBox.classList.contains('active')) {
            searchBox.classList.add('active');
            searchInput.focus();
        }
    });

    searchClose?.addEventListener('click', (e) => {
        e.stopPropagation();
        searchBox.classList.remove('active');
        searchInput.value = '';
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (query.length < 2) {
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
            return;
        }

        const allSearchData = [...AppState.carouselMovies, ...AppState.allMovies, ...AppState.webSeriesData];
        const searchResultsData = allSearchData.filter(item => {
            return item && item.title && item.title.toLowerCase().includes(query);
        });

        if (searchResultsData.length === 0) {
            searchResults.innerHTML = `
                <div style="text-align: center; padding: 30px 20px; color: #888; background: #000000;">
                    <i class="fas fa-search" style="font-size: 40px; color: #e50914; margin-bottom: 10px;"></i>
                    <p style="background: #000000;">No results found for "${query}"</p>
                </div>
            `;
            searchResults.style.display = 'block';
            return;
        }

        searchResults.style.cssText = `
            position: fixed;
            top: 130px !important;
            background: #000000;
            border: 2px solid #e50914;
            border-radius: 8px;
            z-index: 1005;
            overflow-y: auto;
            display: block;
        `;

        if (window.innerWidth <= 768) {
            searchResults.style.top = '130px';
            searchResults.style.left = '15px';
            searchResults.style.right = '15px';
            searchResults.style.width = 'calc(100vw - 30px)';
            searchResults.style.maxHeight = '60vh';
        } else {
            const rect = searchBox.getBoundingClientRect();
            searchResults.style.top = (rect.bottom + 5) + 'px';
            searchResults.style.left = rect.left + 'px';
            searchResults.style.width = rect.width + 'px';
            searchResults.style.maxHeight = '400px';
        }

        let html = `
            <div style="background: #000000;">
                <h4 style="margin: 0; padding: 15px; color: #e50914; border-bottom: 1px solid #e50914; background: #000000;">
                    Search Results (${searchResultsData.length})
                </h4>
        `;

        searchResultsData.slice(0, 10).forEach(item => {
            const image = item.poster || item.image || '';
            const genre = item.genre || (Array.isArray(item.genres) && item.genres.length > 0 ? item.genres[0] : 'Movie');
            const duration = item.duration || (item.seasons ? `${item.seasons} Seasons` : 'N/A');

            html += `
                <div style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer; background: #000000;" data-title="${item.title}">
                    ${image ? `<img src="${image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 15px;">` : ''}
                    <div>
                        <div style="color: white; font-weight: bold; margin-bottom: 5px; background: #000000;">${item.title}</div>
                        <div style="color: #aaa; font-size: 12px; background: #000000;">${genre} • ${duration}</div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        searchResults.innerHTML = html;

        searchResults.querySelectorAll('div[data-title]').forEach(item => {
            item.addEventListener('click', function () {
                alert(`🎬 Playing: ${this.getAttribute('data-title')}`);
                searchBox.classList.remove('active');
                searchInput.value = '';
                searchResults.style.display = 'none';
            });
        });

        searchResults.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchResults.style.display = 'none';
        }
    });
}

function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileNavClose = document.querySelector('.mobile-nav-close');

    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.contains('active');
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        mobileNavOverlay?.classList.toggle('active');
        document.body.style.overflow = isActive ? '' : 'hidden';
    });

    mobileNavClose?.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        mobileNavOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    });

    mobileNavOverlay?.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        mobileNavOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    });
}

function setupCarousel() {
    console.log('🎪 Setting up carousel...');

    if (!Array.isArray(AppState.carouselMovies) || AppState.carouselMovies.length === 0) {
        console.warn('⚠️ No carousel data available');
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) heroSection.style.display = 'none';
        return;
    }

    let currentIndex = 0;
    const sliderTrack = document.getElementById('sliderTrack');
    const heroBg = document.getElementById('heroBg');
    const mobileSliderTrack = document.getElementById('mobileSliderTrack');

    if (!sliderTrack) return;

    if (heroBg && AppState.carouselMovies[0]?.hero_bg) {
        heroBg.style.backgroundImage = `url('${AppState.carouselMovies[0].hero_bg}')`;
        heroBg.style.backgroundSize = 'cover';
        heroBg.style.backgroundPosition = 'center';
    }

    sliderTrack.innerHTML = '';
    if (mobileSliderTrack) mobileSliderTrack.innerHTML = '';

    AppState.carouselMovies.forEach((movie, index) => {
        if (!movie) return;

        const title = movie.title || 'Untitled';
        const poster = movie.poster || '';
        const genres = Array.isArray(movie.genres) ? movie.genres : [];
        const firstGenre = genres.length > 0 ? genres[0] : 'Movie';
        const imageHtml = poster ? `<img src="${poster}" alt="${title}" loading="lazy">` : '';

        const card = document.createElement('div');
        card.className = `movie-card ${index === 0 ? 'active' : 'inactive'}`;
        card.setAttribute('data-index', index);
        card.innerHTML = `
            ${imageHtml}
            <div class="movie-info">
                <h3>${title}</h3>
                <div class="mini-genre">${firstGenre}</div>
            </div>
        `;
        card.addEventListener('click', () => {
            updateCarouselContent(index);
            updateCardStates(index);
            currentIndex = index;
            centerActiveCard();
            centerActiveMobileCard();
        });
        sliderTrack.appendChild(card);
    });

    if (mobileSliderTrack) {
        AppState.carouselMovies.forEach((movie, index) => {
            if (!movie) return;

            const title = movie.title || 'Untitled';
            const poster = movie.poster || '';
            const genres = Array.isArray(movie.genres) ? movie.genres : [];
            const firstGenre = genres.length > 0 ? genres[0] : 'Movie';
            const imageHtml = poster ? `<img src="${poster}" alt="${title}" loading="lazy">` : '';

            const card = document.createElement('div');
            card.className = `movie-card ${index === 0 ? 'active' : 'inactive'}`;
            card.style.width = '160px';
            card.style.height = '240px';
            card.setAttribute('data-index', index);
            card.innerHTML = `
                ${imageHtml}
                <div class="movie-info">
                    <h3>${title}</h3>
                    <div class="mini-genre">${firstGenre}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                updateCarouselContent(index);
                updateMobileCardStates(index);
                updateCardStates(index);
                currentIndex = index;
                centerActiveCard();
                centerActiveMobileCard();
            });
            mobileSliderTrack.appendChild(card);
        });
    }

    function updateCarouselContent(index) {
        if (!AppState.carouselMovies[index]) return;
        const movie = AppState.carouselMovies[index];

        const title = movie.title || 'Untitled';
        const rating = movie.rating || '⭐ N/A';
        const duration = movie.duration || 'N/A';
        const description = movie.description || 'No description available';
        const cast = movie.cast || 'Cast information not available';
        const genres = Array.isArray(movie.genres) ? movie.genres : ['Movie'];
        const heroBgUrl = movie.hero_bg || '';

        const titleElement = document.getElementById('movieTitle');
        const ratingElement = document.getElementById('movieRating');
        const durationElement = document.getElementById('movieDuration');
        const descriptionElement = document.getElementById('movieDescription');
        const castElement = document.getElementById('castCrew');

        if (titleElement) titleElement.textContent = title;
        if (ratingElement) ratingElement.textContent = rating;
        if (durationElement) durationElement.textContent = duration;
        if (descriptionElement) descriptionElement.textContent = description;
        if (castElement) castElement.textContent = cast;

        const genreTags = document.getElementById('genreTags');
        if (genreTags) {
            genreTags.innerHTML = '';
            genres.forEach(genre => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = genre;
                genreTags.appendChild(tag);
            });
        }

        if (heroBg && heroBgUrl) {
            heroBg.style.backgroundImage = `url('${heroBgUrl}')`;
        }
    }

    function updateCardStates(activeIndex) {
        const cards = document.querySelectorAll('#sliderTrack .movie-card');
        cards.forEach((card, index) => {
            card.classList.toggle('active', index === activeIndex);
            card.classList.toggle('inactive', index !== activeIndex);
        });
    }

    function updateMobileCardStates(activeIndex) {
        const cards = document.querySelectorAll('#mobileSliderTrack .movie-card');
        cards.forEach((card, index) => {
            card.classList.toggle('active', index === activeIndex);
            card.classList.toggle('inactive', index !== activeIndex);
        });
    }

    function centerActiveCard() {
        if (window.innerWidth > 991 && sliderTrack) {
            const rightSlider = document.querySelector('.right-slider');
            if (!rightSlider) return;

            const sliderHeight = rightSlider.offsetHeight;
            const allCards = document.querySelectorAll('#sliderTrack .movie-card');
            let totalHeight = 0;
            allCards.forEach((_, index) => {
                totalHeight += (index === currentIndex ? 380 : 220);
            });

            let activeCardPosition = 0;
            for (let i = 0; i < currentIndex; i++) {
                activeCardPosition += (i === 0 ? 200 : 220);
            }
            activeCardPosition += 190;

            const sliderCenter = sliderHeight / 2;
            const offset = sliderCenter - activeCardPosition;

            sliderTrack.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            sliderTrack.style.transform = `translateY(${offset}px)`;
        }
    }

    function centerActiveMobileCard() {
        if (window.innerWidth <= 991 && mobileSliderTrack) {
            const mobileSlider = document.querySelector('.mobile-right-slider');
            if (!mobileSlider) return;

            const containerWidth = mobileSlider.offsetWidth;
            const cardWidth = 160;
            const gap = 15;
            const centerPosition = (containerWidth / 2) - (cardWidth / 2);
            const cardPosition = currentIndex * (cardWidth + gap);
            const offset = centerPosition - cardPosition;

            mobileSliderTrack.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            mobileSliderTrack.style.transform = `translateX(${offset}px)`;
        }
    }

    document.getElementById('sliderPrevBtn')?.addEventListener('click', () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : AppState.carouselMovies.length - 1;
        updateCarouselContent(currentIndex);
        updateCardStates(currentIndex);
        updateMobileCardStates(currentIndex);
        centerActiveCard();
        centerActiveMobileCard();
    });

    document.getElementById('sliderNextBtn')?.addEventListener('click', () => {
        currentIndex = currentIndex < AppState.carouselMovies.length - 1 ? currentIndex + 1 : 0;
        updateCarouselContent(currentIndex);
        updateCardStates(currentIndex);
        updateMobileCardStates(currentIndex);
        centerActiveCard();
        centerActiveMobileCard();
    });

    document.getElementById('mobileSliderPrevBtn')?.addEventListener('click', () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : AppState.carouselMovies.length - 1;
        updateCarouselContent(currentIndex);
        updateMobileCardStates(currentIndex);
        updateCardStates(currentIndex);
        centerActiveCard();
        centerActiveMobileCard();
    });

    document.getElementById('mobileSliderNextBtn')?.addEventListener('click', () => {
        currentIndex = currentIndex < AppState.carouselMovies.length - 1 ? currentIndex + 1 : 0;
        updateCarouselContent(currentIndex);
        updateMobileCardStates(currentIndex);
        updateCardStates(currentIndex);
        centerActiveCard();
        centerActiveMobileCard();
    });

    updateCarouselContent(0);
    setTimeout(() => {
        centerActiveCard();
        centerActiveMobileCard();
    }, 300);

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 991) {
            document.querySelector('.right-slider')?.style.setProperty('display', 'none', 'important');
            document.querySelector('.vertical-slider-nav')?.style.setProperty('display', 'none', 'important');
            document.querySelector('.mobile-right-slider')?.style.setProperty('display', 'flex', 'important');
            if (mobileSliderTrack) {
                mobileSliderTrack.style.transition = 'none';
                centerActiveMobileCard();
            }
        } else {
            document.querySelector('.right-slider')?.style.setProperty('display', 'block', 'important');
            document.querySelector('.vertical-slider-nav')?.style.setProperty('display', 'flex', 'important');
            document.querySelector('.mobile-right-slider')?.style.setProperty('display', 'none', 'important');
            if (sliderTrack) {
                sliderTrack.style.transition = 'none';
                centerActiveCard();
            }
        }

        setTimeout(() => {
            centerActiveCard();
            centerActiveMobileCard();
        }, 100);
    });

    if (window.innerWidth <= 991) {
        centerActiveMobileCard();
    } else {
        centerActiveCard();
    }
}

function generateMovieCards() {
    console.log('🎥 Generating movie cards...');

    const sections = [
        { id: 'upcoming-wrapper', category: 'upcoming' },
        { id: 'top-ten-wrapper', category: 'top-ten' },
        { id: 'trending-today-wrapper', category: 'trending' },
        { id: 'trending-week-wrapper', category: 'trending' },
        { id: 'trending-month-wrapper', category: 'trending' }
    ];

    sections.forEach(section => {
        const container = document.getElementById(section.id);
        if (!container) return;

        container.innerHTML = '';

        const filteredMovies = AppState.allMovies.filter(movie => {
            return movie && movie.category && movie.category === section.category;
        });

        if (filteredMovies.length === 0) {
            container.style.display = 'none';
            return;
        }

        filteredMovies.forEach(movie => {
            if (!movie) return;

            const title = movie.title || 'Untitled';
            const image = movie.image || '';
            const duration = movie.duration || 'N/A';
            const quality = movie.quality || 'HD';
            const imageHtml = image ? `<img src="${image}" alt="${title}" loading="lazy">` : '';

            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <div class="movie-card-section">
                    <div class="card-img-box">
                        ${imageHtml}
                        <div class="card-hover-actions">
                            <button class="action-icon play" onclick="playMovie('${title}')">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="action-icon" onclick="addToWatchlist('${title}')">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="action-icon" onclick="likeMovie('${title}')">
                                <i class="fas fa-thumbs-up"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-details">
                        <h5 class="card-title">${title}</h5>
                        <div class="card-meta">
                            <span>${duration}</span>
                            <span class="card-quality">${quality}</span>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(slide);
        });
    });
}

function setupContinueWatching() {
    console.log('⏯️ Setting up continue watching...');

    if (!Array.isArray(AppState.continueWatchingData) || AppState.continueWatchingData.length === 0) {
        console.warn('⚠️ No continue watching data available');
        const continueSection = document.querySelector('.continue-watching-section');
        if (continueSection) continueSection.style.display = 'none';
        return;
    }

    const container = document.getElementById('continueMoviesContainer');
    if (!container) return;

    container.innerHTML = '';

    AppState.continueWatchingData.forEach(movie => {
        if (!movie) return;

        const title = movie.title || 'Untitled';
        const image = movie.image || '';
        const date = movie.date || 'N/A';
        const rating = movie.rating || 'N/A';
        const progress = movie.progress || 0;
        const imageHtml = image ? `<img src="${image}" alt="${title}" loading="lazy">` : '';

        const movieCard = document.createElement('div');
        movieCard.className = 'continue-movie-card';
        movieCard.onclick = () => playMovie(title);
        movieCard.innerHTML = `
            ${imageHtml}
            <div class="continue-movie-info">
                <div class="continue-movie-title">${title}</div>
                <div class="continue-movie-meta">
                    <span class="continue-movie-date">${date}</span>
                    <span class="continue-movie-rating">★ ${rating}</span>
                </div>
            </div>
            <div class="continue-progress-bar" style="width: ${progress}%"></div>
        `;
        container.appendChild(movieCard);
    });

    const prevBtn = document.querySelector('.continue-prev');
    const nextBtn = document.querySelector('.continue-next');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -300, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
}

function setupWebSeries() {
    console.log('📺 Setting up web series...');

    if (!Array.isArray(AppState.webSeriesData) || AppState.webSeriesData.length === 0) {
        console.warn('⚠️ No web series data available');
        const seriesSection = document.querySelector('.webseries-section');
        if (seriesSection) seriesSection.style.display = 'none';
        return;
    }

    updateSeriesDisplay();
    setupSeriesNavigation();
}

function updateSeriesDisplay() {
    if (!AppState.webSeriesData[AppState.currentSeriesIndex]) {
        console.error('❌ No web series data at index:', AppState.currentSeriesIndex);
        return;
    }

    const series = AppState.webSeriesData[AppState.currentSeriesIndex];
    const id = series.id || (AppState.currentSeriesIndex + 1);
    const rank = series.rank || (AppState.currentSeriesIndex + 1);
    const title = series.title || 'Untitled Series';
    const rating = series.rating || 'N/A/10';
    const year = series.year || 'N/A';
    const seasons = series.seasons || 1;
    const episodes = series.episodes || 0;
    const description = series.description || 'No description available';
    const image = series.image || '';
    const genres = Array.isArray(series.genres) ? series.genres : ['Drama'];

    const currentSeriesNumElement = document.getElementById('currentSeriesNum');
    const seriesRankElement = document.getElementById('seriesRank');
    const seriesTitleElement = document.getElementById('seriesTitle');
    const seriesRatingElement = document.getElementById('seriesRating');
    const seriesYearElement = document.getElementById('seriesYear');
    const seriesSeasonsElement = document.getElementById('seriesSeasons');
    const seriesEpisodesElement = document.getElementById('seriesEpisodes');
    const seriesDescriptionElement = document.getElementById('seriesDescription');
    const seasonsCountElement = document.getElementById('seasonsCount');
    const seriesBgElement = document.getElementById('seriesBg');
    const genresContainer = document.getElementById('seriesGenres');

    if (currentSeriesNumElement) currentSeriesNumElement.textContent = id;
    if (seriesRankElement) seriesRankElement.textContent = rank;
    if (seriesTitleElement) seriesTitleElement.textContent = title;
    if (seriesRatingElement) seriesRatingElement.textContent = rating;
    if (seriesYearElement) seriesYearElement.textContent = year;
    if (seriesSeasonsElement) seriesSeasonsElement.textContent = `${seasons} Seasons`;
    if (seriesEpisodesElement) seriesEpisodesElement.textContent = `${episodes} Episodes`;
    if (seriesDescriptionElement) seriesDescriptionElement.textContent = description;
    if (seasonsCountElement) seasonsCountElement.textContent = `${seasons} Seasons`;

    if (seriesBgElement && image) {
        seriesBgElement.style.backgroundImage = `url('${image}')`;
    } else if (seriesBgElement) {
        seriesBgElement.style.backgroundImage = 'none';
    }

    if (genresContainer) {
        genresContainer.innerHTML = genres.map(genre =>
            `<span class="genre-tag">${genre}</span>`
        ).join('');
    }

    updateSeasonsTabs();
    updateEpisodesList();
}

function updateSeasonsTabs() {
    const series = AppState.webSeriesData[AppState.currentSeriesIndex];
    if (!series) return;

    const seasons = series.seasons || 1;
    const tabsContainer = document.getElementById('seasonsTabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';

    for (let seasonNum = 1; seasonNum <= seasons; seasonNum++) {
        const tab = document.createElement('div');
        tab.className = `season-tab ${seasonNum === AppState.currentSeason ? 'active' : ''}`;
        tab.textContent = `Season ${seasonNum}`;
        tab.dataset.season = seasonNum;

        tab.addEventListener('click', () => {
            AppState.currentSeason = seasonNum;
            document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateEpisodesList();
        });

        tabsContainer.appendChild(tab);
    }
}

function updateEpisodesList() {
    const series = AppState.webSeriesData[AppState.currentSeriesIndex];
    if (!series) return;

    const seasonsData = series.seasonsData || {};
    const episodes = seasonsData[AppState.currentSeason] || [];
    const episodesList = document.getElementById('episodesList');
    if (!episodesList) return;

    if (episodes.length === 0) {
        episodesList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #888;">
                <i class="fas fa-film" style="font-size: 40px; margin-bottom: 15px; color: #e50914;"></i>
                <p>No episodes available for Season ${AppState.currentSeason}</p>
            </div>
        `;
        return;
    }

    episodesList.innerHTML = episodes.map(ep => {
        const episodeNum = ep.episode || 1;
        const episodeTitle = ep.title || `Episode ${episodeNum}`;
        const episodeImage = ep.image || '';
        const episodeDuration = ep.duration || '45m';
        const imageHtml = episodeImage ? `<img src="${episodeImage}" alt="${episodeTitle}" class="episode-image">` : '';

        return `
            <div class="episode-item" onclick="playEpisode(${series.id || AppState.currentSeriesIndex + 1}, ${AppState.currentSeason}, ${episodeNum})">
                <div class="episode-image-container">
                    ${imageHtml}
                    <div class="episode-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="episode-number">Episode ${episodeNum}</div>
                </div>
                <div class="episode-content">
                    <div class="episode-title">${episodeTitle}</div>
                    <div class="episode-meta">
                        <div class="episode-duration">
                            <i class="far fa-clock"></i>
                            <span>${episodeDuration}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function setupSeriesNavigation() {
    const prevBtn = document.querySelector('.series-prev');
    const nextBtn = document.querySelector('.series-next');
    const playBtn = document.querySelector('.series-play-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            AppState.currentSeriesIndex = (AppState.currentSeriesIndex - 1 + AppState.webSeriesData.length) % AppState.webSeriesData.length;
            AppState.currentSeason = 1;
            updateSeriesDisplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            AppState.currentSeriesIndex = (AppState.currentSeriesIndex + 1) % AppState.webSeriesData.length;
            AppState.currentSeason = 1;
            updateSeriesDisplay();
        });
    }

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            playSeries(AppState.currentSeriesIndex);
        });
    }
}

function initializeSwipers() {
    if (typeof Swiper === 'undefined') {
        console.warn('⚠️ Swiper library not loaded');
        return;
    }

    document.querySelectorAll('.content-swiper').forEach(swiperEl => {
        try {
            new Swiper(swiperEl, {
                slidesPerView: 'auto',
                spaceBetween: 20,
                loop: true,
                navigation: {
                    nextEl: swiperEl.querySelector('.swiper-button-next'),
                    prevEl: swiperEl.querySelector('.swiper-button-prev'),
                },
                breakpoints: {
                    320: { slidesPerView: 1, spaceBetween: 15 },
                    480: { slidesPerView: 1, spaceBetween: 20 },
                    576: { slidesPerView: 2, spaceBetween: 20 },
                    768: { slidesPerView: 3, spaceBetween: 20 },
                    992: { slidesPerView: 4, spaceBetween: 25 },
                    1200: { slidesPerView: 5, spaceBetween: 25 },
                    1400: { slidesPerView: 6, spaceBetween: 30 }
                }
            });
        } catch (error) {
            console.error('❌ Error initializing Swiper:', error);
        }
    });

    document.querySelectorAll('.trending-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            document.querySelectorAll('.trending-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');

            document.querySelectorAll('.trending-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function playMovie(title) {
    alert(`🎬 Now playing: ${title}\n\nNote: This is a demo.`);
}

function playSeries(seriesIndex) {
    if (!AppState.webSeriesData[seriesIndex]) return;
    const series = AppState.webSeriesData[seriesIndex];
    alert(`🎬 Starting: ${series.title || 'Untitled Series'}\n\nNote: This is a demo.`);
}

function playEpisode(seriesId, season, episode) {
    const seriesIndex = seriesId - 1;
    if (!AppState.webSeriesData[seriesIndex]) return;

    const series = AppState.webSeriesData[seriesIndex];
    const seasonsData = series.seasonsData || {};
    const episodes = seasonsData[season] || [];
    const episodeData = episodes.find(ep => ep.episode === episode);
    const episodeTitle = episodeData?.title || `Episode ${episode}`;

    alert(`🎬 Playing: ${series.title || 'Untitled Series'}\nSeason ${season}, Episode ${episode}: ${episodeTitle}\n\nNote: This is a demo.`);
}

function addToWatchlist(title) {
    alert(`➕ Added "${title}" to watchlist\n\nNote: This is a demo.`);
}

function likeMovie(title) {
    alert(`👍 Liked "${title}"\n\nNote: This is a demo.`);
}

function displayErrorNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e50914;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 5000);
}

const backToTopBtn = document.getElementById('backToTopBtn');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

window.addEventListener('resize', () => {
    const userDropdown = document.getElementById('userDropdown');
    const userTrigger = document.getElementById('userProfileTrigger');

    if (userDropdown && userDropdown.style.display === 'block' && userTrigger) {
        const triggerRect = userTrigger.getBoundingClientRect();
        userDropdown.style.top = `${triggerRect.bottom + 5}px`;
        userDropdown.style.right = `${window.innerWidth - triggerRect.right}px`;
    }

    const searchResults = document.querySelector('.search-results');
    const searchBox = document.querySelector('.search-box');

    if (searchResults && searchResults.style.display === 'block' && searchBox) {
        const searchRect = searchBox.getBoundingClientRect();
        searchResults.style.top = `${searchRect.bottom + 5}px`;
        searchResults.style.left = `${searchRect.left}px`;
        searchResults.style.width = `${searchRect.width}px`;
    }

    if (window.innerWidth <= 991) {
        document.querySelector('.right-slider')?.style.setProperty('display', 'none', 'important');
        document.querySelector('.vertical-slider-nav')?.style.setProperty('display', 'none', 'important');
        document.querySelector('.mobile-right-slider')?.style.setProperty('display', 'flex', 'important');
    } else {
        document.querySelector('.right-slider')?.style.setProperty('display', 'block', 'important');
        document.querySelector('.vertical-slider-nav')?.style.setProperty('display', 'flex', 'important');
        document.querySelector('.mobile-right-slider')?.style.setProperty('display', 'none', 'important');
    }
});