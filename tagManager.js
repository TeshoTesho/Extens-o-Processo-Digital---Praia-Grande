// Arquivo: tagManager.js (Lógica de FILTRAGEM, ALTERAÇÃO e EXCLUSÃO)

const STORAGE_KEY = 'processTags';

// =====================================================
// CARREGAMENTO INICIAL — GARANTE QUE NADA EXECUTE ANTES
// =====================================================

let TM_processId = null;
let TM_processNumber = null;
let TM_ready = false;

// Carrega processId e processNumber enviados pelo content.js
chrome.storage.local.get(["currentProcessId", "currentProcessNumber"], data => {
    TM_processId = data.currentProcessId;
    TM_processNumber = data.currentProcessNumber;

    console.log("TagManager recebeu:", TM_processId, TM_processNumber);

    TM_ready = true;

    // Se o DOM já carregou, podemos inicializar
    if (document.readyState === "complete" || document.readyState === "interactive") {
        initTagManager();
    }
});

// Se o storage demorar, só inicialize depois do DOM
document.addEventListener("DOMContentLoaded", () => {
    if (TM_ready) {
        initTagManager();
    }
});

// --- tagManager.js (Trecho Corrigido) ---

async function initTagManager() {
    if (!TM_processId) {
        console.error("TagManager ERRO: TM_processId não recebido.");
        return;
    }

    const data = await chrome.storage.local.get(["processData"]);
    const processInfo = data.processData ? data.processData[TM_processId] : null;

    if (processInfo && (processInfo.type === "manual" || String(TM_processId).startsWith("manual-"))) {
        const tagInputSection = document.getElementById("tagInputSection") || document.querySelector(".tag-controls");
        if (tagInputSection) {
            tagInputSection.style.display = "none";
            const alertMsg = document.createElement("div");
            alertMsg.className = "alert alert-info";
            alertMsg.innerText = "Este é um processo manual e não permite tags adicionais.";
            tagInputSection.parentNode.insertBefore(alertMsg, tagInputSection);
        }
    }

    loadAndRenderTags(TM_processId, TM_processNumber);

    // 1. CONFIGURAÇÃO ÚNICA DO BOTÃO "ADICIONAR NOVA TAG RÁPIDA"
    const openPopupBtn = document.getElementById("openPopupBtn");
    if (openPopupBtn) {
        // Remova qualquer listener antigo antes de adicionar (prevenção extra)
        openPopupBtn.replaceWith(openPopupBtn.cloneNode(true)); 
        const newBtn = document.getElementById("openPopupBtn");

        newBtn.addEventListener("click", e => {
            e.preventDefault();
            
            // Salva o ID antes de abrir o popup principal
            chrome.storage.local.set({ lastProcessId: TM_processId }, () => {
                chrome.runtime.sendMessage({
                    action: "openPopupWithProcess",
                    processId: TM_processId,
                    processNumber: TM_processNumber
                });
                
                // Fecha o gerenciador de tags para não confundir o usuário
                //window.close();
            });
        });
    }
}

// 2. LIMPEZA NA INICIALIZAÇÃO (Remova o bloco redundante do final do arquivo)
document.addEventListener('DOMContentLoaded', () => {
    // Agora o initTagManager cuida de tudo através do fluxo de storage.local.get
    // que você já tem no topo do arquivo.
    if (TM_ready) {
        initTagManager();
    }
});


// =========================================================================
// FUNÇÕES DE ALERTA (SweetAlert2) - Precisa que sweetalert2.min.js esteja na página
// =========================================================================

/**
 * Exibe uma notificação Toast.
 * @param {string} icon - Ícone do toast ('success', 'error', 'warning', 'info', 'question').
 * @param {string} title - Mensagem do toast.
 */
function showToast(icon, title) {
    if (typeof Swal === 'undefined') {
        console.error(`Swal não está definido. Toast de ${icon}: ${title}`);
        return;
    }
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
    Toast.fire({
        icon: icon,
        title: title
    });
}

/**
 * Exibe um alerta de confirmação centralizado e retorna uma Promise.
 * Utiliza swal.fire
 * @returns {Promise<boolean>} Retorna true se o usuário confirmar.
 */
function showConfirmation(title, text, confirmButtonText, icon = 'warning') {
    if (typeof Swal === 'undefined') {
        console.error(`Swal não está definido. Confirmação: ${title}`);
        return Promise.resolve(confirm(title + '\n' + text)); // Fallback
    }
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmButtonText,
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        return result.isConfirmed;
    });
}



// Função auxiliar para obter o ID do processo da URL
function getProcessIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('processId');
}

function getProcessNumber() {

    const spanElemento = document.getElementById('numero-processo');

    return spanElemento;
}

