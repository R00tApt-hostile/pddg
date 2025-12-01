// Main application
document.addEventListener('DOMContentLoaded', function() {
    // State
    let tools = [];
    let filteredTools = [];
    let currentPage = 1;
    const toolsPerPage = 20;
    let currentCategory = 'all';
    let currentTags = [];
    let currentSort = 'name';
    let currentSearch = '';
    let currentToolForRating = null;
    
    // DOM Elements
    const toolsList = document.getElementById('tools-list');
    const categoryList = document.getElementById('category-list');
    const tagList = document.getElementById('tag-list');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');
    const pageInfo = document.getElementById('page-info');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const totalToolsEl = document.getElementById('total-tools');
    const totalCategoriesEl = document.getElementById('total-categories');
    const averageRatingEl = document.getElementById('average-rating');
    const toolsTitle = document.getElementById('tools-title');
    const addToolForm = document.getElementById('add-tool-form');
    const showFormBtn = document.getElementById('show-form-btn');
    const formMessage = document.getElementById('form-message');
    const ratingModal = document.getElementById('rating-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const modalToolName = document.getElementById('modal-tool-name');
    const saveRatingBtn = document.getElementById('save-rating');
    const exportDataBtn = document.getElementById('export-data');
    const importDataBtn = document.getElementById('import-data');
    const importModal = document.getElementById('import-modal');
    const processImportBtn = document.getElementById('process-import');
    
    // Initialize the app
    init();
    
    function init() {
        loadTools();
        setupEventListeners();
        renderCategories();
        renderTags();
        updateUI();
    }
    
    function loadTools() {
        // Try to load from localStorage first
        const savedTools = localStorage.getItem('privacyTools');
        
        if (savedTools) {
            tools = JSON.parse(savedTools);
        } else {
            // Load default tools from data.json
            fetch('data.json')
                .then(response => response.json())
                .then(data => {
                    tools = data.tools;
                    saveToolsToStorage();
                    updateUI();
                })
                .catch(error => {
                    console.error('Error loading tools:', error);
                    // If we can't load from data.json, use fallback data
                    tools = getFallbackTools();
                    saveToolsToStorage();
                    updateUI();
                });
        }
        
        // Initialize filtered tools
        filteredTools = [...tools];
    }
    
    function getFallbackTools() {
        return [
            {
                id: 1,
                name: "Brave Browser",
                url: "https://brave.com",
                description: "Privacy-focused browser that blocks trackers and ads by default.",
                category: "Browser",
                privacyScore: 85,
                tags: ["open-source", "tracker-blocking", "chromium-based"],
                rating: 4.2,
                ratingsCount: 1240
            },
            {
                id: 2,
                name: "ProtonMail",
                url: "https://protonmail.com",
                description: "Secure email service with end-to-end encryption and no tracking.",
                category: "Email",
                privacyScore: 90,
                tags: ["encrypted", "swiss-based", "open-source"],
                rating: 4.5,
                ratingsCount: 890
            },
            {
                id: 3,
                name: "Signal",
                url: "https://signal.org",
                description: "Private messenger with end-to-end encryption for calls and messages.",
                category: "Messaging",
                privacyScore: 95,
                tags: ["encrypted", "non-profit", "open-source"],
                rating: 4.7,
                ratingsCount: 2150
            },
            {
                id: 4,
                name: "Nextcloud",
                url: "https://nextcloud.com",
                description: "Self-hosted productivity platform and file synchronization.",
                category: "Cloud Storage",
                privacyScore: 88,
                tags: ["self-hosted", "open-source", "encrypted"],
                rating: 4.3,
                ratingsCount: 760
            },
            {
                id: 5,
                name: "DuckDuckGo",
                url: "https://duckduckgo.com",
                description: "Search engine that doesn't track your searches or personalize results.",
                category: "Search Engine",
                privacyScore: 82,
                tags: ["tracker-blocking", "no-tracking", "private-search"],
                rating: 4.0,
                ratingsCount: 1850
            },
            {
                id: 6,
                name: "Bitwarden",
                url: "https://bitwarden.com",
                description: "Open source password manager with end-to-end encryption.",
                category: "Password Manager",
                privacyScore: 87,
                tags: ["open-source", "encrypted", "cross-platform"],
                rating: 4.6,
                ratingsCount: 1340
            },
            {
                id: 7,
                name: "Mullvad VPN",
                url: "https://mullvad.net",
                description: "VPN service focused on privacy with no logging and anonymous accounts.",
                category: "VPN",
                privacyScore: 89,
                tags: ["no-logs", "wireguard", "anonymous"],
                rating: 4.4,
                ratingsCount: 920
            },
            {
                id: 8,
                name: "LineageOS",
                url: "https://lineageos.org",
                description: "Android-based operating system without Google apps or services.",
                category: "Mobile OS",
                privacyScore: 75,
                tags: ["open-source", "de-googled", "android"],
                rating: 4.1,
                ratingsCount: 680
            },
            {
                id: 9,
                name: "Jitsi Meet",
                url: "https://meet.jit.si",
                description: "Open source video conferencing with end-to-end encryption.",
                category: "Video Conferencing",
                privacyScore: 80,
                tags: ["open-source", "encrypted", "self-hosted"],
                rating: 4.0,
                ratingsCount: 540
            },
            {
                id: 10,
                name: "Standard Notes",
                url: "https://standardnotes.com",
                description: "End-to-end encrypted note-taking app with extended features.",
                category: "Note Taking",
                privacyScore: 84,
                tags: ["encrypted", "open-source", "cross-platform"],
                rating: 4.2,
                ratingsCount: 430
            },
            {
                id: 11,
                name: "LibreOffice",
                url: "https://libreoffice.org",
                description: "Free and open source office suite, a replacement for Microsoft Office.",
                category: "Office Suite",
                privacyScore: 92,
                tags: ["open-source", "offline", "cross-platform"],
                rating: 4.3,
                ratingsCount: 1250
            },
            {
                id: 12,
                name: "Element",
                url: "https://element.io",
                description: "Secure collaboration app with end-to-end encryption via Matrix protocol.",
                category: "Collaboration",
                privacyScore: 78,
                tags: ["encrypted", "open-source", "decentralized"],
                rating: 3.9,
                ratingsCount: 320
            },
            {
                id: 13,
                name: "Firefox Focus",
                url: "https://www.mozilla.org/en-US/firefox/browsers/mobile/focus/",
                description: "Privacy browser with tracking protection and automatic history deletion.",
                category: "Browser",
                privacyScore: 83,
                tags: ["tracker-blocking", "open-source", "mobile"],
                rating: 4.1,
                ratingsCount: 760
            },
            {
                id: 14,
                name: "Tutanota",
                url: "https://tutanota.com",
                description: "Secure email service with built-in encryption and calendar.",
                category: "Email",
                privacyScore: 88,
                tags: ["encrypted", "germany-based", "open-source"],
                rating: 4.2,
                ratingsCount: 590
            },
            {
                id: 15,
                name: "ProtonVPN",
                url: "https://protonvpn.com",
                description: "High-speed Swiss VPN that safeguards your privacy.",
                category: "VPN",
                privacyScore: 86,
                tags: ["no-logs", "swiss-based", "encrypted"],
                rating: 4.3,
                ratingsCount: 870
            },
            {
                id: 16,
                name: "/e/ OS",
                url: "https://e.foundation",
                description: "Android-based mobile OS completely de-googled and privacy-focused.",
                category: "Mobile OS",
                privacyScore: 77,
                tags: ["de-googled", "open-source", "android"],
                rating: 3.8,
                ratingsCount: 310
            },
            {
                id: 17,
                name: "Searx",
                url: "https://searx.me",
                description: "Privacy-respecting, hackable metasearch engine.",
                category: "Search Engine",
                privacyScore: 85,
                tags: ["metasearch", "self-hosted", "open-source"],
                rating: 4.0,
                ratingsCount: 290
            },
            {
                id: 18,
                name: "CryptPad",
                url: "https://cryptpad.fr",
                description: "Collaborative office suite with end-to-end encryption.",
                category: "Collaboration",
                privacyScore: 81,
                tags: ["encrypted", "real-time", "open-source"],
                rating: 3.9,
                ratingsCount: 210
            },
            {
                id: 19,
                name: "KeePassXC",
                url: "https://keepassxc.org",
                description: "Community fork of KeePass, a free and open source password manager.",
                category: "Password Manager",
                privacyScore: 90,
                tags: ["open-source", "offline", "local-storage"],
                rating: 4.4,
                ratingsCount: 690
            },
            {
                id: 20,
                name: "Qubes OS",
                url: "https://qubes-os.org",
                description: "Security-oriented operating system using virtualization for isolation.",
                category: "Desktop OS",
                privacyScore: 95,
                tags: ["security-focused", "virtualization", "open-source"],
                rating: 4.5,
                ratingsCount: 420
            },
            {
                id: 21,
                name: "NewPipe",
                url: "https://newpipe.net",
                description: "Lightweight YouTube client for Android without Google services.",
                category: "Media",
                privacyScore: 79,
                tags: ["youtube-client", "no-google", "open-source"],
                rating: 4.2,
                ratingsCount: 580
            },
            {
                id: 22,
                name: "Joplin",
                url: "https://joplinapp.org",
                description: "Open source note-taking app with end-to-end encryption.",
                category: "Note Taking",
                privacyScore: 82,
                tags: ["encrypted", "open-source", "markdown"],
                rating: 4.1,
                ratingsCount: 470
            }
        ];
    }
    
    function saveToolsToStorage() {
        localStorage.setItem('privacyTools', JSON.stringify(tools));
    }
    
    function setupEventListeners() {
        // Search
        searchInput.addEventListener('input', function() {
            currentSearch = this.value.toLowerCase();
            currentPage = 1;
            filterTools();
        });
        
        // Sort
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            sortTools();
            renderTools();
        });
        
        // Pagination
        prevPageBtn.addEventListener('click', goToPrevPage);
        nextPageBtn.addEventListener('click', goToNextPage);
        
        // Reset filters
        resetFiltersBtn.addEventListener('click', resetFilters);
        
        // Add tool form
        showFormBtn.addEventListener('click', function() {
            addToolForm.classList.toggle('hidden');
            this.textContent = addToolForm.classList.contains('hidden') ? 'Suggest it here' : 'Hide Form';
        });
        
        addToolForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewTool();
        });
        
        // Rating modal
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                ratingModal.classList.add('hidden');
                importModal.classList.add('hidden');
            });
        });
        
        saveRatingBtn.addEventListener('click', saveRating);
        
        // Export/Import
        exportDataBtn.addEventListener('click', exportRatings);
        importDataBtn.addEventListener('click', function() {
            importModal.classList.remove('hidden');
        });
        
        processImportBtn.addEventListener('click', importRatings);
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === ratingModal) {
                ratingModal.classList.add('hidden');
            }
            if (e.target === importModal) {
                importModal.classList.add('hidden');
            }
        });
    }
    
    function renderCategories() {
        // Get all unique categories
        const categories = ['all', ...new Set(tools.map(tool => tool.category))];
        
        categoryList.innerHTML = '';
        categories.forEach(category => {
            const categoryEl = document.createElement('div');
            categoryEl.className = `category-item ${currentCategory === category ? 'active' : ''}`;
            categoryEl.textContent = category === 'all' ? 'All Categories' : category;
            categoryEl.dataset.category = category;
            
            categoryEl.addEventListener('click', function() {
                currentCategory = this.dataset.category;
                currentPage = 1;
                filterTools();
                renderCategories();
                renderTags();
                updateUI();
            });
            
            categoryList.appendChild(categoryEl);
        });
        
        // Update total categories count
        totalCategoriesEl.textContent = categories.length - 1; // Excluding 'all'
    }
    
    function renderTags() {
        // Get all unique tags from filtered tools
        const allTags = [];
        filteredTools.forEach(tool => {
            if (tool.tags && Array.isArray(tool.tags)) {
                allTags.push(...tool.tags);
            }
        });
        
        // Count tag frequency and get unique tags
        const tagCounts = {};
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
        
        const uniqueTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
        
        tagList.innerHTML = '';
        uniqueTags.forEach(tag => {
            const tagEl = document.createElement('div');
            tagEl.className = `tag-item ${currentTags.includes(tag) ? 'active' : ''}`;
            tagEl.textContent = `${tag} (${tagCounts[tag]})`;
            tagEl.dataset.tag = tag;
            
            tagEl.addEventListener('click', function() {
                const tag = this.dataset.tag;
                
                if (currentTags.includes(tag)) {
                    // Remove tag if already selected
                    currentTags = currentTags.filter(t => t !== tag);
                } else {
                    // Add tag
                    currentTags.push(tag);
                }
                
                currentPage = 1;
                filterTools();
                renderTags();
                updateUI();
            });
            
            tagList.appendChild(tagEl);
        });
    }
    
    function filterTools() {
        // Start with all tools
        filteredTools = [...tools];
        
        // Apply search filter
        if (currentSearch) {
            filteredTools = filteredTools.filter(tool => 
                tool.name.toLowerCase().includes(currentSearch) ||
                tool.description.toLowerCase().includes(currentSearch) ||
                tool.category.toLowerCase().includes(currentSearch) ||
                (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(currentSearch)))
            );
        }
        
        // Apply category filter
        if (currentCategory !== 'all') {
            filteredTools = filteredTools.filter(tool => tool.category === currentCategory);
        }
        
        // Apply tag filter
        if (currentTags.length > 0) {
            filteredTools = filteredTools.filter(tool => 
                tool.tags && currentTags.every(tag => tool.tags.includes(tag))
            );
        }
        
        // Apply sorting
        sortTools();
        
        // Update title
        updateTitle();
    }
    
    function sortTools() {
        switch(currentSort) {
            case 'name':
                filteredTools.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'rating':
                filteredTools.sort((a, b) => b.rating - a.rating);
                break;
            case 'privacy':
                filteredTools.sort((a, b) => b.privacyScore - a.privacyScore);
                break;
        }
    }
    
    function updateTitle() {
        let title = 'All Privacy Tools';
        
        if (currentCategory !== 'all') {
            title = `${currentCategory} Tools`;
        }
        
        if (currentTags.length > 0) {
            title = `Tools with tags: ${currentTags.join(', ')}`;
        }
        
        if (currentSearch) {
            title = `Search results for "${currentSearch}"`;
        }
        
        if (filteredTools.length === 0) {
            title = 'No tools found';
        }
        
        toolsTitle.textContent = title;
    }
    
    function renderTools() {
        // Calculate pagination
        const totalPages = Math.ceil(filteredTools.length / toolsPerPage);
        const startIndex = (currentPage - 1) * toolsPerPage;
        const endIndex = startIndex + toolsPerPage;
        const pageTools = filteredTools.slice(startIndex, endIndex);
        
        // Clear current tools
        toolsList.innerHTML = '';
        
        // Render tools for current page
        pageTools.forEach(tool => {
            const toolEl = document.createElement('div');
            toolEl.className = 'tool-item';
            toolEl.dataset.id = tool.id;
            
            // Get user's rating if exists
            const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
            const userRating = userRatings[tool.id] || 0;
            
            // Generate star icons based on rating
            const stars = [];
            for (let i = 1; i <= 5; i++) {
                stars.push(`<i class="fas fa-star ${i <= Math.round(tool.rating) ? 'active' : ''}" data-rating="${i}"></i>`);
            }
            
            // Generate tag elements
            const tagElements = tool.tags ? tool.tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('') : '';
            
            toolEl.innerHTML = `
                <div class="tool-icon">
                    <i class="fas fa-${getIconForCategory(tool.category)}"></i>
                </div>
                <div class="tool-content">
                    <div class="tool-header">
                        <a href="${tool.url}" target="_blank" class="tool-name">${tool.name}</a>
                        <span class="tool-privacy">Privacy: ${tool.privacyScore}/100</span>
                    </div>
                    <p class="tool-description">${tool.description}</p>
                    <div class="tool-meta">
                        <span class="tool-category">${tool.category}</span>
                        <div class="tool-tags">
                            ${tagElements}
                        </div>
                    </div>
                    <div class="rating-container">
                        <div class="rating-stars" data-id="${tool.id}">
                            ${stars.join('')}
                        </div>
                        <span class="rating-text">${tool.rating.toFixed(1)} (${tool.ratingsCount} ratings)</span>
                        <button class="btn btn-small rate-btn" data-id="${tool.id}">Rate</button>
                    </div>
                </div>
            `;
            
            toolsList.appendChild(toolEl);
        });
        
        // Add event listeners for rating stars
        document.querySelectorAll('.rating-stars i').forEach(star => {
            star.addEventListener('click', function() {
                const toolId = parseInt(this.closest('.rating-stars').dataset.id);
                const rating = parseInt(this.dataset.rating);
                openRatingModal(toolId, rating);
            });
        });
        
        // Add event listeners for rate buttons
        document.querySelectorAll('.rate-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const toolId = parseInt(this.dataset.id);
                openRatingModal(toolId);
            });
        });
        
        // Update pagination controls
        updatePagination(totalPages);
        
        // Update page info
        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        
        // Update total tools count
        totalToolsEl.textContent = filteredTools.length;
        
        // Update average rating
        updateAverageRating();
    }
    
    function getIconForCategory(category) {
        const icons = {
            'Browser': 'globe',
            'Email': 'envelope',
            'Messaging': 'comment-alt',
            'Cloud Storage': 'cloud',
            'Search Engine': 'search',
            'Password Manager': 'key',
            'VPN': 'shield-alt',
            'Mobile OS': 'mobile-alt',
            'Video Conferencing': 'video',
            'Note Taking': 'sticky-note',
            'Office Suite': 'file-alt',
            'Collaboration': 'users',
            'Media': 'play-circle',
            'Desktop OS': 'desktop'
        };
        
        return icons[category] || 'toolbox';
    }
    
    function updatePagination(totalPages) {
        // Update button states
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        
        // Generate page numbers
        pageNumbers.innerHTML = '';
        
        // Show up to 5 page numbers
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Adjust if we're near the start
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageNum = document.createElement('div');
            pageNum.className = `page-number ${i === currentPage ? 'active' : ''}`;
            pageNum.textContent = i;
            pageNum.dataset.page = i;
            
            pageNum.addEventListener('click', function() {
                currentPage = parseInt(this.dataset.page);
                renderTools();
            });
            
            pageNumbers.appendChild(pageNum);
        }
    }
    
    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            renderTools();
        }
    }
    
    function goToNextPage() {
        const totalPages = Math.ceil(filteredTools.length / toolsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTools();
        }
    }
    
    function resetFilters() {
        currentCategory = 'all';
        currentTags = [];
        currentSearch = '';
        currentSort = 'name';
        currentPage = 1;
        
        searchInput.value = '';
        sortSelect.value = 'name';
        
        filterTools();
        renderCategories();
        renderTags();
        updateUI();
    }
    
    function updateUI() {
        filterTools();
        renderTools();
        updateAverageRating();
    }
    
    function openRatingModal(toolId, preselectedRating = 0) {
        const tool = tools.find(t => t.id === toolId);
        if (!tool) return;
        
        currentToolForRating = toolId;
        modalToolName.textContent = tool.name;
        
        // Get user's current rating
        const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
        const userRating = userRatings[toolId] || 0;
        
        // Update current rating display
        document.getElementById('current-rating').textContent = userRating > 0 ? `${userRating}/5` : 'Not rated yet';
        
        // Set star states
        const stars = document.querySelectorAll('.rating-stars-large i');
        stars.forEach(star => {
            const ratingValue = parseInt(star.dataset.rating);
            star.classList.toggle('active', ratingValue <= (preselectedRating || userRating));
            
            // Update click handler
            star.onclick = function() {
                const selectedRating = parseInt(this.dataset.rating);
                
                // Update all stars
                stars.forEach(s => {
                    const sRating = parseInt(s.dataset.rating);
                    s.classList.toggle('active', sRating <= selectedRating);
                });
                
                // Update current rating display
                document.getElementById('current-rating').textContent = `${selectedRating}/5`;
                
                // Update preselected rating
                preselectedRating = selectedRating;
            };
        });
        
        // If we have a preselected rating, set it
        if (preselectedRating > 0) {
            stars.forEach(star => {
                const ratingValue = parseInt(star.dataset.rating);
                star.classList.toggle('active', ratingValue <= preselectedRating);
            });
            
            document.getElementById('current-rating').textContent = `${preselectedRating}/5`;
        }
        
        // Show modal
        ratingModal.classList.remove('hidden');
    }
    
    function saveRating() {
        if (!currentToolForRating) return;
        
        const stars = document.querySelectorAll('.rating-stars-large i');
        const activeStars = Array.from(stars).filter(star => star.classList.contains('active'));
        const newRating = activeStars.length;
        
        if (newRating === 0) {
            alert('Please select a rating before saving');
            return;
        }
        
        // Find the tool
        const toolIndex = tools.findIndex(t => t.id === currentToolForRating);
        if (toolIndex === -1) return;
        
        const tool = tools[toolIndex];
        
        // Get existing user ratings
        const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
        const oldUserRating = userRatings[currentToolForRating] || 0;
        
        // Update user rating
        userRatings[currentToolForRating] = newRating;
        localStorage.setItem('userRatings', JSON.stringify(userRatings));
        
        // Update tool's average rating
        // In a real app, this would be calculated on a server
        // For this demo, we'll simulate it by adjusting the average
        if (oldUserRating > 0) {
            // If user had previously rated, adjust the average
            const totalRating = tool.rating * tool.ratingsCount;
            const newTotalRating = totalRating - oldUserRating + newRating;
            tool.rating = newTotalRating / tool.ratingsCount;
        } else {
            // If this is a new rating, add it to the average
            const totalRating = tool.rating * tool.ratingsCount;
            tool.ratingsCount++;
            tool.rating = (totalRating + newRating) / tool.ratingsCount;
        }
        
        // Save updated tools
        saveToolsToStorage();
        
        // Close modal
        ratingModal.classList.add('hidden');
        
        // Update UI
        updateUI();
        
        // Show confirmation
        alert(`Thanks for rating ${tool.name}!`);
    }
    
    function addNewTool() {
        const name = document.getElementById('tool-name').value.trim();
        const url = document.getElementById('tool-url').value.trim();
        const category = document.getElementById('tool-category').value.trim();
        const privacyScore = parseInt(document.getElementById('tool-privacy').value);
        const tags = document.getElementById('tool-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const description = document.getElementById('tool-description').value.trim();
        
        // Validation
        if (!name || !url || !category || !privacyScore) {
            showFormMessage('Please fill in all required fields', 'error');
            return;
        }
        
        if (privacyScore < 55 || privacyScore > 100) {
            showFormMessage('Privacy score must be between 55 and 100', 'error');
            return;
        }
        
        // Create new tool
        const newTool = {
            id: Date.now(), // Simple ID generation
            name,
            url,
            description: description || `${name} - A privacy-focused tool.`,
            category,
            privacyScore,
            tags: tags.length > 0 ? tags : ['privacy', 'security'],
            rating: 4.0, // Default rating
            ratingsCount: 0
        };
        
        // Add to tools array
        tools.push(newTool);
        
        // Save to storage
        saveToolsToStorage();
        
        // Reset form
        addToolForm.reset();
        addToolForm.classList.add('hidden');
        showFormBtn.textContent = 'Suggest it here';
        
        // Show success message
        showFormMessage(`${name} has been added successfully!`, 'success');
        
        // Update UI
        resetFilters();
    }
    
    function showFormMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = type;
        formMessage.classList.remove('hidden');
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
    }
    
    function updateAverageRating() {
        if (filteredTools.length === 0) {
            averageRatingEl.textContent = '0.0';
            return;
        }
        
        const totalRating = filteredTools.reduce((sum, tool) => sum + tool.rating, 0);
        const avgRating = totalRating / filteredTools.length;
        averageRatingEl.textContent = avgRating.toFixed(1);
    }
    
    function exportRatings() {
        const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
        
        if (Object.keys(userRatings).length === 0) {
            alert('You haven\'t rated any tools yet!');
            return;
        }
        
        // Create export data
        const exportData = {
            exportedAt: new Date().toISOString(),
            ratings: userRatings
        };
        
        // Create download link
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `privacy-tools-ratings-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        alert('Your ratings have been exported!');
    }
    
    function importRatings() {
        const importText = document.getElementById('import-data-text').value.trim();
        
        if (!importText) {
            alert('Please paste your ratings data');
            return;
        }
        
        try {
            const importData = JSON.parse(importText);
            
            if (!importData.ratings || typeof importData.ratings !== 'object') {
                throw new Error('Invalid ratings data format');
            }
            
            // Merge with existing ratings
            const existingRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
            const mergedRatings = { ...existingRatings, ...importData.ratings };
            
            // Save merged ratings
            localStorage.setItem('userRatings', JSON.stringify(mergedRatings));
            
            // Update tools with new ratings
            Object.keys(importData.ratings).forEach(toolId => {
                const rating = importData.ratings[toolId];
                const toolIndex = tools.findIndex(t => t.id === parseInt(toolId));
                
                if (toolIndex !== -1 && rating >= 1 && rating <= 5) {
                    // In a real app, we would update the average rating calculation
                    // For this demo, we'll just update the user's rating
                }
            });
            
            // Save tools
            saveToolsToStorage();
            
            // Close modal and reset
            importModal.classList.add('hidden');
            document.getElementById('import-data-text').value = '';
            
            // Update UI
            updateUI();
            
            alert(`Successfully imported ${Object.keys(importData.ratings).length} ratings!`);
            
        } catch (error) {
            alert('Error importing ratings: ' + error.message);
        }
    }
});
