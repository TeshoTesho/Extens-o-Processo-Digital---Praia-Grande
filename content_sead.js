    function isPastaUrl() {
        const url = window.location.href;
        const pastaBaseUrl = 'https://assinadordigitalexterno.praiagrande.sp.gov.br/';
        return url.startsWith(pastaBaseUrl);
    }

// ======================================================
// FUNÇÃO: Aguardar até encontrar um campo no DOM real
// ======================================================
function waitField(originalId, timeout = 8000) {
    return new Promise((resolve) => {
        const start = Date.now();

        const timer = setInterval(() => {
            const el = document.querySelector(`[originalid="${originalId}"]`);

            if (el) {
                clearInterval(timer);
                resolve(el);
            }

            if (Date.now() - start > timeout) {
                clearInterval(timer);
                resolve(null);
            }
        }, 200);
    });
}

// Impede execução duplicada
let preenchimentoExecutado = false;

// ======================================================
// Marcar Secretarias
// ======================================================
/**
 * Função auxiliar para criar uma pausa assíncrona.
 * @param {number} ms - Milissegundos para esperar.
 */
 /**
 * Função auxiliar para criar uma pausa assíncrona.
 * @param {number} ms - Milissegundos para esperar.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Marca os checkboxes correspondentes aos setores, adicionando um atraso de 500ms entre cada marcação.
 * Restaura 'cb.checked = true' e adiciona evento 'input' para máxima compatibilidade.
 * @param {HTMLElement} container - O elemento pai que contém os checkboxes.
 * @param {string[]} setores - Array de strings com os valores dos setores a serem marcados.
 */
async function marcarSetores(container, setores) {
    // Busca inputs com valor definido (evita placeholders)
    const checkboxes = container.querySelectorAll("input[type='checkbox'][value]");

    // Itera sobre cada setor que precisa ser marcado
    for (const setor of setores) {
        let marcado = false;

        // Itera sobre todos os checkboxes disponíveis
        for (const cb of checkboxes) {
            const title = cb.getAttribute("title")?.trim();
            const value = cb.getAttribute("value")?.trim();

            if (title === setor || value === setor) {
                
                // 1. REFORÇO OBRIGATÓRIO: Força o estado do DOM
                cb.checked = true; 
                
                // 2. Foca no elemento (como feito antes, ajuda na inicialização do script nativo)
                cb.focus();

                // 3. Simula a entrada de dados (INPUT) antes do click/change
                // Isso pode ser o que o InfoPath está esperando para detectar a mudança.
                cb.dispatchEvent(new Event("input", { bubbles: true })); 
                
                // 4. Simula o clique para acionar a função nativa do SharePoint
                cb.dispatchEvent(new Event("click", { bubbles: true }));
                
                // 5. Simula a mudança (CHANGE)
                cb.dispatchEvent(new Event("change", { bubbles: true }));

                console.log("🟢 Setor marcado:", setor);
                marcado = true;

                // Quebra o loop interno para ir para o próximo setor
                break;
            }
        }
        
        if (marcado) {
            // Atraso de 500ms
            await sleep(300);
        } else {
            console.warn(`Setor não encontrado: ${setor}`);
        }
    }
}