// -----------------------------------------------------------
// 1. CARREGAR E RENDERIZAR TAGS
// -----------------------------------------------------------

/**
 * Filtra e carrega tags do storage que pertencem ao ID do processo.
 * @param {string} processId - O ID base do processo (ex: "75350").
 */
function loadAndRenderTags(processId, processNumber) {
      
    const tagsContainer = document.getElementById('tagsContainer');

    tagsContainer.innerHTML = '<p>Carregando...</p>';
    document.getElementById('processTitle').textContent = `Gerenciar Tags - Processo ${processNumber} - ID: ${processId}`;

    chrome.storage.local.get(STORAGE_KEY, (result) => {
        const allTags = result[STORAGE_KEY] || {};
        const tagsForThisProcess = {};
        let tagsFoundCount = 0;

        // PONTO CRÍTICO: FILTRAGEM PELO ID-TIMESTAMP
        Object.keys(allTags).forEach(tagInstanceId => {
            // Verifica se a chave de instância começa com o ID do processo seguido por hífen
            if (tagInstanceId.startsWith(processId + '-')) {
                tagsForThisProcess[tagInstanceId] = allTags[tagInstanceId];
                tagsFoundCount++;
            }
        });

        if (tagsFoundCount === 0) {
            tagsContainer.innerHTML = '<p class="no-tags">Nenhuma tag encontrada para este processo.</p>';
        } else {
            renderTags(tagsForThisProcess);
        }
    });
}

/**
 * Renderiza a lista de tags na página.
 * @param {object} tags - Objeto onde a chave é o ID de instância (ID-TIMESTAMP) e o valor é {name, color}.
 */
function renderTags(tags) {
    const tagsContainer = document.getElementById('tagsContainer');
    tagsContainer.innerHTML = '';

    Object.keys(tags).forEach(tagInstanceId => {
        const tag = tags[tagInstanceId];

        const listItem = document.createElement('li');
        listItem.className = 'tag-item';
        listItem.setAttribute('data-tag-instance-id', tagInstanceId);
        listItem.classList.add('text-dark','bg-white');
        // --- Tag Info ---
        const tagInfo = document.createElement('div');
        tagInfo.className = 'tag-info';

        const colorCircle = document.createElement('span');
        colorCircle.className = 'tag-color';
        colorCircle.style.backgroundColor = tag.color;

        const tagName = document.createElement('span');
        tagName.className = 'tag-name text-dark';
        tagName.textContent = tag.name;

        const instanceIdText = document.createElement('span');
        instanceIdText.className = 'tag-instance-id';
        instanceIdText.textContent = `(${tagInstanceId.split('-')[1]})`; // Mostra só o timestamp

        tagInfo.appendChild(colorCircle);
        tagInfo.appendChild(tagName);
        tagInfo.appendChild(instanceIdText);

        // --- Ações (Botões) ---
        const actions = document.createElement('div');
        actions.className = 'tag-actions';

        const btnEdit = document.createElement('button');
        btnEdit.className = 'btn-edit';
        btnEdit.classList.add('bg-warning');
        btnEdit.innerHTML = '<i class="fa fa-edit"></i> Alterar';
        btnEdit.onclick = () => showEditForm(listItem, tagInstanceId, tag);

        const btnRemove = document.createElement('button');
        btnRemove.className = 'btn-remove';
        btnRemove.classList.add('bg-danger');
        btnRemove.innerHTML = '<i class="fa fa-trash"></i> Remover';
        btnRemove.onclick = () => removeTag(tagInstanceId);

        actions.appendChild(btnEdit);
        actions.appendChild(btnRemove);

        listItem.appendChild(tagInfo);
        listItem.appendChild(actions);

        tagsContainer.appendChild(listItem);
    });
}

// -----------------------------------------------------------
// 2. FORMULÁRIO DE EDIÇÃO (Lógica)
// -----------------------------------------------------------

// Arquivo: tagManager.js (Função showEditForm CORRIGIDA)
// Arquivo: tagManager.js (Função showEditForm CORRIGIDA)

let activeEditItem = null;
let activeEditInstanceId = null;

