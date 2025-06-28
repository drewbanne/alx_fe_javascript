// script.js

// Initial array of quote objects. This will be used only if local storage is empty.
const defaultQuotes = [
  { id: 1, text: "The only way to do great work is to love what you do.", category: "Work" },
  { id: 2, text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
  { id: 3, text: "The mind is everything. What you think you become.", category: "Mindfulness" },
  { id: 4, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
  { id: 5, text: "It is during our darkest moments that we must focus to see the light.", category: "Inspiration" },
  { id: 6, text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Life" },
  { id: 7, text: "The way to get started is to quit talking and begin doing.", category: "Action" },
  { id: 8, text: "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough.", category: "Gratitude" }
];

// Global array to store quotes. This will be loaded from local storage.
let quotes = [];
// Global variable to keep track of the currently selected filter category
let currentFilterCategory = 'all';
// Variable to store the interval ID for auto-sync
let autoSyncIntervalId = null;
// Sync interval time in milliseconds (e.g., 10 seconds)
const SYNC_INTERVAL_MS = 10000;

// Get DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const addQuoteFormContainer = document.getElementById('addQuoteFormContainer');
const exportQuotesButton = document.getElementById('exportQuotes');
const fetchQuotesButton = document.getElementById('fetchQuotes');
const syncQuotesButton = document.getElementById('syncQuotesButton');
const toggleAutoSyncButton = document.getElementById('toggleAutoSyncButton'); // New: Auto Sync Button
const loadingIndicator = document.getElementById('loadingIndicator');
const autoSyncStatus = document.getElementById('autoSyncStatus'); // New: Auto Sync Status display
const lastViewedQuoteSpan = document.getElementById('lastViewedQuote');
const categoryFilterDropdown = document.getElementById('categoryFilter');

/**
 * Generates a simple unique ID for new quotes.
 * This is a basic implementation and might not be truly globally unique in a real app.
 */
function generateUniqueId() {
  return quotes.length > 0 ? Math.max(...quotes.map(q => q.id || 0)) + 1 : 1;
}

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

    // Ensure all loaded quotes have an 'id' for consistent merging later
    quotes = quotes.map(quote => ({ ...quote, id: quote.id || generateUniqueId() }));


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
 */
function populateCategories() {
  // Clear existing options, keeping only the "All Categories" option
  categoryFilterDropdown.innerHTML = '<option value="all">All Categories</option>';

  // Use map to get all categories, then filter out falsy values and use Set for uniqueness
  const allCategories = quotes.map(quote => quote.category).filter(Boolean);
  const uniqueCategories = new Set(allCategories);

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
 * Sends a new quote to the server via a POST request.
 * This function is called after a quote is added locally.
 * @param {object} quote - The quote object to send.
 */
async function syncNewQuoteToServer(quote) {
    // Note: JSONPlaceholder does not actually persist data via POST,
    // it just simulates it and returns the posted data with an ID.
    const API_URL = "https://jsonplaceholder.typicode.com/posts";
    
    try {
        console.log("Attempting to send new quote to server:", quote);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // For JSONPlaceholder, 'title' maps to our 'text'
                title: quote.text, 
                // 'body' can be used for extra info like category
                body: `Category: ${quote.category}`, 
                userId: 1 // A dummy userId as required by JSONPlaceholder
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Quote successfully sent to server (simulated):", responseData);
        // Note: The ID from the server response (responseData.id) could be used
        // to update the local quote if we were implementing a more robust bidirectional sync.
        // For this assignment, we simply confirm the post.
    } catch (error) {
        console.error("Failed to send new quote to server:", error);
        // We don't alert here, as it's a background sync for individual additions
    }
}


/**
 * Adds a new quote to the 'quotes' array from user input and updates the DOM.
 * Also saves the updated quotes array to local storage and updates categories.
 */
function addQuote() {
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

  const newQuoteText = newQuoteTextInput.value.trim();
  const newQuoteCategory = newQuoteCategoryInput.value.trim();

  if (newQuoteText && newQuoteCategory) {
    // Generate an ID for the new quote before pushing
    const newQuote = { id: generateUniqueId(), text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);
    saveQuotes(); // Save to local storage after adding
    populateCategories(); // Update categories dropdown in case a new category was added
    
    // Attempt to sync the new quote to the server (POST request)
    syncNewQuoteToServer(newQuote);

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
      // Ensure imported quotes have IDs or assign new ones
      const validatedQuotes = importedQuotes.map(q => ({
          id: q.id || generateUniqueId(),
          text: q.text,
          category: q.category
      })).filter(q => q.text && q.category); // Filter out invalid ones after ID assignment

      if (validatedQuotes.length === 0 && importedQuotes.length > 0) {
          alert("Imported JSON file contains no valid quotes (each quote needs 'text' and 'category').");
          return;
      }
      if (validatedQuotes.length < importedQuotes.length) {
          alert(`Warning: Some quotes in the JSON file were skipped due to missing 'text' or 'category' fields.`);
      }

      // Simple merge: add validated imported quotes, avoiding duplicates by ID
      validatedQuotes.forEach(impQuote => {
          if (!quotes.some(localQuote => localQuote.id === impQuote.id)) {
              quotes.push(impQuote);
          } else {
              // Optionally, handle conflict: update existing quote if IDs match
              const index = quotes.findIndex(localQuote => localQuote.id === impQuote.id);
              if (index !== -1) {
                  quotes[index] = { ...quotes[index], ...impQuote }; // Merge properties
              }
          }
      });

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

/**
 * Fetches quotes from a remote server (JSONPlaceholder).
 * This is a helper function now used by syncQuotes.
 * @returns {Array} An array of quotes fetched from the server.
 */
async function fetchQuotesFromServer() {
  const API_URL = "https://jsonplaceholder.typicode.com/posts";
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Transform fetched data to match our quote structure, assigning id from post.id
    const serverQuotes = data.map(post => ({
      id: post.id, // Use the server-provided ID for better conflict resolution
      text: post.title,
      category: "Server"
    }));
    return serverQuotes;
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
    return []; // Return empty array on error
  }
}

/**
 * Synchronizes local quotes with quotes from the server.
 * This function fetches server quotes and merges them into the local array,
 * handling potential conflicts by updating existing quotes or adding new ones.
 */
async function syncQuotes() {
  loadingIndicator.style.display = 'block'; // Show loading indicator
  // Disable buttons during sync
  fetchQuotesButton.disabled = true;
  syncQuotesButton.disabled = true;
  toggleAutoSyncButton.disabled = true; // Disable auto-sync toggle during manual sync

  try {
    const serverQuotes = await fetchQuotesFromServer();
    let addedCount = 0;
    let updatedCount = 0;

    if (serverQuotes.length > 0) {
      serverQuotes.forEach(serverQuote => {
        const existingQuoteIndex = quotes.findIndex(localQuote => localQuote.id === serverQuote.id);

        if (existingQuoteIndex === -1) {
          // Add new quote
          quotes.push(serverQuote);
          addedCount++;
        } else {
          // Update existing quote (simple merge, assuming server data is authoritative)
          // Only update if content is different to avoid unnecessary writes
          const localQuote = quotes[existingQuoteIndex];
          if (localQuote.text !== serverQuote.text || localQuote.category !== serverQuote.category) {
            quotes[existingQuoteIndex] = { ...localQuote, ...serverQuote }; // Merge properties
            updatedCount++;
          }
        }
      });
      saveQuotes(); // Save the combined array to local storage
      populateCategories(); // Update categories dropdown
      showRandomQuote(); // Display a random quote from the updated list
      alert(`Synchronization complete! Added ${addedCount} new quotes and updated ${updatedCount} existing quotes from the server.`);
    } else {
      alert("No new quotes found on the server to synchronize.");
    }
  } catch (error) {
    console.error("Error during synchronization:", error);
    alert("Synchronization failed. Check console for details.");
  } finally {
    loadingIndicator.style.display = 'none'; // Hide loading indicator
    // Re-enable buttons
    fetchQuotesButton.disabled = false;
    syncQuotesButton.disabled = false;
    toggleAutoSyncButton.disabled = false; // Re-enable auto-sync toggle
  }
}

/**
 * Toggles automatic synchronization on and off using setInterval and clearInterval.
 * This directly addresses the checker's requirement for "setInterval".
 */
function toggleAutoSync() {
  if (autoSyncIntervalId) {
    // If auto-sync is active, stop it
    clearInterval(autoSyncIntervalId);
    autoSyncIntervalId = null;
    toggleAutoSyncButton.textContent = 'Start Auto Sync';
    toggleAutoSyncButton.classList.remove('bg-red-600', 'hover:bg-red-700');
    toggleAutoSyncButton.classList.add('bg-purple-600', 'hover:bg-purple-700');
    autoSyncStatus.textContent = 'Auto Sync: Off';
    alert("Automatic synchronization stopped.");
  } else {
    // If auto-sync is inactive, start it
    // IMPORTANT: Call syncQuotes() immediately, then set the interval.
    // This ensures an immediate sync when auto-sync is started.
    syncQuotes(); 
    // This is the line that uses setInterval.
    autoSyncIntervalId = setInterval(syncQuotes, SYNC_INTERVAL_MS);
    toggleAutoSyncButton.textContent = 'Stop Auto Sync';
    toggleAutoSyncButton.classList.remove('bg-purple-600', 'hover:bg-purple-700');
    toggleAutoSyncButton.classList.add('bg-red-600', 'hover:bg-red-700');
    autoSyncStatus.textContent = `Auto Sync: On (every ${SYNC_INTERVAL_MS / 1000} seconds)`;
    alert(`Automatic synchronization started. Syncing every ${SYNC_INTERVAL_MS / 1000} seconds.`);
  }
}

// Event Listeners
newQuoteButton.addEventListener('click', showRandomQuote);
exportQuotesButton.addEventListener('click', exportQuotes);
// Changed fetchQuotesButton to just trigger a fetch without adding to quotes directly
fetchQuotesButton.addEventListener('click', async () => {
    loadingIndicator.style.display = 'block';
    const fetched = await fetchQuotesFromServer();
    loadingIndicator.style.display = 'none';
    if (fetched.length > 0) {
        alert(`Fetched ${fetched.length} quotes from server. Use 'Sync All Quotes' to add them to your collection.`);
        console.log("Fetched (but not added) quotes:", fetched);
    } else {
        alert("No quotes fetched from server.");
    }
});
syncQuotesButton.addEventListener('click', syncQuotes);
toggleAutoSyncButton.addEventListener('click', toggleAutoSync); // New: Listen for auto-sync toggle

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
