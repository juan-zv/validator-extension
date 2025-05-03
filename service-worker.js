chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'openSidePanel',
        title: 'Open side panel',
        contexts: ['all']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'openSidePanel') {
        // This will open the panel in all the pages on the current window.
        chrome.sidePanel.open({ windowId: tab.windowId });
    }
});

// Update the url of the side panel when the active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log(`Tab ${activeInfo.tabId} in window ${activeInfo.windowId} was activated.`);

    // Optional: Get more details about the newly activated tab
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab.url) {
            console.log(`Activated tab URL: ${tab.url}`);
        }
    } catch (error) {
        console.error(`Error getting details for activated tab ${activeInfo.tabId}:`, error);
    }
});

// Update the side panel when the tab is updated (e.g., URL change)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // changeInfo contains properties like 'status' ('loading' or 'complete') and 'url'
    // tab contains the full Tab object

    // Best practice: Only act when the page load is complete and the tab has a valid URL
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        console.log(`Tab ${tabId} finished loading. URL: ${tab.url}`);
    }

    // Example: Log URL changes specifically
    if (changeInfo.url) {
        console.log(`Tab ${tabId} URL changed to: ${changeInfo.url}`);
    }
});

// Add event listener to the button in the side panel to trigger validation
document.getElementById('validate-btn').addEventListener('click', () => {
    const HTMLerrors = document.createElement('p');
    const CSSerrors = document.createElement('p');
    document.body.appendChild(HTMLerrors);
    document.body.appendChild(CSSerrors);

    getCurrentTab().then(async (tab) => {
        // Check if tab and tab.url exist before trying to log
        if (tab && tab.url) {
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
            return errors.length === 0 ? "Valid HTML" : `${errors.length} HTML errors found`;
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
            return `${data.cssvalidation.errors.length} CSS errors found`;
        }
        return `Failed to validate CSS (${response.status})`;
    } catch (error) {
        return `Error validating CSS: ${error.message}`;
    }
}