function showEditForm(listItem, tagInstanceId, tagData) {
    // 1. Cancele qualquer formulário ativo (se houver)
    if (activeEditItem && activeEditItem !== listItem) {
        cancelEdit();
    }

    // 2. Se o formulário já está visível para este item, cancele
    if (activeEditItem === listItem) {
        cancelEdit();
        return;
    }

    activeEditItem = listItem;
    activeEditInstanceId = tagInstanceId;

    // 3. Cria o formulário de edição (o contêiner principal)
    const form = document.createElement('div');
    form.className = 'edit-form bg-white text-dark';
    form.style.display = 'flex';

    // NOVO: Cria o contêiner para os inputs (usaremos display: flex no CSS)
    const inputGroup = document.createElement('div');
    inputGroup.className = 'edit-input-group';

    // Criação dos Inputs
    const nameInput = document.createElement('input');
    nameInput.className = 'bg-white text-dark'
    nameInput.type = 'text';
    nameInput.value = tagData.name;
    nameInput.id = `edit-name-${tagInstanceId}`;

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = tagData.color.startsWith('#') ? tagData.color : '#' + tagData.color;
    colorInput.id = `edit-color-${tagInstanceId}`;

    // Adiciona os inputs ao novo contêiner
    inputGroup.appendChild(nameInput);
    inputGroup.appendChild(colorInput);

    // Criação dos Botões
    const btnSave = document.createElement('button');
    btnSave.className = 'btn-save btn-primary';
    btnSave.textContent = 'Salvar Alteração';
    btnSave.onclick = () => saveTagEdit(tagInstanceId, nameInput.value, colorInput.value);

    const btnCancel = document.createElement('button');
    btnCancel.className = 'btn-cancel';
    btnCancel.textContent = 'Cancelar';
    btnCancel.onclick = cancelEdit;

    // Adiciona o grupo de inputs e os botões ao formulário principal
    form.appendChild(inputGroup);
    form.appendChild(btnSave);
    form.appendChild(btnCancel);

    // O formulário é anexado ao item da lista
    listItem.appendChild(form);
}

function cancelEdit() {
    if (activeEditItem) {
        const form = activeEditItem.querySelector('.edit-form');
        if (form) {
            form.remove();
        }
    }
    activeEditItem = null;
    activeEditInstanceId = null;
}

function saveTagEdit(tagInstanceId, newName, newColor) {
    if (!newName) {
        alert('O nome da tag não pode ser vazio.');
        return;
    }

    chrome.storage.local.get(STORAGE_KEY, (result) => {
        const allTags = result[STORAGE_KEY] || {};

        if (allTags[tagInstanceId]) {
            // Atualiza o objeto no storage
            allTags[tagInstanceId] = {
  ...allTags[tagInstanceId], // PRESERVA tudo
  name: newName,
  color: newColor
};

            chrome.storage.local.set({
                [STORAGE_KEY]: allTags
            }, () => {
                // 1. Recarrega a lista no Tag Manager
                const processId = getProcessIdFromUrl();
                const processNumber = TM_processNumber;
                if (processId) {
                    loadAndRenderTags(TM_processId, TM_processNumber);
                }

                // 2. Notifica a aba ativa para atualizar o DOM na página principal
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, (tabs) => {
                    if (tabs && tabs[0] && tabs[0].id) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'updateTag',
                            processoIdInstance: tagInstanceId,
                            nome: newName,
                            cor: newColor
                        });
                    }
                });

                cancelEdit();
            });
        }
    });
}

// -----------------------------------------------------------
// 3. REMOÇÃO (Lógica)
// -----------------------------------------------------------

function removeTag(tagInstanceId) {
    showConfirmation(
        'Confirmar Exclusão',
        `Tem certeza que deseja deletar esta tag?`,
        'Sim, Deletar Tag'
    ).then(isConfirmed => {
        if (!isConfirmed) return;

        chrome.storage.local.get(['processTags', 'processData'], (result) => {
            const allTags = result.processTags || {};
            const allProcessData = result.processData || {};
            
            const tagToDelete = allTags[tagInstanceId];
            if (!tagToDelete) return;

            const processId = tagToDelete.processId;
            const numeroProcesso = tagToDelete.processNumber || processId;

            // 1. Remove a tag alvo primeiro (na memória)
            delete allTags[tagInstanceId];

            // 2. VERIFICAÇÃO DE SEGURANÇA: 
            // Ainda existe alguma tag de Board vinculada a este processo?
            const remainsBoardTag = Object.values(allTags).some(t => 
                t.processId === processId && t.isBoardTag === true
            );

            // 3. LIMPEZA DOS DADOS DE BOARD
            // Se não sobrou nenhuma tag de board, resetamos o Kanban para este processo
            if (!remainsBoardTag) {
                if (allProcessData[processId]) {
                    console.log(`Limpando dados residuais do Kanban para o processo ${processId} (nenhuma tag de board restante).`);
                    delete allProcessData[processId];
                }
            }

            // 4. Salva o estado atualizado
            chrome.storage.local.set({
                processTags: allTags,
                processData: allProcessData
            }, () => {
                // Atualiza a lista no Tag Manager
                if (TM_processId) {
                    loadAndRenderTags(TM_processId, TM_processNumber);
                }

                // Notifica o content.js para atualizar a interface visual
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]?.id) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'updateTag',
                            processoIdInstance: tagInstanceId,
                            nome: null, // indica ao content para remover o elemento
                            successMessage: remainsBoardTag 
                                ? "Tag removida." 
                                : "Tag removida e dados do Kanban limpos (sem tags de board)."
                        });
                    }
                });

                showToast('info', `Tag removida com sucesso.`);
            });
        });
    });
}

