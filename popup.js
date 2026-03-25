// Initialization: Load saved words when popup opens
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['savedWords'], (data) => {
    if (data.savedWords) {
      document.getElementById('words').value = data.savedWords;
    }
  });
});

// Highlight Button Logic
document.getElementById('runBtn').addEventListener('click', async () => {
  const wordText = document.getElementById('words').value;
  chrome.storage.local.set({ savedWords: wordText }); // Save for later

  const wordList = wordText.split('\n')
    .map(w => w.trim())
    .filter(w => w.length > 0);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: executeHighlighting,
    args: [wordList]
  });
});

// Clear Button Logic
document.getElementById('clearBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      document.querySelectorAll('.mh-highlight').forEach(el => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.innerText), el);
        parent.normalize(); // Cleans up text node fragments
      });
    }
  });
});

// THIS FUNCTION RUNS INSIDE THE WEBPAGE
function executeHighlighting(words) {
  // Your friend's original colors
  const colors = [
    { bg: 'yellow', text: 'black' },
    { bg: '#ffc600', text: 'black' },
    { bg: 'red', text: 'white' },
    { bg: '#3988ff', text: 'white' },
    { bg: '#b4ff00', text: 'black' },
    { bg: '#fc11ff', text: 'white' }
  ];

  words.forEach((word, index) => {
    const color = colors[index % colors.length];
    const regex = new RegExp(`(${word})`, 'gi');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    
    let node;
    const nodesToProcess = [];

    while (node = walker.nextNode()) {
      const parent = node.parentElement;
      if (parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE' && !parent.classList.contains('mh-highlight')) {
        if (node.nodeValue.match(regex)) nodesToProcess.push(node);
      }
    }

    nodesToProcess.forEach(textNode => {
      const span = document.createElement('span');
      span.innerHTML = textNode.nodeValue.replace(regex, 
        `<mark class="mh-highlight" style="background:${color.bg}; color:${color.text}; border-radius:3px; padding:0 2px; box-shadow:1px 1px 2px rgba(0,0,0,0.2);">$1</mark>`);
      textNode.parentNode.replaceChild(span, textNode);
    });
  });
}
