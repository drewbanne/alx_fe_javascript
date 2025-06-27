// script.js

// Initial array of quote objects. This will be used only if local storage is empty.
const defaultQuotes = [
  { text: "The only way to do great work is to love what you do.", category: "Work" },
  { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
  { text: "The mind is everything. What you think you become.", category: "Mindfulness" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
  { text: "It is during our darkest moments that we must focus to see the light.", category: "Inspiration" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Life" },
  { text: "The way to get started is to quit talking and begin doing.", category: "Action" },
  { text: "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough.", category: "Gratitude" }
];

// Global array to store quotes. This will be loaded from local storage.
let quotes = [];
// Global variable to keep track of the currently selected filter category
let currentFilterCategory = 'all';

// Get DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const addQuoteFormContainer = document.getElementById('addQuoteFormContainer');
const exportQuotesButton = document.getElementById('exportQuotes');
const lastViewedQuoteSpan = document.getElementById('lastViewedQuote');
const categoryFilterDropdown = document.getElementById('categoryFilter'); // New: Get the filter dropdown

/**
 * Saves the current 'quotes' array to local storage.
 * The array is stringified to JSON format before saving.
 */
function saveQuotes() {
  try {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    console.log("Quotes saved to local storage.");
  } catch (e) {
    console.error("Error saving quotes to local storage:", e);
    alert("Error saving quotes. Your browser may be in private mode or storage is full.");
  }
}

/**
 * Loads quotes from local storage when the application initializes.
 * If no quotes are found, it uses the defaultQuotes array.
 */
function loadQuotes() {
  try {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
      quotes = JSON.parse(storedQuotes);
      console.log("Quotes loaded from local storage.");
    } else {
      quotes = [...defaultQuotes]; // Use default quotes if nothing in local storage
      saveQuotes(); // Save defaults to local storage for future sessions
      console.log("No quotes in local storage. Loaded default quotes.");
    }

    // Load last selected filter category from local storage
    const storedFilter = localStorage.getItem('lastSelectedCategory');
    if (storedFilter) {
      currentFilterCategory = storedFilter;
      console.log(`Last selected filter loaded: ${currentFilterCategory}`);
    }

  } catch (e) {
    console.error("Error loading quotes or filter from local storage:", e);
    alert("Error loading data. Using default quotes and 'all' category.");
    quotes = [...defaultQuotes]; // Fallback to default quotes on error
    currentFilterCategory = 'all'; // Fallback to 'all' category on error
  }
}

/**
 * Populates the category filter dropdown with unique categories from the quotes array.
 * (Task 2: Populate Categories Dynamically)
 */
function populateCategories() {
  // Clear existing options, keeping only the "All Categories" option
  categoryFilterDropdown.innerHTML = '<option value="all">All Categories</option>';

  const uniqueCategories = new Set();
  quotes.forEach(quote => {
    if (quote.category) {
      uniqueCategories.add(quote.category);
    }
  });

  // Add unique categories to the dropdown
  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilterDropdown.appendChild(option);
  });

  // Set the dropdown to the currently selected filter category
  categoryFilterDropdown.value = currentFilterCategory;
}

/**
 * Filters and displays a random quote based on the selected category.
 * (Task 2: Filter Quotes Based on Selected Category & Remember Last Selected Filter)
 */
function filterQuotes() {
  currentFilterCategory = categoryFilterDropdown.value;
  localStorage.setItem('lastSelectedCategory', currentFilterCategory); // Save selected filter

  showRandomQuote(); // Call showRandomQuote which will now use the filtered list
}


/**
 * Displays a random quote from the 'quotes' array, respecting the current filter category.
 * Also stores the displayed quote's text in session storage.
 */
