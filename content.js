// Function to run the highlight logic
function autoHighlight() {
  chrome.storage.local.get(['savedWords'], (data) => {
    if (!data.savedWords) return;

    const words = data.savedWords.split('\n')
      .map(w => w.trim())
      .filter(w => w.length > 0);

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
          `<mark class="mh-highlight" style="background:${color.bg}; color:${color.text}; border-radius:3px; padding:0 2px;">$1</mark>`);
        textNode.parentNode.replaceChild(span, textNode);
      });
    });
  });
}

// Run immediately when page loads
autoHighlight();

// Also run if the page content changes (for sites like YouTube or Facebook that load data dynamically)
let timeout = null;
const observer = new MutationObserver(() => {
  clearTimeout(timeout);
  timeout = setTimeout(autoHighlight, 1000); 
});
observer.observe(document.body, { childList: true, subtree: true });
