// Array to store quote objects.
// This array will be populated from localStorage when the app initializes.
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
    { text: "The mind is everything. What you think you become.", category: "Mindfulness" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "It is during our darkest moments that we must focus to see the light.", category: "Inspiration" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Life" },
    { text: "The way to get started is to quit talking and begin doing.", category: "Action" },
    { text: "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough.", category: "Gratitude" }
];

// --- Simulated Server Data ---
// In a real application, this data would be fetched from and pushed to a backend server.
// For this simulation, we'll keep a representation of 'server data' in memory.
// This allows us to demonstrate conflict resolution where the "server" holds a source of truth.
let serverQuotes = [
    { text: "Server: The unexamined life is not worth living.", category: "Philosophy" },
    { text: "Server: The only constant in life is change.", category: "Life" },
    { text: "Server: Be the change that you wish to see in the world.", category: "Inspiration" }
];

/**
 * Helper function to display temporary status notifications to the user.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'info', or 'error' to apply appropriate styling.
 */
function notifyUser(message, type = 'info') {
    const syncStatusDiv = document.getElementById('syncStatus');
    syncStatusDiv.textContent = message;
    syncStatusDiv.className = ''; // Clear existing classes
    syncStatusDiv.classList.add('sync-status', `sync-${type}`);
    syncStatusDiv.style.display = 'block';

    // Hide message after 5 seconds
    setTimeout(() => {
        syncStatusDiv.style.display = 'none';
    }, 5000);
}

/**
 * Saves the current 'quotes' array to Local Storage.
 * The array is converted to a JSON string before storage.
 */
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    console.log("Quotes saved to local storage.");
}

/**
 * Loads quotes from Local Storage when the application initializes.
 * If quotes are found, they replace the default 'quotes' array.
 * If no quotes are found, the default array is used.
 */
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        // Parse the JSON string back into a JavaScript array
        quotes = JSON.parse(storedQuotes);
        console.log("Quotes loaded from local storage.");
    }
}

/**
 * Displays a random quote from a given array of quotes in the 'quoteDisplay' div.
 * Also stores the displayed quote in Session Storage.
 * If the provided array is empty, it displays a default message.
 * @param {Array<Object>} quoteArray - The array of quotes to pick from. Defaults to the global 'quotes' array.
 */
function showRandomQuote(quoteArray = quotes) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const lastViewedQuoteDisplay = document.getElementById('lastViewedQuoteDisplay');

    if (quoteArray.length === 0) {
        quoteDisplay.innerHTML = `<p>No quotes available for this category. Add some!</p>`;
        sessionStorage.removeItem('lastQuoteText');
        sessionStorage.removeItem('lastQuoteCategory');
        lastViewedQuoteDisplay.textContent = 'No last viewed quote.';
        return;
    }

    // Generate a random index within the bounds of the provided quoteArray
    const randomIndex = Math.floor(Math.random() * quoteArray.length);
    // Get the quote object at the random index
    const randomQuote = quoteArray[randomIndex];

    // Update the inner HTML of the quoteDisplay div with the quote text and category
    quoteDisplay.innerHTML = `
        <p>"${randomQuote.text}"</p>
        <p><strong>- ${randomQuote.category}</strong></p>
    `;

    // Store the last viewed quote in Session Storage
    sessionStorage.setItem('lastQuoteText', randomQuote.text);
    sessionStorage.setItem('lastQuoteCategory', randomQuote.category);
    lastViewedQuoteDisplay.textContent = `Last viewed: "${randomQuote.text}" - ${randomQuote.category}`;
}

/**
 * Dynamically creates and appends a form for adding new quotes to the DOM.
 * This form includes input fields for quote text and category, and an 'Add Quote' button.
 */
