// Add to top of script.js (with other variables)
let currentPage = 1;
const itemsPerPage = 20; // Show 20 tools per page

// Update getFilteredTools function to handle pagination
function getFilteredTools() {
    let filtered = [...tools];
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(tool => tool.category === currentCategory);
    }
    
    // Filter by search term
    if (currentSearch) {
        filtered = filtered.filter(tool => 
            tool.name.toLowerCase().includes(currentSearch) ||
            tool.description.toLowerCase().includes(currentSearch) ||
            tool.category.toLowerCase().includes(currentSearch) ||
            (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(currentSearch)))
        );
    }
    
    // Filter by active tags
    if (activeTags.size > 0) {
        filtered = filtered.filter(tool => {
            if (!tool.tags) return false;
            for (const tag of activeTags) {
                if (!tool.tags.includes(tag)) {
                    return false;
                }
            }
            return true;
        });
    }
    
    // Sort tools
    filtered.sort((a, b) => {
        switch(currentSort) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'category':
                return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
            case 'privacy':
                const privacyOrder = { high: 3, medium: 2, low: 1 };
                return privacyOrder[b.privacyLevel] - privacyOrder[a.privacyLevel] || a.name.localeCompare(b.name);
            case 'newest':
                return b.id - a.id;
            default:
                return a.name.localeCompare(b.name);
        }
    });
    
    return filtered;
}

// Update renderTools function to include pagination
function renderTools() {
    const filteredTools = getFilteredTools();
    const totalPages = Math.ceil(filteredTools.length / itemsPerPage);
    
    // Reset to page 1 if current page is invalid
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = 1;
    }
    
    // Get tools for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const toolsToDisplay = filteredTools.slice(startIndex, endIndex);
    
    // Show no results message
    if (filteredTools.length === 0) {
        toolsContainer.innerHTML = `
            <div class="no-results">
                <p>No tools found matching your criteria.</p>
                <p>Try a different search term, category, or clear tag filters.</p>
            </div>
        `;
        // Hide pagination
        document.getElementById('pagination').style.display = 'none';
        return;
    }
    
    // Render tools
    toolsContainer.innerHTML = toolsToDisplay.map(tool => `
        <div class="tool-item">
            <div class="tool-header">
                <a href="${tool.url}" target="_blank" class="tool-title">${tool.name}</a>
                <span class="tool-category">${getCategoryLabel(tool.category)}</span>
            </div>
            <p class="tool-description">${tool.description}</p>
            <div class="tool-meta">
                ${tool.openSource ? '<span class="meta-item"><span class="meta-icon open-source">✓</span> Open Source</span>' : ''}
                ${tool.decentralized ? '<span class="meta-item"><span class="meta-icon decentralized">⚡</span> Decentralized</span>' : ''}
                <span class="meta-item">
                    <span class="meta-icon privacy-${tool.privacyLevel}">🛡️</span>
                    Privacy: ${getPrivacyLabel(tool.privacyLevel)}
                </span>
            </div>
            ${tool.tags && tool.tags.length > 0 ? `
                <div class="tool-tags">
                    ${tool.tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
    
    // Update pagination
    updatePagination(filteredTools.length, totalPages);
}

// Add pagination controls
function updatePagination(totalItems, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) {
        // Create pagination if it doesn't exist
        const paginationHTML = `
            <div class="pagination" id="pagination">
                <button id="prev-page" disabled>Previous</button>
                <span class="pagination-info" id="page-info">Page 1 of ${totalPages}</span>
                <button id="next-page">Next</button>
            </div>
        `;
        toolsContainer.insertAdjacentHTML('afterend', paginationHTML);
    } else {
        paginationContainer.innerHTML = `
            <button id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
            <span class="pagination-info" id="page-info">Page ${currentPage} of ${totalPages} (${totalItems} tools)</span>
            <button id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
        `;
        paginationContainer.style.display = 'flex';
    }
    
    // Add event listeners
    document.getElementById('prev-page')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTools();
            window.scrollTo({ top: toolsContainer.offsetTop - 100, behavior: 'smooth' });
        }
    });
    
    document.getElementById('next-page')?.addEventListener('click', () => {
        const totalPages = Math.ceil(getFilteredTools().length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTools();
            window.scrollTo({ top: toolsContainer.offsetTop - 100, behavior: 'smooth' });
        }
    });
}

