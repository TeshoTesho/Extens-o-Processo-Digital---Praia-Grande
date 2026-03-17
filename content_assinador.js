// content_assinador.js
(function () {

    function isPastaUrl() {
        const url = window.location.href;
        const pastaBaseUrl = 'https://assinadordigitalexterno.praiagrande.sp.gov.br/';
        return url.startsWith(pastaBaseUrl);
    }

    const SIGNED_DOCUMENTS_KEY = "signedDocuments";

    // ==========================================================
    // FUNÇÃO TOAST SWEETALERT2
    // ==========================================================
    function showToast(icon, title) {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: "#2f2f2f",
            color: "#fff",
        });

        Toast.fire({ icon, title });
    }

    // ==========================================================
    // 1) PEGAR A URL REAL DO lista.html VIA BACKGROUND
    // ==========================================================
    chrome.runtime.sendMessage({ action: "getListaURL" }, (response) => {
        if (!isPastaUrl()) return;

        if (!response || !response.url) {
            console.error("❌ Não consegui obter a URL da lista.html via background.js");
            return;
        }

        const urlLista = response.url;

        function localizarMenu() {
            return (
                document.querySelector('.navbar-nav.ml-2') ||
                document.querySelector('.navbar-nav.ms-auto') ||
                document.querySelector('.navbar-nav.me-auto') ||
                document.querySelector('.navbar-nav') ||
                document.querySelector('ul.navbar-nav') ||
                null
            );
        }

        function inserirBotaoLista(urlLista) {
            if (!isPastaUrl()) return;

            const ul = localizarMenu();
            if (!ul) return false;

            if (document.getElementById("btnMinhaLista")) return true;

            const li = document.createElement("li");
            li.className = "nav-item";
            li.id = "btnMinhaLista";

            li.innerHTML = `
                <button 
                    id="btnOpenLista" 
                    class="ml-2 btn btn-outline-light fw-bold ml-2">
                    Minha Lista
                </button>
            `;

            ul.appendChild(li);

            document.getElementById("btnOpenLista").addEventListener("click", () => {
                chrome.runtime.sendMessage({ action: "openMinhaLista" });
            });

            return true;
        }

        function esperarMenu(urlLista) {
            const menu = localizarMenu();
            if (menu) {
                inserirBotaoLista(urlLista);
                return;
            }

            const observer = new MutationObserver(() => {
                const menu2 = localizarMenu();
                if (menu2) {
                    observer.disconnect();
                    inserirBotaoLista(urlLista);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }

        esperarMenu(urlLista);
    });

    // ==========================================================
    // 3) PARSE DE DESCRIÇÃO
    // ==========================================================
    function parseDescricaoArquivo(texto) {
        const original = texto.trim();

        const tiposDocumento = [
            "termo de ata",
            "termo de prorrogação",
            "termo de ajuste",
            "termo de rescisão",
            "contrato",
            "aditivo",
            "apostilamento"
        ];

        let tipoDocumento = null;
        let resto = original;

        for (const tipo of tiposDocumento) {
            const re = new RegExp("^" + tipo.replace(/ /g, "\\s+"), "i");
            const found = resto.match(re);
            if (found) {
                tipoDocumento = found[0];
                resto = resto.replace(re, "").trim();
                break;
            }
        }

        const regexProcesso = /\b(\d{3,6}-\d{2}|\d{4}\/\d{2}|\d{2}\.\d{3}\/\d{4})\b/;

        const matchProc = resto.match(regexProcesso);
        if (!matchProc) {
            return {
                tipoDocumento,
                empresa: null,
                processo: null,
                objeto: resto
            };
        }

        const processo = matchProc[0];
        const [antesProcesso, depoisProcesso] = resto.split(processo);

        let empresa = antesProcesso.trim();
        if (empresa.includes("-")) {
            const partes = empresa.split("-");
            empresa = partes[partes.length - 1].trim();
        }

        const objeto = (depoisProcesso || "").trim();

        return {
            tipoDocumento: tipoDocumento || null,
            empresa: empresa || null,
            processo: processo || null,
            objeto: objeto || null
        };
    }

    // ==========================================================
    // 4) EXTRATOR PRINCIPAL
    // ==========================================================


    function extractDocumentData() {

        const codigoInput = document.querySelector("#CodigoVerificador");
        const codigo = codigoInput ? codigoInput.value.trim() : null;

        let linkCorreto = window.location.href;
        if (codigo) {
            linkCorreto = `https://assinadordigitalexterno.praiagrande.sp.gov.br/assinar/${codigo}?cv=true`;
        }

        const span = document.querySelector("p[data-id] span");
        if (!span) return null;

        let nomeArquivo = span.textContent.trim().replace(/^Nome:\s*/i, "");

        const pageText = document.body.innerText;
        const procMatch = pageText.match(/(\d{3,6}-\d{2}|\d{4}\/\d{2}|\d{2}\.\d{3}\/\d{4})/);
        const processo = procMatch ? procMatch[1] : "Não Encontrado";

        const parsed = parseDescricaoArquivo(`${nomeArquivo} ${processo}`);

        const idFinal = codigo || Date.now().toString();

        return {
            id: idFinal,
            link: linkCorreto,
            tipo: parsed.tipoDocumento || "Não Definido",
            empresa: parsed.empresa || "Não Identificada",
            processo: parsed.processo || processo,
            objeto: parsed.objeto || nomeArquivo,
            dataSalvo: new Date().toISOString()
        };
    }
    
    function extractDocumentDataFromLi(li) {

    const codigoInput = li.querySelector('input[name="CodigoVerificador"]');
    const codigo = codigoInput ? codigoInput.value.trim() : null;
    if (!codigo) return null;

    const spanNome = li.querySelector('p[name="arquivo"] span');
    if (!spanNome) return null;

    const nomeArquivo = spanNome.textContent
        .replace(/^Nome:\s*/i, "")
        .trim();

    const parsed = parseDescricaoArquivo(nomeArquivo);

    const link = `https://assinadordigitalexterno.praiagrande.sp.gov.br/assinar/${codigo}?cv=true`;

    return {
        id: codigo,
        link,
        tipo: parsed.tipoDocumento || "Não Definido",
        empresa: parsed.empresa || "Não Identificada",
        processo: parsed.processo || "Não Encontrado",
        objeto: parsed.objeto || nomeArquivo,
        dataSalvo: new Date().toISOString()
    };
}

function salvarTodosOsDocumentosDaLista() {
    const itens = document.querySelectorAll("li.doc-container");

    itens.forEach(li => {
        const docData = extractDocumentDataFromLi(li);
        if (docData) {
            saveDocument(docData);
        }
    });
}

function observarListaDeDocumentos() {
    const lista = document.querySelector("#docList");
    if (!lista) return;

    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (
                    node.nodeType === 1 &&
                    node.matches("li.doc-container")
                ) {
                    const docData = extractDocumentDataFromLi(node);
                    if (docData) saveDocument(docData);
                }
            });
        });
    });

    observer.observe(lista, {
        childList: true
    });
}

    // ==========================================================
    // 5) SALVAR DOCUMENTO  (AGORA COM TOAST)
    // ==========================================================
    async function saveDocument(documentData) {

        try {
            const result = await chrome.storage.local.get([SIGNED_DOCUMENTS_KEY]);
            let documents = result[SIGNED_DOCUMENTS_KEY] || [];

            if (documents.some(doc => doc.id === documentData.id)) {
                console.log("ℹ Documento já salvo anteriormente.");

                // 🔵 Toast: já existia
                showToast("info", "Este documento já está salvo!");

                return;
            }

            documents.push(documentData);
            documents.sort((a, b) => new Date(b.dataSalvo) - new Date(a.dataSalvo));
            documents = documents.slice(0, 50);

            await chrome.storage.local.set({ [SIGNED_DOCUMENTS_KEY]: documents });

            console.log("🟢 Documento salvo:", documentData);

            // 🟢 Toast de sucesso
            showToast("success", "Documento salvo com sucesso!");

        } catch (error) {
            console.error("❌ Erro ao salvar:", error);

            // 🔴 Toast de erro
            showToast("error", "Erro ao salvar documento!");
        }
    }
const codigosProcessados = new Set();

function observarMultiplosUploads() {
    const codigoInput = document.querySelector("#CodigoVerificador");
    if (!codigoInput) return;

    // salva o valor inicial, se existir
    if (codigoInput.value) {
        codigosProcessados.add(codigoInput.value);
        const docData = extractDocumentData();
        if (docData) saveDocument(docData);
    }

    const observer = new MutationObserver(() => {
        const novoCodigo = codigoInput.value?.trim();
        if (!novoCodigo) return;

        if (codigosProcessados.has(novoCodigo)) return;

        codigosProcessados.add(novoCodigo);

        const docData = extractDocumentData();
        if (docData) saveDocument(docData);
    });

    observer.observe(codigoInput, {
        attributes: true,
        attributeFilter: ["value"]
    });
}

setTimeout(() => {
    if (!isPastaUrl()) return;

    salvarTodosOsDocumentosDaLista();
    observarListaDeDocumentos();

}, 800);

})();
