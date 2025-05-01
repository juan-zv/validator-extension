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

document.getElementById('validate-btn').addEventListener('click', () => {
    const helloWorld = document.createElement('p');
    helloWorld.textContent = 'Hello World!';
    document.body.appendChild(helloWorld);

    getCurrentTab().then((tab) => {
        // Check if tab and tab.url exist before trying to log
        if (tab && tab.url) {
            console.log("======= active tab url", tab.url); // Corrected: Use tab.url directly
            currentUrl = tab.url; // Store the URL in a variable for later use
        } else if (tab) {
            console.log("======= active tab does not have a URL (e.g., internal page)", tab);
        } else {
             console.log("======= Could not retrieve active tab.");
        }
    }).catch((error) => {
        console.error("Error getting current tab:", error);
    });

    helloWorld.textContent = currentUrl; // Append the URL to the body (or handle it as needed)
});

let currentUrl = null;

