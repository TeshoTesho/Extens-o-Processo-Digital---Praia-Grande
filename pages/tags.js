let allTags = [];
let currentSort = { column: 'processNumber', direction: 'asc' };

async function carregarTags() {
  const tbody = document.getElementById('tagsTableBody');
  tbody.innerHTML = `
    <tr><td colspan="4" class="text-center text-muted py-4">Carregando...</td></tr>
  `;

  const { processTags } = await chrome.storage.local.get('processTags');
  const tags = processTags || {};

  if (Object.keys(tags).length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="4" class="text-center text-muted py-4">Nenhuma tag salva.</td></tr>
    `;
    return;
  }

  // Converte o objeto em array com metadados
  allTags = Object.entries(tags).map(([id, tag]) => ({
    id,
    processId: id.split('-')[0],
    processNumber: tag.processNumber || '',
    name: tag.name || '',
    color: tag.color || '#999'
  }));

  sortAndRender();
}

function sortAndRender() {
  const tbody = document.getElementById('tagsTableBody');
  tbody.innerHTML = '';

  // Agrupa todas as tags por ID base (processId)
  const grouped = {};
  for (const tag of allTags) {
    const key = tag.processId;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(tag);
  }

  // Cria um array de grupos com metadados (usado para ordenação)
  const groupArray = Object.entries(grouped).map(([processId, tags]) => ({
    processId,
    processNumber: tags[0].processNumber || '',
    tags
  }));

  // Ordena os grupos pelo processNumber (numérico se possível)
  groupArray.sort((a, b) => {
    let valA = a.processNumber.replace(/\D/g, '');
    let valB = b.processNumber.replace(/\D/g, '');
    return currentSort.direction === 'asc'
      ? valA.localeCompare(valB, undefined, { numeric: true })
      : valB.localeCompare(valA, undefined, { numeric: true });
  });

  // Renderiza cada grupo como uma linha
  for (const group of groupArray) {
    const tagList = group.tags
      .map(t => `
        <span style="
          display:inline-block;
          background-color:${t.color};
          color:#fff;
          padding:2px 6px;
          border-radius:4px;
          font-size:12px;
          margin-right:4px;
        ">
          ${t.name}
        </span>
      `)
      .join(' ');

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${group.processNumber || '—'}</td>
      <td>${tagList}</td>
      <td>
        <span class="text-muted">${group.tags[0].color}</span>
      </td>
      <td>
        <a href="https://processodigital.praiagrande.sp.gov.br/processo/${group.processId}" 
           target="_blank" 
           class="text-decoration-none text-muted">
          ${group.processId}
        </a>
      </td>
    `;
    tbody.appendChild(row);
  }

  updateSortIcons();
}


function updateSortIcons() {
  document.querySelectorAll('th.sortable').forEach(th => {
    const icon = th.querySelector('.sort-icon');
    if (!icon) return;
    if (th.dataset.column === currentSort.column) {
      icon.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
    } else {
      icon.textContent = '↕';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('refreshBtn').addEventListener('click', carregarTags);

  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.dataset.column;
      if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
      }
      sortAndRender();
    });
  });

  carregarTags(); // ordena por processNumber por padrão
});