// ======================================================
// LISTENER PRINCIPAL
// ======================================================
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    if (msg.action !== "preencher_sead") return;

    if (preenchimentoExecutado) {
        console.log("⚠ Ignorando: preenchimento já executado.");
        // Se a execução for ignorada, você ainda precisa responder se retornou 'true' antes,
        // mas como você faz um 'return' antecipado, você evita o 'return true' no final.
        // A maneira mais segura de tratar este caso é NÃO retornar true E responder imediatamente:
        sendResponse({ status: "ignorado", detalhes: "preenchimento já executado" });
        return; 
    }
    
    preenchimentoExecutado = true;
    console.log("🔵 Mensagem recebida:", msg);

    // 🔴 PASSO 1: MOSTRA O BLOQUEIO DE TELA
    showLoadingOverlay();

    // ** PASSO 1: Chamada Assíncrona que Recebe sendResponse **
    (async () => {
        try {
            // Campos reais do InfoPath
            const idTitulo = "V1_I1_T1";
            const idLink = "V1_I1_T2";
            const idCheckboxes = "V1_I1_MSC8";
            const idCheckboxes2 = "V1_I1_MSC9"; // Novo ID do campo

            console.log("⏳ Aguardando campos do formulário...");









            // Aguarda e preenche os campos principais
            const tituloEl = await waitField(idTitulo);
            const linkEl = await waitField(idLink);

            if (!tituloEl) throw new Error("❌ Campo TÍTULO não encontrado");
            if (!linkEl) throw new Error("❌ Campo LINK não encontrado");

            // Preenchimento estável
            preencherCampo(tituloEl, msg.titulo);
            preencherCampo(linkEl, msg.link);
            
             // Lógica de marcação
        // 1. Captura a primeira lista (V1_I1_MSC8) e marca
    const listaEl = await waitField(idCheckboxes);
    
    if (listaEl && msg.setores?.length) {
        await marcarSetores(listaEl, msg.setores); 
    }
    
    // 2. RECUPERA A SEGUNDA LISTA APÓS A PRIMEIRA TER SIDO MARCADA
    // (Isso garante que, se o DOM mudou, pegamos o elemento atualizado)
    const listaEl2 = await waitField(idCheckboxes2); 
    
    // 3. Marca a segunda lista
    if (listaEl2 && msg.setores?.length) {
        await marcarSetores(listaEl2, msg.setores); 
    }

        console.log("🟢 Preenchido com sucesso!");

            // ** PASSO 2: CHAMA sendResponse EM CASO DE SUCESSO **
            sendResponse({ status: "sucesso", titulo: msg.titulo });

        } catch (error) {
            console.error("❌ Erro durante o preenchimento:", error.message);
            
            // ** PASSO 3: CHAMA sendResponse EM CASO DE ERRO **
            sendResponse({ status: "erro", detalhes: error.message });
        } finally {
            // 🟢 GARANTE QUE O OVERLAY SERÁ REMOVIDO NO FINAL
            hideLoadingOverlay();
        }
    })();

    // ** PASSO 4: Retorna true para manter o canal aberto **
    return true; 
});


// ======================================================
// Preenche o campo de forma estável (InfoPath é chato)
// ======================================================
function preencherCampo(campo, valor) {
    campo.value = valor;

    campo.dispatchEvent(new Event("input", { bubbles: true }));
    campo.dispatchEvent(new Event("change", { bubbles: true }));
    campo.dispatchEvent(new Event("blur", { bubbles: true }));

    console.log("🟢 Preenchido:", campo.getAttribute("originalid"), valor);

    // Refaz preenchimento caso InfoPath recrie o DOM
    setTimeout(() => {
        const originalId = campo.getAttribute("originalid");
        const novoCampo = document.querySelector(`[originalid="${originalId}"]`);
        if (!novoCampo) return;

        novoCampo.value = valor;
        novoCampo.dispatchEvent(new Event("input", { bubbles: true }));
        novoCampo.dispatchEvent(new Event("change", { bubbles: true }));
        novoCampo.dispatchEvent(new Event("blur", { bubbles: true }));

        console.log("🟢 Valor reforçado:", originalId);
    }, 1000);
}



// ======================================================
// FUNÇÕES DE BLOQUEIO DE TELA
// ======================================================

function showLoadingOverlay(message = "Preenchendo formulário automaticamente...") {
    const overlay = document.createElement('div');
    overlay.id = 'extension-loading-overlay';
    
    // Adiciona o CSS do overlay (se não estiver em um arquivo CSS separado)
    const style = document.createElement('style');
    style.textContent = `
        #extension-loading-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.6); z-index: 99999; 
            display: flex; justify-content: center; align-items: center;
            flex-direction: column; color: white; font-size: 1.2rem;
            font-family: Arial, sans-serif; text-align: center;
        }
        #extension-loading-overlay .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #4CAF50; border-radius: 50%;
            width: 50px; height: 50px; animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    overlay.appendChild(style);

    overlay.innerHTML += `<div class="spinner"></div><p>${message}</p>`;
    document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('extension-loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}