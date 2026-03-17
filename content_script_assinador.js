// content_script_assinador.js - Versão Otimizada com Múltiplos Seletores

/**
 * Função para capturar os dados da tabela da lista visível.
 */
function captureListData() {
    console.log("[ContentScript] Tentando capturar dados da lista...");

    // Seletor A: Classe comum do SharePoint antigo (sua tentativa original)
    // Seletor B: Tabela dentro de um WebPart com o GUID da sua lista (Mais específico e forte)
    const listTable = document.querySelector(
        `table.ms-listviewtable, 
         div[id*="DA67FC64-1B63-4608-B859-8DE4BC9B1FD8"] table`
    );

    if (!listTable) {
        console.error("[ContentScript] Tabela de documentos não encontrada. Seletor DOM incorreto. Tente inspecionar o elemento manualmente.");
        return null;
    }
    
    // Procura linhas que representam itens (geralmente tr[iid])
    const rows = listTable.querySelectorAll('tr[iid]'); 
    const documents = [];
    
    if (rows.length === 0) {
        console.log("[ContentScript] Nenhuma linha de item ('tr[iid]') encontrada na tabela.");
    }

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');

        if (cells.length === 0) return; 
        
        // ⚠️ CRÍTICO: Verifique o índice da coluna do TÍTULO
        const titleCell = cells[2]; 

        if (titleCell) {
            const itemID = row.getAttribute('iid');
            const title = titleCell.textContent.trim();
            const linkElement = titleCell.querySelector('a');
            const documentLink = linkElement ? linkElement.href : null;

            documents.push({
                ID: itemID,
                Title: title,
                Link_x0020_Documento: documentLink
            });
        }
    });

    console.log(`[ContentScript] Capturados ${documents.length} documentos da tabela.`);
    return documents;
}

// -----------------------------------------------------
// CHAMADA E COMUNICAÇÃO (O RESTANTE DO SCRIPT)
// -----------------------------------------------------

const capturedData = captureListData();

if (capturedData && capturedData.length > 0) {
    chrome.runtime.sendMessage({
        action: "dataCaptured",
        documents: capturedData
    });
} else {
    chrome.runtime.sendMessage({
        action: "captureFailed"
    });
}