// Update setupEventListeners to reset page on filters
function setupEventListeners() {
    // ... existing code ...
    
    // Add reset page on filter changes
    const resetPage = () => {
        currentPage = 1;
        renderTools();
    };
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            resetPage();
        });
    });
    
    searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value.toLowerCase().trim();
        resetPage();
    });
    
    sortSelect.addEventListener('change', function() {
        currentSort = this.value;
        resetPage();
    });
    
    document.querySelectorAll('.tag-filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tag = this.dataset.tag;
            if (activeTags.has(tag)) {
                activeTags.delete(tag);
                this.classList.remove('active');
            } else {
                activeTags.add(tag);
                this.classList.add('active');
            }
            resetPage();
        });
    });
    
    document.getElementById('clear-tags')?.addEventListener('click', function() {
        activeTags.clear();
        document.querySelectorAll('.tag-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        resetPage();
    });
}

// Update loadToolsFromJSON to include initial pagination
async function loadToolsFromJSON() {
    try {
        const response = await fetch('data/apps.json');
        const data = await response.json();
        tools = data.tools;
        console.log(`Loaded ${tools.length} tools from JSON`);
        renderTools();
        updateStats();
        showRecentTools();
    } catch (error) {
        console.error('Failed to load tools from JSON:', error);
        console.log('Using fallback tools');
        tools = defaultTools;
        renderTools();
        updateStats();
        showRecentTools();
    }
}
// Tool data - can be moved to separate JSON file
const tools = [
    {
        id: 1,
        name: "Signal",
        url: "https://signal.org",
        description: "Private messaging app with end-to-end encryption. Open source and nonprofit.",
        category: "messaging",
        openSource: true,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 2,
        name: "Element",
        url: "https://element.io",
        description: "Secure collaboration and messaging app powered by Matrix protocol.",
        category: "messaging",
        openSource: true,
        decentralized: true,
        privacyLevel: "high"
    },
    {
        id: 3,
        name: "Firefox",
        url: "https://www.mozilla.org/firefox/",
        description: "Privacy-focused web browser from Mozilla. Open source with strong tracking protection.",
        category: "browser",
        openSource: true,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 4,
        name: "Brave",
        url: "https://brave.com",
        description: "Privacy browser that blocks ads and trackers by default.",
        category: "browser",
        openSource: true,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 5,
        name: "DuckDuckGo",
        url: "https://duckduckgo.com",
        description: "Privacy-focused search engine that doesn't track your searches.",
        category: "search",
        openSource: false,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 6,
        name: "Startpage",
        url: "https://www.startpage.com",
        description: "Private search engine that shows Google results without tracking.",
        category: "search",
        openSource: false,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 7,
        name: "ProtonMail",
        url: "https://protonmail.com",
        description: "Secure email service with end-to-end encryption based in Switzerland.",
        category: "email",
        openSource: true,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 8,
        name: "Tutanota",
        url: "https://tutanota.com",
        description: "Encrypted email service that's open source and ad-free.",
        category: "email",
        openSource: true,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 9,
        name: "Nextcloud",
        url: "https://nextcloud.com",
        description: "Self-hosted productivity platform with file sync, calendar, contacts, and more.",
        category: "storage",
        openSource: true,
        decentralized: true,
        privacyLevel: "high"
    },
    {
        id: 10,
        name: "Proton Drive",
        url: "https://proton.me/drive",
        description: "End-to-end encrypted cloud storage from Proton.",
        category: "storage",
        openSource: false,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 11,
        name: "Mullvad VPN",
        url: "https://mullvad.net",
        description: "VPN service focused on privacy with anonymous accounts.",
        category: "vpn",
        openSource: true,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 12,
        name: "IVPN",
        url: "https://ivpn.net",
        description: "Privacy-first VPN service with strong no-logs policy.",
        category: "vpn",
        openSource: false,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 13,
        name: "Mastodon",
        url: "https://joinmastodon.org",
        description: "Decentralized social network running on the Fediverse.",
        category: "social",
        openSource: true,
        decentralized: true,
        privacyLevel: "high"
    },
    {
        id: 14,
        name: "Pixelfed",
        url: "https://pixelfed.org",
        description: "Decentralized image sharing platform (like Instagram).",
        category: "social",
        openSource: true,
        decentralized: true,
        privacyLevel: "high"
    },
    {
        id: 15,
        name: "/e/ OS",
        url: "https://e.foundation",
        description: "Privacy-focused mobile OS based on Android, de-Googled.",
        category: "os",
        openSource: true,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 16,
        name: "LineageOS",
        url: "https://lineageos.org",
        description: "Open source Android distribution for phones and tablets.",
        category: "os",
        openSource: true,
        decentralized: false,
        privacyLevel: "medium"
    },
    {
        id: 17,
        name: "Standard Notes",
        url: "https://standardnotes.com",
        description: "End-to-end encrypted note-taking app with extensions.",
        category: "productivity",
        openSource: true,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 18,
        name: "Jitsi",
        url: "https://jitsi.org",
        description: "Secure, open source video conferencing platform.",
        category: "productivity",
        openSource: true,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 19,
        name: "Bitwarden",
        url: "https://bitwarden.com",
        description: "Open source password manager with end-to-end encryption.",
        category: "productivity",
        openSource: true,
        decentralized: false,
        privacyLevel: "high"
    },
    {
        id: 20,
        name: "LibreOffice",
        url: "https://www.libreoffice.org",
        description: "Free and open source office suite, alternative to Microsoft Office.",
        category: "productivity",
        openSource: true,
        decentralized: false,
        privacyLevel: "high"
    }
];