function addNewTagToProcess(processId) {
    const tagNameInput = document.getElementById('newTagName');
    const tagColorInput = document.getElementById('newTagColor');

    const tagName = tagNameInput.value.trim();
    const tagColor = tagColorInput.value;

    if (!tagName) {
        alert('O nome da tag não pode estar vazio.');
        return;
    }

    // Cria uma nova instância com ID e timestamp
    const newTagInstanceId = `${processId}-${Date.now()}`;
    const tagData = {
        name: tagName,
        color: tagColor
    };

    chrome.storage.local.get(STORAGE_KEY, (result) => {
        const allTags = result[STORAGE_KEY] || {};
        allTags[newTagInstanceId] = tagData;

        chrome.storage.local.set({
            [STORAGE_KEY]: allTags
        }, () => {
            // 1. Recarrega e renderiza a lista no Gerenciador para mostrar a nova tag
            loadAndRenderTags(processId);

            // 2. Limpa o formulário de adição
            tagNameInput.value = '';

            // 3. Notifica a aba ativa para adicionar o elemento no DOM da página principal
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, (tabs) => {
                if (tabs && tabs[0] && tabs[0].id) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'addTagToProcess',
                        processoIdInstance: newTagInstanceId,
                        nome: tagData.name,
                        cor: tagData.color
                    });
                }
            });
        });
    });
}

// -----------------------------------------------------------
// 4. INICIALIZAÇÃO
// -----------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const processId = getProcessIdFromUrl();
    const processNumber = TM_processNumber;

    if (processId) {
        loadAndRenderTags(processId);

        // NOVO: Adiciona o listener ao botão que abre o popup
        const openPopupBtn = document.getElementById('openPopupBtn');
        if (openPopupBtn) {
            openPopupBtn.addEventListener('click', (e) => {
                e.preventDefault();

                // 1. Salva o ID do processo no storage
                chrome.storage.local.set({
                    lastProcessId: processId,
                }, () => {




                    chrome.runtime.sendMessage({
                        action: 'tagAddedOrUpdated',
                        processId: processId,
                        processNumber: TM_processNumber
                    });

                    // 2. Envia a mensagem para background.js abrir o popup
                    chrome.runtime.sendMessage({
                        action: 'openPopupWithProcess',
                        processId: processId,
                        processNumber: TM_processNumber
                    }, () => {
                        // 3. Fecha a janela do Tag Manager após um pequeno atraso de segurança
                        setTimeout(() => {
                            window.close();
                        }, 50); // 50ms é geralmente o suficiente
                    });
                });
            });
        }

    } else {
        document.getElementById('tagsContainer').innerHTML = '<p class="no-tags">Erro: ID do processo não especificado.</p>';
        document.getElementById('processTitle').textContent = 'Gerenciar Tags - ERRO';
    }
});


// ----------------------------------------------------------
// 5. ATUALIZAÇÃO AUTOMÁTICA
// ----------------------------------------------------------

/**
 * Escuta mensagens de outros popups/background para recarregar a lista
 * de tags se uma tag foi adicionada ou modificada para o processo atual.
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
    // Verifica se a mudança é no storage local e no objeto 'processTags'
    if (namespace === 'local' && changes.processTags) {

        // 1. Obtém o ID do processo que está sendo visualizado no Tag Manager
        const currentProcessId = getProcessIdFromUrl();
        if (!currentProcessId) return; // Sai se não houver ID

        const newTags = changes.processTags.newValue || {};

        // 2. CRÍTICO: Verifica se *qualquer* tag nova pertence ao processo atual.
        // Basta verificar se existe pelo menos uma chave que comece com o ID atual.
        const wasCurrentProcessUpdated = Object.keys(newTags).some(tagInstanceId =>
            tagInstanceId.startsWith(currentProcessId + '-')
        );

        // Se o processo atual foi afetado, recarrega a lista.
        if (wasCurrentProcessUpdated) {
            // loadAndRenderTags() precisa ser uma função global
            loadAndRenderTags(currentProcessId);
            console.log(`[Storage Changed] Tag Manager recarregado automaticamente para o Processo ID: ${currentProcessId}`);
        }
    }
});