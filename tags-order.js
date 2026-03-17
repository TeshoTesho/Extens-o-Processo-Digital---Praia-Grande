const listEl = document.getElementById('tagsList');

chrome.storage.local.get('predefinedTags', ({ predefinedTags = [] }) => {

  // fallback para tags antigas
  predefinedTags.forEach((tag, index) => {
    if (typeof tag.order !== 'number') {
      tag.order = index;
    }
  });

  // ordena inicialmente
  predefinedTags.sort((a, b) => a.order - b.order);

  render(predefinedTags);

  new Sortable(listEl, {
    animation: 150,
    handle: '.drag-handle',

    onEnd: () => {
      saveOrder();
    }
  });

  function render(tags) {
    listEl.innerHTML = '';

    tags.forEach(tag => {
      const li = document.createElement('li');
      li.dataset.name = tag.name;

        li.classList.add("task-order");
      li.innerHTML = `
        <span class="drag-handle">☰</span>
        <span class="color-dot" style="background:${tag.color}"></span>
        <strong>${tag.name}</strong>
      `;

      listEl.appendChild(li);
    });
  }

  function saveOrder() {
    const items = [...listEl.children];

    items.forEach((li, index) => {
      const tag = predefinedTags.find(t => t.name === li.dataset.name);
      if (tag) tag.order = index;
    });

    chrome.storage.local.set({ predefinedTags }, () => {
      console.log('Ordem das tags salva');
    });
  }
});