function createAddQuoteForm() {
    const formContainer = document.getElementById('addQuoteFormContainer');

    // Create the HTML string for the form
    formContainer.innerHTML = `
        <div class="add-quote-form">
            <h2>Add New Quote</h2>
            <input id="newQuoteText" type="text" placeholder="Enter a new quote" aria-label="New quote text" />
            <input id="newQuoteCategory" type="text" placeholder="Enter quote category" aria-label="New quote category" />
            <button id="addQuoteButton">Add Quote</button>
        </div>
    `;

    // After the form elements are added to the DOM, attach the event listener to the button
    const addQuoteButton = document.getElementById('addQuoteButton');
    if (addQuoteButton) {
        addQuoteButton.addEventListener('click', addQuote);
    } else {
        console.error("Error: 'addQuoteButton' not found after creating form.");
    }
}

/**
 * Adds a new quote to the 'quotes' array based on user input from the form.
 * It retrieves values from the input fields, creates a new quote object, adds it to the array,
 * clears the input fields, and then calls functions to save, update categories, and filter display.
 */
function addQuote() {
    const newQuoteTextInput = document.getElementById('newQuoteText');
    const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

    const newQuoteText = newQuoteTextInput.value.trim();
    const newQuoteCategory = newQuoteCategoryInput.value.trim();

    // Check if both fields have content
    if (newQuoteText && newQuoteCategory) {
        // Check for duplicates before adding
        const isDuplicate = quotes.some(quote => 
            quote.text === newQuoteText && quote.category === newQuoteCategory
        );
        if (isDuplicate) {
            alert('This quote already exists locally!');
            return;
        }

        quotes.push({ text: newQuoteText, category: newQuoteCategory });

        saveQuotes(); // Persist the updated quotes array to Local Storage
        populateCategories(); // Update the dropdown with the new category if it's unique
        filterQuotes(); // Re-apply the current filter, potentially showing the new quote

        // Clear the input fields for the next entry
        newQuoteTextInput.value = '';
        newQuoteCategoryInput.value = '';

        console.log("Quote added:", { text: newQuoteText, category: newQuoteCategory });
        notifyUser('New quote added locally!', 'success');
    } else {
        alert("Please enter both quote text and category to add a new quote.");
    }
}

/**
 * Exports the current 'quotes' array as a JSON file.
 * Creates a Blob, a URL, and a temporary download link to facilitate the download.
 */
function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2); // Prettify JSON with 2-space indentation
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url); // Release the object URL
    
    alert('Quotes exported successfully!');
}

/**
 * Handles the import of quotes from a JSON file selected by the user.
 * Reads the file, parses its JSON content, and appends the imported quotes
 * to the existing 'quotes' array, then saves to Local Storage.
 * @param {Event} event - The change event from the file input.
 */
function importFromJsonFile(event) {
    const fileReader = new FileReader();

    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);

            if (Array.isArray(importedQuotes) && importedQuotes.every(q => typeof q.text === 'string' && typeof q.category === 'string')) {
                // Filter out duplicates before adding
                const newQuotesToAdd = importedQuotes.filter(importedQuote =>
                    !quotes.some(existingQuote => 
                        existingQuote.text === importedQuote.text && existingQuote.category === importedQuote.category
                    )
                );
                
                if (newQuotesToAdd.length > 0) {
                    quotes.push(...newQuotesToAdd); // Use spread operator to add all elements
                    saveQuotes(); // Save combined quotes
                    populateCategories(); // Update dropdown with any new categories from import
                    filterQuotes(); // Apply current filter, showing new quotes if they match
                    alert(`${newQuotesToAdd.length} quotes imported successfully!`);
                } else {
                    alert('No new quotes to import or all quotes already exist.');
                }
            } else {
                alert('Invalid JSON file format. Please upload a file containing an array of quote objects with "text" and "category" properties.');
            }
        } catch (error) {
            alert('Error parsing JSON file: ' + error.message);
            console.error('Error importing quotes:', error);
        }
    };

    if (event.target.files.length > 0) {
        fileReader.readAsText(event.target.files[0]);
    }
}

