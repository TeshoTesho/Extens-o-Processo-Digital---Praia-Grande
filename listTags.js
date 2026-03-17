// Arquivo: listTags.js (Versão com Design de Div/Grid)

const STORAGE_KEY = 'processTags';
const PREDEFINED_TAGS_KEY = 'predefinedTags';

// Adicionado o argumento 'id' para preencher o ID do processo
function fillFormInputs(id, name, color, processNumber) {
    const tagNameInput = document.getElementById('tagName');
    const tagColorInput = document.getElementById('tagColor');
    const processIdInput = document.getElementById('processId');
    // CORREÇÃO: Variável renomeada para processNumberInput e ID corrigido para 'processNumber'
    const processNumberInput = document.getElementById('processNumber');

    // Se o ID é nulo, preserva o valor atual (comportamento de atalho)
    if (processIdInput && id !== null && id !== undefined) {
        processIdInput.value = id;
    }

    // NOVO: Preenche o campo do número do processo no formulário, caso a função seja usada para preenchimento.
    if (processNumberInput && processNumber !== null && processNumber !== undefined) {
        processNumberInput.value = processNumber;
    }

    if (tagNameInput) {
        tagNameInput.value = name;
        tagNameInput.style.backgroundColor = color + '20';
        setTimeout(() => {
            tagNameInput.style.backgroundColor = '';
        }, 500);
    }
    if (tagColorInput) {
        tagColorInput.value = color.startsWith('#') ? color : '#' + color;
    }
}


/**
 * Cria o elemento DIV da tag com o design de grid solicitado.
 * @param {object} tag - Objeto da tag ({ name, color, [count] })
 * @param {string} currentProcessId - ID do processo
 * @param {string} titleSuffix - Texto extra para o tooltip
 * @returns {HTMLElement} O elemento DIV customizado.
 */
function createTagGridItem(tag, currentProcessId, titleSuffix = "") {
    const gridItem = document.createElement('div');
    // Usando a classe solicitada para o item do grid
    gridItem.className = 'grid-tag-item bg-white text-dark';
    gridItem.title = tag.name + (titleSuffix ? ` (${titleSuffix})` : '');
    gridItem.setAttribute('data-tag-name', tag.name);
    gridItem.setAttribute('data-tag-color', tag.color);

    // Prévia da cor (span.tag-preview)
    const colorPreview = document.createElement('span');
    colorPreview.className = 'tag-preview';
    colorPreview.style.backgroundColor = tag.color;

    // Nome da tag (span.tag-text)
    const nameText = document.createElement('span');
    nameText.className = 'tag-text';
    nameText.textContent = tag.name;

    // ADICIONADO: Garantindo text-dark explicitamente no span de texto
    nameText.classList.add('text-dark'); 
    nameText.textContent = tag.name;

    gridItem.appendChild(colorPreview);
    gridItem.appendChild(nameText);

    // Listener de clique para preencher o formulário. O ID é NULL para que ele preserve o ID do processo.
    gridItem.addEventListener('click', function() {
        const name = this.getAttribute('data-tag-name');
        const color = this.getAttribute('data-tag-color');

        // Recupera número e id diretamente dos inputs do popup
        const idFromInput = document.getElementById('processId')?.value?.trim() || '';
        const numberFromInput = document.getElementById('processNumber')?.value?.trim() || '';

        console.log('[listTags] QuickSaveTag com número:', {
            idFromInput,
            numberFromInput,
            name,
            color
        });

        if (window.quickSaveTag) {
            window.quickSaveTag(idFromInput, name, color, numberFromInput);
        } else {
            console.warn('[listTags] quickSaveTag não disponível ainda.');
        }
    });


    return gridItem;
}


