document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let allApps = [];
    let filteredApps = [];
    let currentPage = 1;
    const appsPerPage = 20;
    let currentFilters = {
        categories: [],
        tags: [],
        search: ''
    };
    let sortBy = 'name';

    // Initialize the app
    async function init() {
        await loadApps();
        renderApps();
        setupEventListeners();
        updateStats();
    }

    // Load apps from data.json
    async function loadApps() {
        try {
            const response = await fetch('data.json');
            allApps = await response.json();
            
            // Load ratings from localStorage
            allApps.forEach(app => {
                const savedRating = localStorage.getItem(`app-rating-${app.id}`);
                if (savedRating) {
                    app.userRating = parseInt(savedRating);
                }
                
                // Calculate average rating
                if (app.ratings && app.ratings.length > 0) {
                    const sum = app.ratings.reduce((a, b) => a + b, 0);
                    app.averageRating = (sum / app.ratings.length).toFixed(1);
                } else {
                    app.averageRating = '0.0';
                }
            });
            
            filteredApps = [...allApps];
        } catch (error) {
            console.error('Error loading apps:', error);
            // Fallback to sample data if data.json fails
            loadSampleData();
        }
    }

    // Fallback sample data
    function loadSampleData() {
        // This would be replaced by actual 111+ apps in data.json
        allApps = [
            {
                id: 1,
                name: "Signal",
                url: "https://signal.org",
                description: "Private messenger with end-to-end encryption",
                categories: ["Messaging", "Communication"],
                tags: ["encrypted", "privacy", "open-source"],
                ratings: [5, 4, 5]
            },
            // ... more apps
        ];
        filteredApps = [...allApps];
    }

    // Render apps to the page
    function renderApps() {
        const container = document.getElementById('apps-container');
        const startIndex = (currentPage - 1) * appsPerPage;
        const endIndex = startIndex + appsPerPage;
        const appsToShow = filteredApps.slice(startIndex, endIndex);
        
        container.innerHTML = '';
        
        appsToShow.forEach(app => {
            const appElement = createAppElement(app);
            container.appendChild(appElement);
        });
        
        updatePagination();
        updatePageInfo();
    }

    // Create app card element
    function createAppElement(app) {
        const div = document.createElement('div');
        div.className = 'app-card';
        
        // Calculate star display
        const averageRating = parseFloat(app.averageRating);
        const userRating = app.userRating || 0;
        const starsHTML = createStarsHTML(averageRating, userRating, app.id);
        
        div.innerHTML = `
            <div class="app-header">
                <a href="${app.url}" target="_blank" class="app-name">
                    ${app.name}
                </a>
                <div class="app-rating-display">
                    <span class="rating-number">${app.averageRating}</span>
                    <i class="fas fa-star" style="color: #ffd700;"></i>
                </div>
            </div>
            
            <p class="app-description">${app.description || 'No description available'}</p>
            
            <div class="app-categories">
                ${app.categories.map(cat => 
                    `<span class="category" data-category="${cat}">${cat}</span>`
                ).join('')}
            </div>
            
            <div class="app-tags">
                ${app.tags.map(tag => 
                    `<span class="app-tag" data-tag="${tag}">#${tag}</span>`
                ).join('')}
            </div>
            
            <div class="rating">
                <div class="stars" data-app-id="${app.id}">
                    ${starsHTML}
                </div>
                <div class="rating-info">
                    ${app.ratings ? `${app.ratings.length} ratings` : 'No ratings yet'}
                </div>
            </div>
        `;
        
        // Add star rating event listeners
        const starsContainer = div.querySelector('.stars');
        starsContainer.addEventListener('click', handleStarClick);
        
        // Add filter event listeners to tags and categories
        div.querySelectorAll('.category').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCategoryFilter(el.dataset.category);
            });
        });
        
        div.querySelectorAll('.app-tag').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleTagFilter(el.dataset.tag);
            });
        });
        
        return div;
    }

    // Create stars HTML for rating
    function createStarsHTML(averageRating, userRating, appId) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            const isUserRating = userRating >= i;
            const isAverageRating = averageRating >= i;
            const isActive = isUserRating || (!userRating && isAverageRating);
            
            html += `
                <span class="star ${isActive ? 'active' : ''}" 
                      data-rating="${i}" 
                      data-app-id="${appId}">
                    ★
                </span>
            `;
        }
        return html;
    }

    // Handle star rating click
    function handleStarClick(e) {
        const star = e.target;
        if (!star.classList.contains('star')) return;
        
        const appId = parseInt(star.dataset.appId);
        const rating = parseInt(star.dataset.rating);
        
        // Save rating to localStorage
        localStorage.setItem(`app-rating-${appId}`, rating.toString());
        
        // Update the app data
        const app = allApps.find(a => a.id === appId);
        if (app) {
            app.userRating = rating;
            if (!app.ratings) app.ratings = [];
            app.ratings.push(rating);
            
            // Recalculate average
            const sum = app.ratings.reduce((a, b) => a + b, 0);
            app.averageRating = (sum / app.ratings.length).toFixed(1);
            
            // Update display
            renderApps();
            updateStats();
        }
    }

    // Update pagination controls
    function updatePagination() {
        const totalPages = Math.ceil(filteredApps.length / appsPerPage);
        const pageNumbers = document.getElementById('page-numbers');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        // Update button states
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
        
        // Generate page numbers
        pageNumbers.innerHTML = '';
        
        // Show first page, last page, and pages around current
        const pagesToShow = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pagesToShow.push(i);
        } else {
            pagesToShow.push(1);
            if (currentPage > 3) pagesToShow.push('...');
            
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = start; i <= end; i++) pagesToShow.push(i);
            
            if (currentPage < totalPages - 2) pagesToShow.push('...');
            pagesToShow.push(totalPages);
        }
        
        // Create page number buttons
        pagesToShow.forEach(page => {
            const btn = document.createElement('button');
            btn.className = 'page-number';
            
            if (page === '...') {
                btn.textContent = '...';
                btn.disabled = true;
            } else {
                btn.textContent = page;
                if (page === currentPage) {
                    btn.classList.add('active');
                }
                btn.addEventListener('click', () => {
                    currentPage = page;
                    renderApps();
                });
            }
            
            pageNumbers.appendChild(btn);
        });
    }

    // Update page info
    function updatePageInfo() {
        const startIndex = (currentPage - 1) * appsPerPage + 1;
        const endIndex = Math.min(startIndex + appsPerPage - 1, filteredApps.length);
        const totalCount = filteredApps.length;
        
        document.getElementById('start-index').textContent = startIndex;
        document.getElementById('end-index').textContent = endIndex;
        document.getElementById('total-count').textContent = totalCount;
        document.getElementById('total-apps').textContent = allApps.length;
    }

    // Update statistics
    function updateStats() {
        // Count unique tags
        const allTags = new Set();
        allApps.forEach(app => {
            app.tags.forEach(tag => allTags.add(tag));
        });
        document.getElementById('total-tags').textContent = allTags.size;
    }

    // Filter apps based on current filters
    function filterApps() {
        filteredApps = allApps.filter(app => {
            // Search filter
            if (currentFilters.search) {
                const searchTerm = currentFilters.search.toLowerCase();
                const searchable = `${app.name} ${app.description} ${app.categories.join(' ')} ${app.tags.join(' ')}`.toLowerCase();
                if (!searchable.includes(searchTerm)) return false;
            }
            
            // Category filter
            if (currentFilters.categories.length > 0) {
                const hasCategory = currentFilters.categories.some(cat => 
                    app.categories.includes(cat)
                );
                if (!hasCategory) return false;
            }
            
            // Tag filter
            if (currentFilters.tags.length > 0) {
                const hasTag = currentFilters.tags.some(tag => 
                    app.tags.includes(tag)
                );
                if (!hasTag) return false;
            }
            
            return true;
        });
        
        // Sort filtered apps
        sortFilteredApps();
        
        // Reset to first page
        currentPage = 1;
        renderApps();
        updateFilterTags();
    }

    // Sort filtered apps
    function sortFilteredApps() {
        filteredApps.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return parseFloat(b.averageRating) - parseFloat(a.averageRating);
                case 'newest':
                    return b.id - a.id; // Assuming higher ID = newer
                default: // 'name'
                    return a.name.localeCompare(b.name);
            }
        });
    }

    // Update filter tags display
    function updateFilterTags() {
        const categoryContainer = document.getElementById('category-filters');
        const tagContainer = document.getElementById('tag-filters');
        
        // Get all unique categories and tags
        const categories = [...new Set(allApps.flatMap(app => app.categories))];
        const allTags = allApps.flatMap(app => app.tags);
        const tagCounts = {};
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
        
        // Sort tags by frequency
        const popularTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([tag]) => tag);
        
        // Render category filters
        categoryContainer.innerHTML = categories.map(cat => `
            <span class="tag ${currentFilters.categories.includes(cat) ? 'active' : ''}" 
                  data-filter="category" 
                  data-value="${cat}">
                ${cat}
            </span>
        `).join('');
        
        // Render tag filters
        tagContainer.innerHTML = popularTags.map(tag => `
            <span class="tag ${currentFilters.tags.includes(tag) ? 'active' : ''}" 
                  data-filter="tag" 
                  data-value="${tag}">
                ${tag} (${tagCounts[tag]})
            </span>
        `).join('');
        
        // Add event listeners to filter tags
        document.querySelectorAll('.tag[data-filter]').forEach(tag => {
            tag.addEventListener('click', () => {
                const filterType = tag.dataset.filter;
                const value = tag.dataset.value;
                
                if (filterType === 'category') {
                    toggleCategoryFilter(value);
                } else if (filterType === 'tag') {
                    toggleTagFilter(value);
                }
            });
        });
    }

    // Toggle category filter
    function toggleCategoryFilter(category) {
        const index = currentFilters.categories.indexOf(category);
        if (index === -1) {
            currentFilters.categories.push(category);
        } else {
            currentFilters.categories.splice(index, 1);
        }
        filterApps();
    }

    // Toggle tag filter
    function toggleTagFilter(tag) {
        const index = currentFilters.tags.indexOf(tag);
        if (index === -1) {
            currentFilters.tags.push(tag);
        } else {
            currentFilters.tags.splice(index, 1);
        }
        filterApps();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = e.target.value.trim();
                filterApps();
            }, 300);
        });
        
        // Sort select
        const sortSelect = document.getElementById('sort-by');
        sortSelect.addEventListener('change', (e) => {
            sortBy = e.target.value;
            sortFilteredApps();
            renderApps();
        });
        
        // Clear filters button
        document.getElementById('clear-filters').addEventListener('click', () => {
            currentFilters = {
                categories: [],
                tags: [],
                search: ''
            };
            searchInput.value = '';
            filterApps();
        });
        
        // Previous page button
        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderApps();
            }
        });
        
        // Next page button
        document.getElementById('next-page').addEventListener('click', () => {
            const totalPages = Math.ceil(filteredApps.length / appsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderApps();
            }
        });
    }

    // Initialize the application
    init();
});
