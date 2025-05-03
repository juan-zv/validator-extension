// sidepanel.js
const validateBtn = document.getElementById('validate-btn');
const resultsDiv = document.getElementById('results');
// const loadingDiv = document.getElementById('loading');

validateBtn.addEventListener('click', async () => {
  resultsDiv.innerHTML = ''; // Clear previous results
    // loadingDiv.style.display = 'block'; // Show loading indicator

  try {
    // 1. Get the current tab's URL
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      throw new Error("Could not get active tab.");
    }
    const currentTab = tabs[0];
    const url = currentTab.url;

    console.log("Current Tab URL:", url); // Debugging log

    if (!url || (!url.startsWith('http:') && !url.startsWith('https:'))) {
       throw new Error("Cannot validate this URL type (requires http or https).");
    }

    // Encode URL for API calls
    const encodedUrl = encodeURIComponent(url);

    // 2. Call W3C Validators (run in parallel)
    const [htmlResult, cssResult] = await Promise.all([
      fetchHtmlValidation(encodedUrl),
      fetchCssValidation(encodedUrl)
    ]);

    // 3. Display Results

  } catch (error) {
    console.error("Validation Error:", error);
    resultsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
});

// --- API Fetching Functions ---

async function fetchHtmlValidation(encodedUrl) {
  const apiUrl = `https://validator.w3.org/nu/?doc=${encodedUrl}&out=json`;
  try {
    const response = await fetch(apiUrl);
    // The HTML validator API returns 200 OK even for validation errors,
    // but might return non-JSON or error status for network/server issues.
    if (!response.ok) {
        // Try to get more info if available
        let errorText = response.statusText;
        try {
            const errorData = await response.json();
            if (errorData && errorData.messages && errorData.messages.length > 0) {
                errorText = errorData.messages[0].message; // Use first error message if available
            }
        } catch (e) { /* ignore if response wasn't JSON */ }
        throw new Error(`HTML Validator API request failed: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    return data; // Contains a 'messages' array
  } catch (error) {
    console.error("HTML Validation Fetch Error:", error);
    // Return a structured error object for consistent handling
    return { error: `Failed to fetch HTML validation: ${error.message}` };
  }
}

async function fetchCssValidation(encodedUrl) {
  // Note: Jigsaw CSS validator requires a specific User-Agent or it might block the request.
  // Chrome extensions usually send a suitable one, but keep this in mind if issues arise.
  const apiUrl = `https://jigsaw.w3.org/css-validator/validator?uri=${encodedUrl}&output=json&profile=css3`; // Using output=json
  try {
    const response = await fetch(apiUrl);
     // CSS validator might return different statuses
    if (!response.ok) {
      throw new Error(`CSS Validator API request failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    // Check structure, sometimes it wraps results differently
    if (data && data.cssvalidation) {
        return data.cssvalidation; // Contains 'result' with 'errors' and 'warnings'
    } else {
        // Handle unexpected structure or potential API errors within the JSON
        throw new Error("Unexpected CSS validation response format.");
    }
  } catch (error) {
    console.error("CSS Validation Fetch Error:", error);
     // Return a structured error object
    return { error: `Failed to fetch CSS validation: ${error.message}` };
  }
}

// Simple HTML escaping function
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

 // MY script:
