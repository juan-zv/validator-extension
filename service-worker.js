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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'openSidePanel') {
        // This will open the panel in all the pages on the current window.
        chrome.sidePanel.open({ windowId: tab.windowId });
    }
});

/* Commented out for now to see the effect of the side panel on the current page

// Update the url of the side panel when the active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log(`Tab ${activeInfo.tabId} in window ${activeInfo.windowId} was activated.`);

    // Optional: Get more details about the newly activated tab
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab.url) {
            console.log(`Activated tab URL: ${tab}`);
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

*/