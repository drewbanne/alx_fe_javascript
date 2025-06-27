// script.js

// Initial array of quote objects
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Work" },
  { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
  { text: "The mind is everything. What you think you become.", category: "Mindfulness" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
  { text: "It is during our darkest moments that we must focus to see the light.", category: "Inspiration" }
];

// Get DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const addQuoteFormContainer = document.getElementById('addQuoteFormContainer');

/**
 * Displays a random quote from the 'quotes' array.
 */
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Add some new quotes!</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <p><em>- ${randomQuote.category}</em></p>
  `;
}

/**
 * Creates and appends the "Add New Quote" form to the DOM.
 * This function is called once to set up the form.
 */
function createAddQuoteForm() {
  const formDiv = document.createElement('div');
  formDiv.innerHTML = `
    <h2>Add New Quote</h2>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;
  addQuoteFormContainer.appendChild(formDiv);

  // Attach event listener to the "Add Quote" button AFTER it's in the DOM
  document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
}

/**
 * Adds a new quote to the 'quotes' array from user input and updates the DOM.
 */
function addQuote() {
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

  const newQuoteText = newQuoteTextInput.value.trim();
  const newQuoteCategory = newQuoteCategoryInput.value.trim();

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    // Clear the input fields
    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';
    // Optionally, show the newly added quote or a confirmation message
    showRandomQuote(); // Show a new random quote, potentially including the one just added
    alert("Quote added successfully!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Event Listeners
newQuoteButton.addEventListener('click', showRandomQuote);

// Initial actions when the page loads
document.addEventListener('DOMContentLoaded', () => {
  showRandomQuote(); // Display an initial random quote
  createAddQuoteForm(); // Create and display the add quote form
});