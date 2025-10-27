// Load quotes from localStorage if available, otherwise use defaults
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Do not take life too seriously. You will never get out of it alive.", category: "Humor" }
];

// Get references to DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');

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

// Show a random quote and save last index to sessionStorage
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.textContent = "No quotes available!";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
    sessionStorage.setItem('lastQuoteIndex', randomIndex);
}

// Add a new quote dynamically and save to localStorage
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

    quoteDisplay.textContent = `"${text}" — ${category}`;
}

// Export quotes to JSON file
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
            alert('Quotes imported successfully!');
        } catch (error) {
            alert('Failed to import quotes: ' + error.message);
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
exportBtn.addEventListener('click', exportQuotes);
importFile.addEventListener('change', importFromJsonFile);
