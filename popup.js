// 1. Load saved words from storage when the popup window opens
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['savedWords'], (data) => {
    if (data.savedWords) {
      document.getElementById('words').value = data.savedWords;
    }
  });
});

// 2. Handle the "Highlight All" button click
document.getElementById('runBtn').addEventListener('click', async () => {
  const wordText = document.getElementById('words').value;
  
  // Save the words to storage so 'content.js' can see them on every page
  await chrome.storage.local.set({ savedWords: wordText });

  // Find the current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Refresh the page to trigger the automatic highlighting immediately
  if (tab && tab.id) {
    chrome.tabs.reload(tab.id);
  }
});

// 3. Handle the "Clear" button click
document.getElementById('clearBtn').addEventListener('click', async () => {
  // Clear the text area
  document.getElementById('words').value = '';
  
  // Clear the storage
  await chrome.storage.local.set({ savedWords: '' });

  // Refresh the page to remove highlights
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.tabs.reload(tab.id);
  }
});