function showRandomQuote() {
  let quotesToDisplay = quotes;

  // Apply filter if a specific category is selected
  if (currentFilterCategory !== 'all') {
    quotesToDisplay = quotes.filter(quote => quote.category === currentFilterCategory);
  }

  if (quotesToDisplay.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available for "${currentFilterCategory}". Add some new quotes!</p>`;
    lastViewedQuoteSpan.textContent = "N/A";
    sessionStorage.removeItem('lastViewedQuote'); // Clear session storage if no quotes
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotesToDisplay.length);
  const randomQuote = quotesToDisplay[randomIndex];

  quoteDisplay.innerHTML = `
    <p class="text-2xl font-medium">"${randomQuote.text}"</p>
    <p class="text-lg text-gray-600 mt-2"><em>- ${randomQuote.category}</em></p>
  `;

  // Store the last viewed quote in session storage
  try {
    sessionStorage.setItem('lastViewedQuote', randomQuote.text);
    lastViewedQuoteSpan.textContent = randomQuote.text;
    console.log("Last viewed quote saved to session storage.");
  } catch (e) {
    console.error("Error saving last viewed quote to session storage:", e);
  }
}

/**
 * Creates and appends the "Add New Quote" form to the DOM.
 */
function createAddQuoteForm() {
  const formDiv = document.createElement('div');
  formDiv.className = "mb-6"; // Tailwind class for margin-bottom
  formDiv.innerHTML = `
    <h2 class="text-2xl font-semibold mb-4 text-gray-800">Add New Quote</h2>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" class="block w-full p-2 mb-3 border rounded-md" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" class="block w-full p-2 mb-4 border rounded-md" />
    <button id="addQuoteBtn" class="w-full">Add Quote</button>
  `;
  addQuoteFormContainer.appendChild(formDiv);

  // Attach event listener to the "Add Quote" button AFTER it's in the DOM
  document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
}

/**
 * Adds a new quote to the 'quotes' array from user input and updates the DOM.
 * Also saves the updated quotes array to local storage and updates categories.
 * (Task 3: Update Web Storage with Category Data)
 */
function addQuote() {
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

  const newQuoteText = newQuoteTextInput.value.trim();
  const newQuoteCategory = newQuoteCategoryInput.value.trim();

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes(); // Save to local storage after adding
    populateCategories(); // Update categories dropdown in case a new category was added
    
    // Clear the input fields
    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';
    
    // Show a new random quote, potentially from the newly added one or updated filter
    showRandomQuote(); 
    alert("Quote added successfully!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

/**
 * Exports the current 'quotes' array as a JSON file.
 */
function exportQuotes() {
  if (quotes.length === 0) {
    alert("No quotes to export!");
    return;
  }
  const dataStr = JSON.stringify(quotes, null, 2); // null, 2 for pretty printing
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json'; // Name of the downloaded file
  document.body.appendChild(a); // Append to body to make it clickable
  a.click(); // Programmatically click the link to trigger download
  document.body.removeChild(a); // Clean up the temporary link
  URL.revokeObjectURL(url); // Release the object URL
  alert("Quotes exported as quotes.json!");
}

/**
 * Imports quotes from a selected JSON file.
 */
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) {
    alert("No file selected.");
    return;
  }

  // Validate file type
  if (file.type !== "application/json") {
    alert("Invalid file type. Please select a JSON file.");
    event.target.value = ''; // Clear the input
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes)) {
          throw new Error("JSON is not an array. Please provide a JSON array of quotes.");
      }
      // Optional: Basic validation for quote structure
      const validQuotes = importedQuotes.filter(q => q.text && q.category);
      if (validQuotes.length === 0 && importedQuotes.length > 0) {
          alert("Imported JSON file contains no valid quotes (each quote needs 'text' and 'category').");
          return;
      }
      if (validQuotes.length < importedQuotes.length) {
          alert(`Warning: Some quotes in the JSON file were skipped due to missing 'text' or 'category' fields.`);
      }

      quotes.push(...validQuotes); // Add new quotes to the existing array
      saveQuotes(); // Save updated array to local storage
      populateCategories(); // Update categories dropdown with potentially new categories
      showRandomQuote(); // Update display with potentially new quotes
      alert('Quotes imported successfully!');
    } catch (e) {
      console.error("Error importing quotes from JSON:", e);
      alert('Error importing quotes. Please ensure the file is a valid JSON array of objects with "text" and "category" properties.');
    } finally {
        event.target.value = ''; // Clear the file input for security and re-selection
    }
  };
  fileReader.onerror = function() {
    alert('Error reading file.');
    console.error("FileReader error:", fileReader.error);
    event.target.value = '';
  };
  fileReader.readAsText(file);
}

// Event Listeners
newQuoteButton.addEventListener('click', showRandomQuote);
exportQuotesButton.addEventListener('click', exportQuotes);

// Initial actions when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes(); // Load quotes and last filter from local storage
  populateCategories(); // Populate the category dropdown
  categoryFilterDropdown.value = currentFilterCategory; // Set initial filter dropdown value
  showRandomQuote(); // Display an initial random quote, respecting the loaded filter

  // Load and display last viewed quote from session storage on page load
  const lastViewed = sessionStorage.getItem('lastViewedQuote');
  if (lastViewed) {
    lastViewedQuoteSpan.textContent = lastViewed;
  } else {
    lastViewedQuoteSpan.textContent = "N/A";
  }
});
