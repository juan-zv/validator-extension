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

document.getElementById('validate').addEventListener('click', function () {
    const helloWorld = document.createElement('p')
    helloWorld.textContent = 'Hello World!';
    document.body.appendChild(helloWorld);

    // to fix [retreive url from current tab]
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        const tab = tabs[0];
        const url = tab.url;
        console.log(url);
    });
});