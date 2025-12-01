// Tool data - will be loaded from JSON
let tools = [];

// Current state
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'name';
let activeTags = new Set();

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

// Default fallback tools (in case JSON fails to load)
const defaultTools = [
    {
        id: 1,
        name: "Signal",
        url: "https://signal.org",
        description: "Private messaging app with end-to-end encryption. Open source and nonprofit.",
        category: "messaging",
        openSource: true,
        decentralized: false,
        privacyLevel: "high",
        tags: ["encrypted", "nonprofit", "mobile", "desktop"]
    },
    {
        id: 2,
        name: "Element",
        url: "https://element.io",
        description: "Secure collaboration and messaging app powered by Matrix protocol.",
        category: "messaging",
        openSource: true,
        decentralized: true,
        privacyLevel: "high",
        tags: ["encrypted", "self-hosted", "matrix", "team-chat"]
    },
    {
        id: 3,
        name: "Mozilla Firefox",
        url: "https://www.mozilla.org/firefox/",
        description: "Privacy-focused web browser from Mozilla. Open source with strong tracking protection.",
        category: "browser",
        openSource: true,
        decentralized: false,
        privacyLevel: "high",
        tags: ["tracking-protection", "extensions", "cross-platform"]
    },
    {
        id: 4,
        name: "Brave Browser",
        url: "https://brave.com",
        description: "Privacy browser that blocks ads and trackers by default. Built on Chromium.",
        category: "browser",
        openSource: true,
        decentralized: false,
        privacyLevel: "high",
        tags: ["ad-blocker", "chromium", "crypto", "rewards"]
    },
    {
        id: 5,
        name: "DuckDuckGo",
        url: "https://duckduckgo.com",
        description: "Privacy-focused search engine that doesn't track your searches.",
        category: "search",
        openSource: false,
        decentralized: false,
        privacyLevel: "high",
        tags: ["search", "no-tracking", "browser-extension"]
    }
];

// Load tools from JSON file
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

// Get privacy level label
function getPrivacyLabel(level) {
    const labels = {
        high: 'High',
        medium: 'Medium',
        low: 'Low'
    };
    return labels[level] || level;
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

// Render tools to the page
function renderTools() {
    const filteredTools = getFilteredTools();
    
    if (filteredTools.length === 0) {
        toolsContainer.innerHTML = `
            <div class="no-results">
                <p>No tools found matching your criteria.</p>
                <p>Try a different search term, category, or clear tag filters.</p>
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

// Show recent tools in sidebar
function showRecentTools() {
    const recentContainer = document.getElementById('recent-tools');
    const recentTools = [...tools]
        .sort((a, b) => b.id - a.id) // Sort by ID descending (newest first)
        .slice(0, 5); // Show 5 most recent
    
    if (recentTools.length === 0) {
        recentContainer.innerHTML = '<div style="color: #888; font-size: 13px;">No tools yet</div>';
        return;
    }
    
    recentContainer.innerHTML = recentTools.map(tool => `
        <div class="recent-tool">
            <a href="${tool.url}" target="_blank">${tool.name}</a>
            <div class="recent-tool-category">${getCategoryLabel(tool.category)}</div>
        </div>
    `).join('');
}

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleString();
    document.getElementById('update-time').textContent = timeString;
}

// Perform search
function performSearch() {
    currentSearch = searchInput.value.toLowerCase().trim();
    renderTools();
}

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
    
    // Tag filter buttons
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
            
            renderTools();
        });
    });
    
    // Clear tags button
    document.getElementById('clear-tags').addEventListener('click', function() {
        activeTags.clear();
        document.querySelectorAll('.tag-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        renderTools();
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Setup event listeners
    setupEventListeners();
    
    // Load tools from JSON file
    loadToolsFromJSON();
    
    // Update timestamp
    updateTimestamp();
    
    // Auto-refresh tools every 30 minutes
    setInterval(() => {
        loadToolsFromJSON();
        updateTimestamp();
    }, 30 * 60 * 1000);
});
