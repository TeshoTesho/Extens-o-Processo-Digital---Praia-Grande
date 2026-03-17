// Arquivo: popup.js (VERSÃO FINAL CORRIGIDA)

// =========================================================================
// FUNÇÕES DE ALERTA (SweetAlert2)
// =========================================================================
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

function sortPredefinedTags(tags) {
  return [...tags].sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : 999;
    const orderB = typeof b.order === 'number' ? b.order : 999;
    return orderA - orderB;
  });
}

// =========================================================================
// FUNÇÃO DE SALVAR GENÉRICA (Usada pelo botão "Salvar" e por Quick Tags)
// =========================================================================
function saveTag(id, name, color, processNumber) {
    if (!id || !name) {
        showToast('warning', 'ID e nome da tag são obrigatórios.');
        return;
    }

    const tagInstanceId = `${id}-${Date.now()}`;
    const finalColor = color || '#1976d2';


   chrome.storage.local.get(
      ['processTags', 'predefinedTags'],
      ({ processTags = {}, predefinedTags = [] }) => {
          const predefined = predefinedTags.find(t => t.name === name);
        const isBoardTag = predefined?.showOnBoard === true;

        predefinedTags = sortPredefinedTags(predefinedTags);
        // CRÍTICO: Inclui o novo campo 'processNumber' ao salvar
        processTags[tagInstanceId] = {
            name,
            color: finalColor,
            processNumber,
             isBoardTag 
        };

        chrome.storage.local.set({
            processTags,
            lastProcessId: id
        }, () => {
            // Notifica content.js
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, (tabs) => {
                if (tabs && tabs[0] && tabs[0].id) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'addTagToProcess',
                        processoIdInstance: tagInstanceId,
                        nome: name,
                        cor: finalColor,
                        processNumber: processNumber, // <-- Envia o número do processo para o content.js
                        successMessage: `Tag "${name}" salva com sucesso para o processo ${processNumber || id}.`
                    });
                }
            });

            chrome.runtime.sendMessage({
                action: 'tagAddedOrUpdated',
                processId: id
            }).catch(e => console.log('Erro ao enviar mensagem de atualização global:', e));

            window.close();
        });
    });
   
}


document.addEventListener('DOMContentLoaded', () => {
    const inputId = document.getElementById('processId');
    const inputNumber = document.getElementById('processNumber');
    const inputName = document.getElementById('tagName');
    const inputColor = document.getElementById('tagColor');
    const saveBtn = document.getElementById('saveTag');

    let currentProcessId = '';
    let currentProcessNumber = ''; // <-- Variável de estado para o número

    // Expondo globalmente para listTags.js acessar
    window.currentProcessId = currentProcessId;
    window.currentProcessNumber = currentProcessNumber;

    // 1. Listener para receber os dados do processo do background.js
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.action === 'setProcessData') {
            const id = String(msg.processId);
            const number = String(msg.processNumber);

            // Atualiza as variáveis de estado
            currentProcessId = id;
            currentProcessNumber = number; // <-- Armazenado aqui!


            // Atualiza globais também
            window.currentProcessId = id;
            window.currentProcessNumber = number;

            // Preenche os inputs
            inputId.value = id;
            if (inputNumber) {
                inputNumber.value = number;
            }

            inputId.readOnly = true;

            // Chama as funções de renderização apenas APÓS receber o ID
            if (window.renderMostUsedTags && window.renderQuickTags) {
                window.renderMostUsedTags(id);
                window.renderQuickTags(id);
            }
            return false;
        }

        // Listener para recarregar as tags rápidas
        if (msg.action === 'predefinedTagsUpdated' && window.renderQuickTags && currentProcessId) {
            window.renderQuickTags(currentProcessId);
            window.renderMostUsedTags(currentProcessId);
            return false;
        }
    });


    // 2. Listener do botão "Salvar" 
    saveBtn.addEventListener('click', () => {
        const id = currentProcessId || inputId.value.trim();
        const name = inputName.value.trim();
        const color = inputColor.value;
        const number = currentProcessNumber; // Pega o número da variável de estado

        // Chama a função de salvar genérica
        saveTag(id, name, color, number);
    });

    // 3. CRÍTICO: EXPOE A FUNÇÃO quickSaveTag para listTags.js
    // Esta função usa o currentProcessNumber do escopo do popup.js
   window.quickSaveTag = (id, name, color, processNumber) => {
    saveTag(id, name, color, processNumber);
};

});