// --- FUNÇÃO 1: TAGS MAIS USADAS (Design Grid) ---
// --- FUNÇÃO 1: TAGS MAIS USADAS (Design Grid) - COM FILTRO DE DUPLICATAS ---
function renderMostUsedTags(currentProcessId) {
    const tagsGridDiv = document.getElementById('tagsGridMaisUsadas');
    if (!tagsGridDiv) return;

    // Garante que a estrutura de grid seja aplicada via classe ou estilo direto
    tagsGridDiv.style.display = 'grid';
    tagsGridDiv.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
    tagsGridDiv.style.gap = '8px';

    chrome.storage.local.get([STORAGE_KEY, PREDEFINED_TAGS_KEY], (result) => {
        const allTagsData = result[STORAGE_KEY] || {};
        const predefinedTags = result[PREDEFINED_TAGS_KEY] || [];
        const quickTagNames = new Set(predefinedTags.map(t => t.name.toLowerCase().trim()));

        const tagFrequencies = {};
        Object.keys(allTagsData).forEach(id => {
            const data = allTagsData[id];
            if (data && data.name && !quickTagNames.has(data.name.toLowerCase().trim())) {
                const key = `${data.name}|${data.color}`;
                tagFrequencies[key] = tagFrequencies[key] || { name: data.name, color: data.color, count: 0 };
                tagFrequencies[key].count++;
            }
        });

        const mostUsed = Object.values(tagFrequencies).sort((a, b) => b.count - a.count).slice(0, 6);
        
        tagsGridDiv.innerHTML = ''; // Limpa o "Calculando..."
        
        if (mostUsed.length === 0) {
            tagsGridDiv.innerHTML = '<p class="note">Nenhuma tag extra frequente.</p>';
            return;
        }

        mostUsed.forEach(tag => {
            const tagBtn = createTagGridItem(tag, currentProcessId, `Usada ${tag.count} vezes`);
            tagsGridDiv.appendChild(tagBtn);
        });
    });
}


// --- FUNÇÃO 2: TAGS RÁPIDAS (Design Grid) ---
function renderQuickTags(currentProcessId) {
    const tagsGridDiv = document.getElementById('tagsGridRapidas');
    if (!tagsGridDiv) return;

    tagsGridDiv.innerHTML = '<p>Carregando tags rápidas...</p>';

    // Adicionando CSS para grid (opcional, pode ser feito no popup.html)
    tagsGridDiv.style.display = 'grid';
    tagsGridDiv.style.gridTemplateColumns = 'repeat(auto-fit, minmax(100px, 1fr))';
    tagsGridDiv.style.gap = '8px';
    tagsGridDiv.style.marginTop = '10px';

    chrome.storage.local.get(PREDEFINED_TAGS_KEY, (result) => {
        if (chrome.runtime.lastError) {
            tagsGridDiv.innerHTML = '<p style="color: red;">Erro ao carregar tags do storage.</p>';
            return;
        }

        const predefinedTags = result[PREDEFINED_TAGS_KEY] || [];

        tagsGridDiv.innerHTML = '';

        if (predefinedTags.length === 0) {
            tagsGridDiv.innerHTML = '<p>Nenhuma tag rápida definida nas configurações.</p>';
            return;
        }

        predefinedTags.forEach(tag => {
            // Usa a mesma função de criação de item para manter o estilo consistente
            const tagBtn = createTagGridItem(tag, currentProcessId);
            tagsGridDiv.appendChild(tagBtn);
        });
    });
}

// --- FUNÇÃO 3: LISTA DETALHADA (Mantida no estilo de lista) ---
function renderTagsAppliedList(currentProcessId) {
    const tagsListDiv = document.getElementById('tagsList');
    if (!tagsListDiv) return;

    tagsListDiv.innerHTML = '<p>Carregando tags aplicadas...</p>';

    chrome.storage.local.get(STORAGE_KEY, (result) => {
        const allTags = result[STORAGE_KEY] || {};
        const tagsForThisProcess = [];

        Object.keys(allTags).forEach(tagInstanceId => {
            if (tagInstanceId.startsWith(currentProcessId + '-')) {
                tagsForThisProcess.push({
                    id: tagInstanceId,
                    name: allTags[tagInstanceId].name,
                    color: allTags[tagInstanceId].color
                });
            }
        });

        tagsListDiv.innerHTML = '';
        if (tagsForThisProcess.length === 0) {
            tagsListDiv.innerHTML = '<p class="note">Nenhuma tag aplicada a este processo.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.style.cssText = 'list-style: none; padding: 0; margin-top: 10px;';

        tagsForThisProcess.forEach(tag => {
            const li = document.createElement('li');
            li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;';
            li.className = 'tag-item';

            li.innerHTML = `
                <div style="display: flex; align-items: center; flex-grow: 1;" >
                    <span class="tag-color" style="background-color: ${tag.color}; width: 12px; height: 12px; border-radius: 50%; margin-right: 10px;"></span>
                    <span class="tag-name" style="font-weight: bold;">${tag.name}</span>
                </div>
                <span style="font-size: 11px; color: #aaa; margin-left: 10px;" title="ID de Instância Completo">${tag.id.split('-').pop()}</span>
            `;

            ul.appendChild(li);
        });

        tagsListDiv.appendChild(ul);
    });
}

// ------------------------------------------------------------------
// EXPOSIÇÃO GLOBAL
// ------------------------------------------------------------------
window.fillFormInputs = fillFormInputs;
window.renderTagsAppliedList = renderTagsAppliedList;
window.renderMostUsedTags = renderMostUsedTags;
window.renderQuickTags = renderQuickTags;