// DOM elements
const toolsContainer = document.getElementById('tools-container');
const categoryButtons = document.querySelectorAll('.category-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const sortSelect = document.getElementById('sort-select');
const statsElements = {
    total: document.getElementById('total-tools'),
    openSource: document.getElementById('open-source-count'),
    decentralized: document.getElementById('decentralized-count')
};

// Current state
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'name';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Display tools
    renderTools();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update stats
    updateStats();
});

// Setup event listeners
function setupEventListeners() {
    // Category filter buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update category and re-render
            currentCategory = this.dataset.category;
            renderTools();
        });
    });
    
    // Search
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    // Sort
    sortSelect.addEventListener('change', function() {
        currentSort = this.value;
        renderTools();
    });
}

// Perform search
function performSearch() {
    currentSearch = searchInput.value.toLowerCase().trim();
    renderTools();
}

// Filter tools based on current state
function getFilteredTools() {
    let filtered = [...tools];
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(tool => tool.category === currentCategory);
    }
    
    // Filter by search term
    if (currentSearch) {
        filtered = filtered.filter(tool => 
            tool.name.toLowerCase().includes(currentSearch) ||
            tool.description.toLowerCase().includes(currentSearch) ||
            tool.category.toLowerCase().includes(currentSearch)
        );
    }
    
    // Sort tools
    filtered.sort((a, b) => {
        switch(currentSort) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'category':
                return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
            case 'privacy':
                const privacyOrder = { high: 3, medium: 2, low: 1 };
                return privacyOrder[b.privacyLevel] - privacyOrder[a.privacyLevel] || a.name.localeCompare(b.name);
            default:
                return a.name.localeCompare(b.name);
        }
    });
    
    return filtered;
}

// Render tools to the page
function renderTools() {
    const filteredTools = getFilteredTools();
    
    if (filteredTools.length === 0) {
        toolsContainer.innerHTML = `
            <div class="no-results">
                <p>No tools found matching your criteria.</p>
                <p>Try a different search term or category.</p>
            </div>
        `;
        return;
    }
    
    toolsContainer.innerHTML = filteredTools.map(tool => `
        <div class="tool-item">
            <div class="tool-header">
                <a href="${tool.url}" target="_blank" class="tool-title">${tool.name}</a>
                <span class="tool-category">${getCategoryLabel(tool.category)}</span>
            </div>
            <p class="tool-description">${tool.description}</p>
            <div class="tool-meta">
                ${tool.openSource ? '<span class="meta-item"><span class="meta-icon open-source">✓</span> Open Source</span>' : ''}
                ${tool.decentralized ? '<span class="meta-item"><span class="meta-icon decentralized">⚡</span> Decentralized</span>' : ''}
                <span class="meta-item">
                    <span class="meta-icon privacy-${tool.privacyLevel}">🛡️</span>
                    Privacy: ${tool.privacyLevel === 'high' ? 'High' : tool.privacyLevel === 'medium' ? 'Medium' : 'Low'}
                </span>
            </div>
        </div>
    `).join('');
}

// Get human-readable category label
function getCategoryLabel(category) {
    const labels = {
        messaging: 'Messaging',
        browser: 'Browser',
        search: 'Search Engine',
        storage: 'Cloud Storage',
        os: 'Operating System',
        social: 'Social Media',
        productivity: 'Productivity',
        vpn: 'VPN',
        email: 'Email'
    };
    return labels[category] || category;
}

// Update statistics
function updateStats() {
    const total = tools.length;
    const openSourceCount = tools.filter(tool => tool.openSource).length;
    const decentralizedCount = tools.filter(tool => tool.decentralized).length;
    
    statsElements.total.textContent = total;
    statsElements.openSource.textContent = openSourceCount;
    statsElements.decentralized.textContent = decentralizedCount;
}

// Add some CSS for no-results
const style = document.createElement('style');
style.textContent = `
    .no-results {
        text-align: center;
        padding: 60px 20px;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 3px;
    }
    
    .no-results p {
        margin-bottom: 10px;
        color: #666;
    }
    
    .no-results p:first-child {
        font-size: 16px;
        color: #333;
    }
`;
document.head.appendChild(style);
