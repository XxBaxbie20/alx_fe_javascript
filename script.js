// Load quotes from localStorage or use defaults
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Do not take life too seriously. You will never get out of it alive.", category: "Humor" }
];

// DOM references
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const categoryFilter = document.getElementById('categoryFilter');
const syncBtn = document.getElementById('syncBtn'); // Manual sync button

// Load last displayed quote from sessionStorage
let lastQuoteIndex = sessionStorage.getItem('lastQuoteIndex');
if (lastQuoteIndex !== null) {
    const lastQuote = quotes[lastQuoteIndex];
    if (lastQuote) {
        quoteDisplay.textContent = `"${lastQuote.text}" — ${lastQuote.category}`;
    }
}

// Save quotes array to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate categories dynamically
function populateCategories() {
    const categories = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    // Restore last selected category
    const lastFilter = localStorage.getItem('lastCategoryFilter');
    if (lastFilter && (lastFilter === 'all' || categories.includes(lastFilter))) {
        categoryFilter.value = lastFilter;
    }
}

// Show a random quote respecting the filter
function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    let filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available in this category!";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
    sessionStorage.setItem('lastQuoteIndex', quotes.indexOf(quote));
}

// Filter quotes when category changes
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('lastCategoryFilter', selectedCategory);

    let filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available in this category!";
    } else {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const quote = filteredQuotes[randomIndex];
        quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
        sessionStorage.setItem('lastQuoteIndex', quotes.indexOf(quote));
    }
}

// Add a new quote dynamically
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (text === "" || category === "") {
        alert("Please enter both a quote and a category.");
        return;
    }

    quotes.push({ text, category });
    saveQuotes();

    newQuoteText.value = "";
    newQuoteCategory.value = "";

    // Refresh categories and auto-select new one
    populateCategories();
    categoryFilter.value = category;
    localStorage.setItem('lastCategoryFilter', category);

    quoteDisplay.textContent = `"${text}" — ${category}`;
}

// Export quotes as JSON file
function exportQuotes() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (!Array.isArray(importedQuotes)) throw new Error('Invalid JSON format');
            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories();
            alert('Quotes imported successfully!');
        } catch (error) {
            alert('Failed to import quotes: ' + error.message);
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Fetch quotes from mock server (JSONPlaceholder)
async function fetchServerQuotes() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await response.json();

        return data.map(item => ({
            text: item.title,
            category: item.body || 'General'
        }));
    } catch (error) {
        console.error('Failed to fetch server quotes:', error);
        return [];
    }
}

// Sync local quotes with server
async function syncWithServer() {
    const serverQuotes = await fetchServerQuotes();

    let localChanged = false;

    serverQuotes.forEach(serverQuote => {
        const existsLocally = quotes.some(q => q.text === serverQuote.text && q.category === serverQuote.category);
        if (!existsLocally) {
            quotes.push(serverQuote);
            localChanged = true;
        }
    });

    if (localChanged) {
        saveQuotes();
        populateCategories();
        alert('Local quotes updated with new data from server!');
    }
}

// Periodic sync every 30 seconds
setInterval(syncWithServer, 30000);

// Event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
exportBtn.addEventListener('click', exportQuotes);
importFile.addEventListener('change', importFromJsonFile);
categoryFilter.addEventListener('change', filterQuotes);
if (syncBtn) syncBtn.addEventListener('click', syncWithServer);

// Populate categories on page load
populateCategories();