/**
 * Populates the category filter dropdown with unique categories from the 'quotes' array.
 * It also selects the last saved filter from Local Storage.
 */
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    // Use a Set to get unique categories
    const uniqueCategories = new Set(quotes.map(quote => quote.category));

    // Clear existing options
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    // Add new options for each unique category
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore last selected filter from Local Storage
    const lastFilter = localStorage.getItem('lastFilter');
    if (lastFilter && uniqueCategories.has(lastFilter) || lastFilter === 'all') {
        categoryFilter.value = lastFilter;
    } else {
        categoryFilter.value = 'all'; // Default to 'all' if last filter is not found or no longer exists
    }
}

/**
 * Filters the global 'quotes' array based on the selected category from the dropdown.
 * Updates Local Storage with the selected filter and displays a random quote from the filtered set.
 */
function filterQuotes() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter.value;

    // Save the selected filter to Local Storage
    localStorage.setItem('lastFilter', selectedCategory);

    let filteredQuotes = [];
    if (selectedCategory === 'all') {
        filteredQuotes = quotes; // If "All Categories" is selected, use all quotes
    } else {
        // Filter quotes where the category matches the selected one
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }

    // Display a random quote from the filtered set
    showRandomQuote(filteredQuotes);
}

// --- Server Syncing and Conflict Resolution Logic ---

/**
 * Simulates fetching quotes from a server.
 * In a real application, this would be an actual API call (e.g., using fetch()).
 * @returns {Promise<Array<Object>>} A promise that resolves with the server's quotes.
 */
async function fetchQuotesFromServer() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Simulating fetch from server. Server data:", serverQuotes);
    return JSON.parse(JSON.stringify(serverQuotes)); // Return a deep copy to avoid direct manipulation
}

/**
 * Simulates pushing local quotes to the server.
 * In a real application, this would be an actual API call (e.g., a POST/PUT request).
 * @param {Array<Object>} data - The quotes array to push to the server.
 * @returns {Promise<void>} A promise that resolves when the push is "complete".
 */
async function pushQuotesToServer(data) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    serverQuotes = JSON.parse(JSON.stringify(data)); // Update our simulated server data
    console.log("Simulating push to server. New server data:", serverQuotes);
}

/**
 * Synchronizes local quotes with server quotes, with server data taking precedence.
 * It fetches server data, merges, resolves conflicts, and then pushes local-only changes.
 */
async function syncData() {
    notifyUser('Syncing data...', 'info');
    let conflictsResolved = 0;
    let newQuotesAddedFromServer = 0;
    let newQuotesPushedToServer = 0;

    try {
        const serverData = await fetchQuotesFromServer();
        const localData = JSON.parse(JSON.stringify(quotes)); // Deep copy of current local quotes

        let mergedQuotes = [];
        const processedLocalTexts = new Set(); // To track local quotes considered for merging/pushing

        // Step 1: Incorporate server data (server takes precedence for existing quotes)
        serverData.forEach(sQuote => {
            const localMatchIndex = localData.findIndex(lQuote =>
                lQuote.text === sQuote.text && lQuote.category === sQuote.category
            );

            if (localMatchIndex !== -1) {
                // Quote exists both locally and on server
                const localQuote = localData[localMatchIndex];
                if (JSON.stringify(localQuote) !== JSON.stringify(sQuote)) {
                    // Conflict: local and server versions differ. Server takes precedence.
                    mergedQuotes.push(sQuote);
                    conflictsResolved++;
                    console.log("Conflict resolved (server took precedence):", sQuote);
                } else {
                    // No conflict, versions are identical
                    mergedQuotes.push(localQuote);
                }
                processedLocalTexts.add(`${localQuote.text}-${localQuote.category}`); // Mark as processed
            } else {
                // Quote exists only on server, add it to local data
                mergedQuotes.push(sQuote);
                newQuotesAddedFromServer++;
                console.log("New quote from server added:", sQuote);
            }
        });

        // Step 2: Add local-only quotes that were not in server data (and thus not yet merged)
        localData.forEach(lQuote => {
            const quoteId = `${lQuote.text}-${lQuote.category}`;
            if (!processedLocalTexts.has(quoteId)) {
                // This quote was only local, so add it to the merged list
                mergedQuotes.push(lQuote);
                newQuotesPushedToServer++;
                console.log("Local-only quote identified for push:", lQuote);
            }
        });

        // Update global quotes array with the merged data
        quotes = mergedQuotes;
        saveQuotes(); // Persist the merged data to local storage

        // Push the entire current local state (which now includes server changes and local-only changes)
        // back to the simulated server to keep it consistent.
        // This is a simplified "push all" after merge. A more complex system might track changes.
        await pushQuotesToServer(quotes);

        // Update UI
        populateCategories();
        filterQuotes();

        let message = 'Data synced successfully!';
        if (conflictsResolved > 0) {
            message += ` ${conflictsResolved} conflict(s) resolved (server precedence).`;
        }
        if (newQuotesAddedFromServer > 0) {
            message += ` ${newQuotesAddedFromServer} new quote(s) added from server.`;
        }
        if (newQuotesPushedToServer > 0) {
            message += ` ${newQuotesPushedToServer} local quote(s) pushed to server.`;
        }
        notifyUser(message, 'success');

    } catch (error) {
        console.error("Error during sync:", error);
        notifyUser('Error during sync: ' + error.message, 'error');
    }
}

// Event listener for when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load existing quotes from Local Storage when the page loads
    loadQuotes();

    // 2. Populate the category dropdown and apply the last saved filter
    populateCategories();

    // 3. Apply the initial filter (which also displays a random quote)
    filterQuotes();

    // 4. Load and display the last viewed quote from Session Storage
    const lastQuoteText = sessionStorage.getItem('lastQuoteText');
    const lastQuoteCategory = sessionStorage.getItem('lastQuoteCategory');
    const lastViewedQuoteDisplay = document.getElementById('lastViewedQuoteDisplay');
    if (lastQuoteText && lastQuoteCategory) {
        lastViewedQuoteDisplay.textContent = `Last viewed: "${lastQuoteText}" - ${lastQuoteCategory}`;
    } else {
        lastViewedQuoteDisplay.textContent = 'No last viewed quote.';
    }

    // 5. Attach Event Listeners:

    // "Show New Quote" button
    const newQuoteButton = document.getElementById('newQuote');
    if (newQuoteButton) {
        newQuoteButton.addEventListener('click', filterQuotes); // Clicking 'New Quote' now refreshes from current filter
    } else {
        console.error("Error: 'newQuote' button not found.");
    }

    // Dynamically create and add the quote input form.
    createAddQuoteForm();

    // "Export Quotes" button
    const exportQuotesButton = document.getElementById('exportQuotes');
    if (exportQuotesButton) {
        exportQuotesButton.addEventListener('click', exportQuotes);
    } else {
        console.error("Error: 'exportQuotes' button not found.");
    }

    // "Import Quotes" file input
    const importFileInput = document.getElementById('importFile');
    if (importFileInput) {
        importFileInput.addEventListener('change', importFromJsonFile);
    } else {
        console.error("Error: 'importFile' input not found.");
    }

    // Category Filter Dropdown - already handled by populateCategories and filterQuotes
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterQuotes);
    } else {
        console.error("Error: 'categoryFilter' dropdown not found.");
    }

    // --- New Event Listener for Sync ---
    const forceSyncButton = document.getElementById('forceSync');
    if (forceSyncButton) {
        forceSyncButton.addEventListener('click', syncData);
    } else {
        console.error("Error: 'forceSync' button not found.");
    }

    // Initial sync on page load
    syncData();

    // Set up periodic sync (e.g., every 5 minutes = 300000 milliseconds)
    // For testing, you might want a shorter interval (e.g., 10000 for 10 seconds)
    // In a real app, consider efficiency and server load.
    setInterval(syncData, 300000); // Sync every 5 minutes
});
