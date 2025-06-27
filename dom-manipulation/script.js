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

/**
 * Saves the current 'quotes' array to Local Storage.
 * The array is converted to a JSON string before storage.
 */
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
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
        quotes.push({ text: newQuoteText, category: newQuoteCategory });

        saveQuotes(); // Persist the updated quotes array to Local Storage
        populateCategories(); // Update the dropdown with the new category if it's unique
        filterQuotes(); // Re-apply the current filter, potentially showing the new quote

        // Clear the input fields for the next entry
        newQuoteTextInput.value = '';
        newQuoteCategoryInput.value = '';

        console.log("Quote added:", { text: newQuoteText, category: newQuoteCategory });
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
                quotes.push(...importedQuotes); // Use spread operator to add all elements
                saveQuotes(); // Save combined quotes
                populateCategories(); // Update dropdown with any new categories from import
                filterQuotes(); // Apply current filter, showing new quotes if they match
                alert('Quotes imported successfully!');
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
});
