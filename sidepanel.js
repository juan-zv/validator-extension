
// Container and placeholder for the results
const resultsContainer = document.getElementById('results-container');
const HTMLerrors = document.getElementById('html-results');
const CSSerrors = document.getElementById('css-results');

// Add event listener to the button in the side panel to trigger validation
document.getElementById('validate-btn').addEventListener('click', () => {
  // Clear previous results
  resultsContainer.style.display = 'flex'; // Show the results container

  HTMLerrors.textContent = "Validating HTML...";
  CSSerrors.textContent = "Validating CSS...";

  getCurrentTab().then(async (tab) => {
    // Check if tab and tab.url exist before trying to log
    if (tab && tab.url && tab.url.startsWith('http')) {
      console.log("======= active tab url", tab.url); // Corrected: Use tab.url directly
      currentUrl = tab.url; // Store the URL in a variable for later use
      HTMLerrors.textContent = await validateHTML(currentUrl); // Append the URL to the body (or handle it as needed)
      CSSerrors.textContent = await validateCSS(currentUrl); // Append the URL to the body (or handle it as needed)
    } else if (tab) {
      console.log("======= active tab does not have a URL (e.g., internal page)", tab);
    } else {
      console.log("======= Could not retrieve active tab.");
    }
  }).catch((error) => {
    console.error("Error getting current tab:", error);
  });

});


async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  try {
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  } catch (error) {
    console.error("Error querying for current tab:", error);
    return undefined; // Return undefined on error
  }
}

async function validateHTML(url) {
  const validator = "https://validator.w3.org/nu/";
  const params = new URLSearchParams({
    doc: url,
    out: 'json'
  });

  try {
    const response = await fetch(`${validator}?${params}`);
    if (response.ok) {
      const data = await response.json();
      const errors = data.messages.filter(message => message.type === "error");
      return errors
      // return errors.length === 0 ? "Valid HTML" : `${errors.length} HTML errors found`;
    }
    return `Failed to validate HTML (${response.status})`;
  } catch (error) {
    return `Error validating HTML: ${error.message}`;
  }
}

async function validateCSS(url) {
  const validator = "https://jigsaw.w3.org/css-validator/validator";
  const params = new URLSearchParams({
    uri: url,
    profile: 'css3',
    output: 'json'
  });

  try {
    const response = await fetch(`${validator}?${params}`);
    if (response.ok) {
      const data = await response.json();
      if (data.cssvalidation.validity) {
        return "Valid CSS";
      }
      // return `${data.cssvalidation.errors.length} CSS errors found`;
      return data.cssvalidation.errors.map(error => error.message).join('\n');
    }
    return `Failed to validate CSS (${response.status})`;
  } catch (error) {
    return `Error validating CSS: ${error.message}`;
  }
}