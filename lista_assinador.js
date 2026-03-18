
// ================================================
// lista_assinador.js — versão corrigida
// ================================================
let tooltipRetryCount = 0;
const MAX_RETRIES = 15; 

// ================================
// IndexedDB — Cache da lista pesada
// ================================
const DB_NAME = "assinadorDB";
const DB_VERSION = 1;
const STORE_DOCS = "documentos";
const STORE_META = "meta";

const urlParams = new URLSearchParams(window.location.search);
const termoPesquisado = urlParams.get('busca');

if (termoPesquisado) {
    //console.log("O usuário pesquisou por:", termoPesquisado);
    document.title = termoPesquisado + " Documentos a Assinar";
    // Aqui você executa a lógica para filtrar sua lista
}

function abrirDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;

            if (!db.objectStoreNames.contains(STORE_DOCS)) {
                db.createObjectStore(STORE_DOCS, { keyPath: "ID" });
            }

            if (!db.objectStoreNames.contains(STORE_META)) {
                db.createObjectStore(STORE_META, { keyPath: "key" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function salvarListaCache(lista) {
    const db = await abrirDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_DOCS, STORE_META], "readwrite");
        const storeDocs = tx.objectStore(STORE_DOCS);
        const storeMeta = tx.objectStore(STORE_META);

        for (const item of lista) {
            storeDocs.put(item);
        }

        storeMeta.put({
            key: "lastUpdate",
            value: Date.now()
        });

        tx.oncomplete = () => {
            console.log(`💾 Cache salvo com sucesso (${lista.length} itens)`);
            resolve();
        };

        tx.onerror = () => {
            console.error("❌ Erro ao salvar cache IndexedDB", tx.error);
            reject(tx.error);
        };
    });
}
async function lerListaCache() {
    const db = await abrirDB();

    return new Promise((resolve) => {
        const tx = db.transaction(STORE_DOCS, "readonly");
        const store = tx.objectStore(STORE_DOCS);
        const req = store.getAll();

        req.onsuccess = () => {
            console.log(`📦 Cache lido: ${req.result.length} itens`);
            resolve(req.result || []);
        };

        req.onerror = () => {
            console.warn("⚠️ Falha ao ler cache");
            resolve([]);
        };
    });
}


function initializeTooltips() {
    // Busca todos os elementos que deveriam ser tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');

    // Tenta usar a classe Tooltip do Bootstrap
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        tooltipRetryCount = MAX_RETRIES; // Sucesso: impede novas tentativas
        
        // Inicializa os tooltips
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        // console.log("✅ Tooltips inicializados com sucesso.");
        return;

    } else if (tooltipRetryCount < MAX_RETRIES) {
        // Tenta novamente em 200ms
        tooltipRetryCount++;
        setTimeout(initializeTooltips, 200);
        
    } else {
        // Falha após todas as tentativas
        console.error("❌ Erro: Bootstrap JS Tooltip class não está disponível.");
    }
}

const documentsList = document.getElementById("documents-list");
const loadingModal = document.getElementById("loading-modal"); // 🚨 NOVO: Referência ao modal
const countDocsElement = document.getElementById("countDocs"); // 🚨 NOVO: Referência ao elemento de contagem
// variáveis globais
let todosDocumentos = []; // documentos usados para os cards (filtrados do assinador)
let listaBusca = [];      // lista completa usada pela busca (10k)

// ENDPOINT OFICIAL (lista do assinador)
const API_URL =
"https://www.intra.pg/SEAD/_api/web/lists(guid'DA67FC64-1B63-4608-B859-8DE4BC9B1FD8')/items" +
"?$filter=Finalidado eq false" +
"&$select=Title,Link_x0020_Documento,ID,ContentType/Id,Contagem,Concluidos,Categoria,Locais,ContagemSelecionados,Calculado" +
"&$expand=ContentType" +
"&$top=30000";
console.log(API_URL);
// Endpoint para busca completa (10k)
const SEARCH_ENDPOINT =
"https://www.intra.pg/sead/_api/web/lists/getbyID('da67fc64-1b63-4608-b859-8de4bc9b1fd8')/items?$top=30000";


// Contêiner onde será exibida a lista (cards)
const secretarias = [
    { abreviacao: "GP", secretaria: "Gabinete do Prefeito", nome: "REINALDO MOREIRA BRUNO", cargo: "Secretário Municipal Geral de Gabinete do Prefeito", cpf: "837.438.808-06", texto: "titular da Secretaria Geral de Gabinete do Prefeito, por atribuição conferida através do artigo 12-A" },
    { abreviacao: "SEG", secretaria: "Secretaria de Governo", nome: "CASSIO DE CASTRO NAVARRO", cargo: "Secretário Municipal de Governo", cpf: "272.459.998-56", texto: "titular da Secretaria de Governo, por atribuição conferida através do artigo 22, inciso VIII" },
    { abreviacao: "SEPLAN", secretaria: "Secretaria de Planejamento", nome: "JOSIE YABUTA DE LIMA HOLLANDA", cargo: "Secretária Municipal de Planejamento", cpf: "300.105.098-52", texto: "titular da Secretaria de Planejamento, por atribuição conferida através do artigo 25, inciso XV" },
    { abreviacao: "SEASP", secretaria: "Secretaria de Assuntos de Segurança Pública", nome: "MAURICIO VIEIRA IZUMI", cargo: "Secretário Municipal de Assuntos de Segurança Pública", cpf: "130.501.278-05", texto: "titular da Secretaria de Assuntos de Segurança Pública, por atribuição conferida através do artigo 28, inciso XIII" },
    { abreviacao: "SEAD", secretaria: "Secretaria de Administração", nome: "RONALDO FERREIRA DE ALCÂNTARA", cargo: "Secretário Municipal de Administração Interino", cpf: "034.982.008-28", texto: "Secretário Municipal de Administração Interino, por atribuição conferida através do inciso XVIII do artigo 31" },
    { abreviacao: "PROGEM", secretaria: "Procuradoria Geral do Município", nome: "GLAUCIA ANTUNES ALVAREZ", cargo: "Procuradora Geral do Município", cpf: "133.887.368-71", texto: "titular da Procuradoria Geral do Município, por atribuição conferida através do artigo 34, inciso XIX" },
    { abreviacao: "SEFIN", secretaria: "Secretaria de Finanças", nome: "CRISTIANO DE MOLA", cargo: "Secretário Municipal de Finanças", cpf: "291.045.598-00", texto: "titular da Secretaria de Finanças, por atribuição conferida através do artigo 40, inciso XX" },
    { abreviacao: "SEAS", secretaria: "Secretaria de Assistência Social", nome: "GISELE DOMINGUES", cargo: "Secretária Municipal de Assistência Social", cpf: "091.127.228-39", texto: "titular da Secretaria de Assistência Social, por atribuição conferida através do artigo 45, inciso IV" },
    { abreviacao: "SEDUC", secretaria: "Secretaria de Educação", nome: "PATRICIA CONCEIÇÃO ALMEIDA DIAS", cargo: "Secretária Municipal de Educação", cpf: "199.354.948-02", texto: "titular da Secretaria de Educação, por atribuição conferida através do artigo 48, inciso XXXI" },
    { abreviacao: "SESAP", secretaria: "Secretaria de Saúde Pública", nome: "JOSÉ ISAIAS COSTA LIMA", cargo: "Secretário Municipal de Saúde Pública", cpf: "318.588.378-04", texto: "titular da Secretaria Municipal de Saúde Pública, por atribuição conferida através do artigo 51, inciso XIX" },
    { abreviacao: "SEURB", secretaria: "Secretaria de Urbanismo", nome: "LUÍS FERNANDO FÉLIX DE PAULA", cargo: "Secretário Municipal de Urbanismo", cpf: "133.741.818-80", texto: "titular da Secretaria de Urbanismo, por atribuição conferida através do artigo 54, inciso X" },
    { abreviacao: "SEMA", secretaria: "Secretaria de Meio Ambiente", nome: "VALDIR PEREIRA RAMOS FILHO", cargo: "Secretário Municipal de Meio Ambiente", cpf: "312.019.218-05", texto: "titular da  Secretaria de Meio Ambiente, por atribuição conferida através do artigo 57, inciso IV" },
    { abreviacao: "SEOP", secretaria: "Secretaria de Obras Públicas", nome: "ELOISA OJEA GOMES TAVARES", cargo: "Secretária Municipal de Obras Públicas", cpf: "080.557.808-03", texto: "titular da Secretaria de Obras Públicas, por atribuição conferida através do artigo 60, inciso XII" },
    { abreviacao: "SEHAB", secretaria: "Secretaria de Habitação", nome: "FABRÍCIO MENEZES DE PAULA", cargo: "Secretário Municipal de Habitação", cpf: "270.442.408-01", texto: "titular da Secretaria de Habitação, por atribuição conferida através do artigo 63, inciso V" },
    { abreviacao: "SESURB", secretaria: "Secretaria de Serviços Urbanos", nome: "SORAIA MOURÃO MILAN", cargo: "Secretária Municipal de Serviços Urbanos", cpf: "134.045.568-44", texto: "titular da Secretaria de Serviços Urbanos, por atribuição conferida através do artigo 66, inciso XII" },
    { abreviacao: "SETRAN", secretaria: "Secretaria de Trânsito", nome: "MARCELINO SANTOS GOMES", cargo: "Secretário Municipal de Trânsito", cpf: "169.600.188-97", texto: "titular da Secretaria de Trânsito, por atribuição conferida através do artigo 69, inciso XXX" },
    { abreviacao: "SETRANSP", secretaria: "Secretaria de Transportes", nome: "LEANDRO AVELINO RODRIGUES CRUZ", cargo: "Secretário Municipal de Transportes", cpf: "266.208.828-11", texto: "titular da Secretaria de Transportes, por atribuição conferida através do artigo 72, inciso V" },
    { abreviacao: "SEAI", secretaria: "Secretaria de Assuntos Institucionais", nome: "JOÃO ALVES CORREA NETO", cargo: "Secretário Municipal de Assuntos Institucionais", cpf: "288.643.208-30", texto: "titular da Secretaria de Assuntos Institucionais, por atribuição conferida através do artigo 75, inciso VI" },
    { abreviacao: "SECTUR", secretaria: "Secretaria de Cultura e Turismo", nome: "MAURÍCIO DA SILVA PETIZ", cargo: "Secretário Municipal de Cultura e Turismo", cpf: "032.164.678-99", texto: "titular da Secretaria de Cultura e Turismo, por atribuição conferida através do artigo 78, inciso XXXVII" },
    { abreviacao: "SEEL", secretaria: "Secretaria de Esporte e Lazer", nome: "RODRIGO SANTANA", cargo: "Secretário Municipal de Esporte e Lazer", cpf: "287.067.718-90", texto: "titular da Secretaria de Esporte e Lazer, por atribuição conferida através do artigo 81, inciso XXVI" },
    { abreviacao: "SEDI", secretaria: "Secretaria de Diversidade e Inclusão", nome: "VERA LUCIA FIGUEIREDO BENICIO", cargo: "Secretária Municipal de Diversidade e Inclusão", cpf: "018.104.628-86", texto: "titular da Secretaria de Diversidade e Inclusão Social, por atribuição conferida através do artigo 82, inciso XIV" },
    { abreviacao: "SEPEE", secretaria: "Secretaria de Projetos Especiais e Estratégicos", nome: "LUCAS MOURÃO GLEREAN", cargo: "Secretário Municipal de Projetos Especiais e Estratégicos", cpf: "486.093.138-67", texto: "titular da Secretaria de Projetos Especiais e Estratégicos, por atribuição conferida através do inciso XII do artigo 82 B" },
    { abreviacao: "Ações da Cidadania", secretaria: "Secretaria de Ações da Cidadania", nome: "CLAUDINO PACHECO FILHO", cargo: "Subsecretário de Ações da Cidadania", cpf: "058.198.678-40", texto: "titular da Subsecretaria de Ações da Cidadania, por atribuição conferida através do artigo 19" },
    { abreviacao: "Assuntos da Juventude", secretaria: "Secretaria de Assuntos da Juventude", nome: "AUGUSTO ALEXANDRE VARGAS CAMARGO SCHELL", cargo: "Subsecretário Municipal de Assuntos da Juventude", cpf: "345.773.568-99", texto: "titular da Subsecretaria de Assuntos da Juventude, por atribuição conferida através do artigo 19" },
    { abreviacao: "Adm Geral do Gabinete", secretaria: "Secretaria de Administração Geral do Gabinete", nome: "MARIA CAROLINA DONDON SALUM SILVEIRA", cargo: "Subsecretária de Administração da Secretaria Geral do Gabinete", cpf: "277.322.348-98", texto: "titular da Subsecretaria de Administração da Secretaria Geral do Gabinete, por atribuição conferida através do artigo 19" },
    { abreviacao: "Controle Interno", secretaria: "Secretaria de Controle Interno", nome: "ERIKA CRISTINA PICOLO", cargo: "Subsecretária de Controle Interno", cpf: "263.615.478-76", texto: "titular da Subsecretaria de Controle Interno", cpf: "263.615.478-76", texto: "titular da Subsecretaria de Controle Interno, por atribuição conferida através do artigo 14" },
    { abreviacao: "Comunicação Social", secretaria: "Secretaria de Comunicação Social", nome: "PAOLA KRISTINA VIEIRA DA SILVA", cargo: "Subsecretária de Comunicação Social", cpf: "293.464.018-23", texto: "titular da Subsecretaria de Comunicação Social, por atribuição conferida através do artigo 19" }
];

function showToast(icon, title) {
    const Toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#fff",
        color: "#000",
    });

    Toast.fire({ icon, title });
}

// ------------------------------
// Utilitários
// ------------------------------
function showLoading() {

    if (loadingModal) {
        loadingModal.style.display = "block";
    } else {
        // Fallback simples se o modal não for encontrado
        documentsList.innerHTML = "<p>Carregando documentos...</p>";
    }
}

function hideLoading() {
    if (loadingModal) {
        loadingModal.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', () => {

    renderizarOpcoesGrupos();


    const STORAGE_KEY = "assinador_preferencia";
    const btnVoltar = document.getElementById('VoltaAssinador');

    if (!btnVoltar) return;

    btnVoltar.addEventListener("click", (event) => {
        event.preventDefault();

        // Remove chave no storage global da extensão
        chrome.storage.local.remove(STORAGE_KEY, () => {
            console.log("Preferência apagada com sucesso");
            
            // Redireciona para o assinador original
            chrome.runtime.sendMessage({
                action: "goToOriginalAssinador"
            });
        });
    });

// Escuta cliques no container principal (Delegação)
    const container = document.getElementById("documents-list");
    if (container) {
        container.addEventListener("click", (e) => {
            // Verifica se clicou no botão ou no ícone dentro dele
            const btnAdd = e.target.closest(".btn-adicionar-ao-grupo");
            const btnRem = e.target.closest(".btn-remover-do-grupo");

            if (btnAdd) {
                const id = btnAdd.getAttribute("data-id");
                adicionarProcessoAoGrupo(id);
            } else if (btnRem) {
                const id = btnRem.getAttribute("data-id");
                removerProcessoDoGrupo(id);
            }
        });
    }

    // Listener para o Select de Grupos
    const selectGrupo = document.getElementById("selectGrupo");
    if (selectGrupo) {
        selectGrupo.addEventListener("change", filtrarPorGrupo);
    }

});



function sanitizeLinkField(raw) {
    if (!raw) return null;
    // se já for objeto com Url
    if (typeof raw === "object" && raw && raw.Url) return raw.Url;

    const str = String(raw);

    // tenta extrair href de <a ... href="...">
    const hrefMatch = str.match(/href=(?:"|')([^"']+)(?:"|')/i);
    if (hrefMatch && hrefMatch[1]) return hrefMatch[1].trim();

    // às vezes o campo tem onclick="document.getElementById('siframe').src='https://...'"
    const onclickMatch = str.match(/['"]https?:\/\/[^'"]+/i);
    if (onclickMatch) return onclickMatch[0].replace(/^['"]/, '').trim();

    // tenta extrair URL simples no meio do texto
    const urlMatch = str.match(/https?:\/\/[^\s'">]+/i);
    if (urlMatch) return urlMatch[0].trim();

    // em alguns casos o campo já é apenas o ID (apenas letras/números)
    const idOnlyMatch = str.match(/^[A-Z0-9_-]{10,}$/i);
    if (idOnlyMatch) return idOnlyMatch[0].trim();

    return null;
}

// Extrai o ID do assinador a partir da URL (pega a parte depois de /assinar/).
// Se o parâmetro já for um ID, devolve o ID.
function extrairIdAssinador(rawLink) {
    if (!rawLink) return null;

    let str = String(rawLink).trim();

    //
    // 1️⃣ Se já for só o ID
    //
    if (/^[A-Z0-9]{20,50}$/i.test(str)) {
        return str;
    }

    //
    // 2️⃣ Se houver HTML (extrair href)
    //
    const hrefMatch = str.match(/href=["']([^"']+)["']/i);
    if (hrefMatch) {
        str = hrefMatch[1];
    }

    //
    // 3️⃣ Limpar onclick="... 'URL' ..."
    //
    const onclickMatch = str.match(/['"](https:\/\/assinadordigitalexterno[^'"]+)/i);
    if (onclickMatch) {
        str = onclickMatch[1];
    }

    //
    // 4️⃣ Extrair o ID após /assinar/
    //
    const tokenMatch = str.match(/\/assinar\/([A-Z0-9]+)(?=\?|$)/i);
    if (tokenMatch) {
        return tokenMatch[1];
    }

    //
    // 5️⃣ Procura por um token isolado
    //
    const fallback = str.match(/[A-Z0-9]{25,50}/i);
    if (fallback) {
        return fallback[0];
    }

    console.warn("extrairIdAssinador: não conseguiu extrair de", rawLink);
    return null;
}

// =======================================================================
// 🔥 FUNÇÃO CORRIGIDA: VERIFICA ASSINATURAS PENDENTES
// Resolve o problema de listar TODAS as secretarias e falha de mapeamento.
// =======================================================================
function verificarAssinaturasPendentes(locais_necessarios, assinaturas_feitas, secretarias_map) {
    const normalize = str =>
    (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

    // 1. Set de todos os nomes que REALMENTE ASSINARAM (para busca rápida)
    const responsaveis_que_assinaram = new Set(
        assinaturas_feitas.map(a => normalize(a.responsavel))
        );

    // 2. Mapa de Lookups (Local da API -> Dados da Secretaria)
    const localParaSecretariaMap = new Map();
    secretarias_map.forEach(sec => {
        localParaSecretariaMap.set(normalize(sec.abreviacao), sec);
        localParaSecretariaMap.set(normalize(sec.secretaria), sec);
        // Mapeamentos manuais... (inclua todos os seus mapeamentos aqui)
        if (sec.abreviacao === "GP") { localParaSecretariaMap.set(normalize("GERAL DO GABINETE"), sec); }
        if (sec.abreviacao === "Ações da Cidadania") { localParaSecretariaMap.set(normalize("SUBS. DE AÇÕES DE CIDADANIA"), sec); }
        if (sec.abreviacao === "Assuntos da Juventude") { localParaSecretariaMap.set(normalize("SUBS. DE ASSUNTOS DA JUVENTUDE"), sec); }
        if (sec.abreviacao === "Controle Interno") { localParaSecretariaMap.set(normalize("SUBS. DE CONTROLE INTERNO"), sec); }
        if (sec.abreviacao === "Comunicação Social") { localParaSecretariaMap.set(normalize("SUBS. DE COMUNICACAO SOCIAL"), sec); }
    });

    const resultado = [];
    
    // 3. Rastreamento:
    // a) Chaves de Secretarias Oficiais/Locais (para evitar duplicatas requeridas)
    const chavesRequeridasProcessadas = new Set(); 
    // b) Nomes dos signatários que cobriram uma assinatura REQUERIDA (para subtrair da lista de Extras)
    const responsaveis_accounted_for = new Set(); 

    // 4. Lógica de ITENS REQUERIDOS (Mapeados ou Não)
    for (const local of locais_necessarios) {
        const localNorm = normalize(local);
        const sec = localParaSecretariaMap.get(localNorm);

        if (sec) {
            // ITEM REQUERIDO MAPEADO
            const chave = sec.abreviacao;
            if (chavesRequeridasProcessadas.has(chave)) continue;
            chavesRequeridasProcessadas.add(chave);
            
            const nomeResponsavelNorm = normalize(sec.nome);
            const assinado = responsaveis_que_assinaram.has(nomeResponsavelNorm);
            
            if (assinado) {
                // Se o signatário oficial necessário assinou, ele está ACCOUNTED FOR.
                responsaveis_accounted_for.add(nomeResponsavelNorm); 
            }
            
            resultado.push({
                abreviacao: sec.abreviacao,
                secretaria: sec.secretaria,
                assinado: assinado,
                responsavel: assinado ? sec.nome : null
            });
            
        } else {
            // ITEM REQUERIDO NÃO MAPEADO (Vai aparecer como warning: Pendente/Desconhecido)
            const chave = localNorm; 
            // Evita duplicatas de nomes não mapeados que apareceram várias vezes no input
            if (chavesRequeridasProcessadas.has(chave)) continue;
            chavesRequeridasProcessadas.add(chave); 

            resultado.push({
                abreviacao: local, 
                secretaria: local, 
                assinado: false,
                responsavel: "Não mapeado (Pendente)" // Flag para Yellow badge
            });
        }
    }
    
    // 5. Lógica de ITENS EXTRAS (Signatários que ASSINARAM, mas não são responsáveis REQUERIDOS)
    const extraSignersAdded = new Set(); 

    for (const assinatura of assinaturas_feitas) {
        const signatarioNome = assinatura.responsavel;
        const signatarioNorm = normalize(signatarioNome);

        // Se o nome do signatário já cobriu um requisito, ignore.
        if (responsaveis_accounted_for.has(signatarioNorm)) {
            continue; 
        }

        // Evita duplicatas na lista de signatários extra
        if (extraSignersAdded.has(signatarioNorm)) {
            continue; 
        }
        extraSignersAdded.add(signatarioNorm);

        // É um signatário extra
        resultado.push({
            // Usamos o nome do signatário como a 'abreviação' para o badge
            abreviacao: signatarioNome, 
            secretaria: "Assinatura Especial",
            assinado: true, 
            responsavel: "Signatário Extra" // Flag para Yellow badge
        });
    }

    return resultado;
}

async function startRealSignaturesUpdateTabela(lista) {
    const linhas = document.querySelectorAll("#documents-list table tbody tr");
    if (!linhas.length) return;

    // Mapeia cada linha da tabela para uma Promessa de atualização de assinatura
    const updatePromises = [...linhas].map(row => {
        const idAssinador = row.getAttribute("data-id");
        const sigCell = row.querySelector(".td-assinaturas");

        const docId = row.querySelector("td")?.innerText;
        const doc = lista.find(x => String(x.ID) === String(docId));

        if (!idAssinador || !sigCell || !doc) return Promise.resolve();
        
        // Retorna a promessa da busca e renderização da linha (que injeta o SPAN)
        return buscarAssinaturasTabela(idAssinador, sigCell, doc);
    });

    // 💡 AGUARDA: Espera que todas as chamadas a buscarAssinaturasTabela terminem
    await Promise.all(updatePromises);

    // 🔥 PONTO CRÍTICO: Inicializa os tooltips para os elementos recém-criados
    initializeTooltips();
}

// =======================================================================
// 🔥 GARANTIDO: Aplica badge Amarelo/Warning para itens não mapeados
// =======================================================================
function generateAssinaturaTooltipContent(status_assinaturas, agrupadas = {}) {
    
    let tooltipHtml = `<span class='d-block text-center mb-1'>SECRETARIAS</span>`;
    
    const normalize = str =>
    (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

    const badgesHtml = status_assinaturas.map(status => {
    let label = status.abreviacao || status.secretaria;
    let type = 'secondary';

    const nomeComparacao = status.responsavel;

    const key = Object.keys(agrupadas).find(k =>
        k === normalize(nomeComparacao)
    );

    if (key && agrupadas[key].count > 1) {
        label = `${agrupadas[key].count}x ${label}`;
    }

    if (status.responsavel === "Não mapeado (Pendente)") {
        type = 'warning';
    } else if (status.responsavel === "Signatário Extra") {
        type = 'warning';
    } else if (status.assinado) {
        type = 'success';
    }

    return `<span class='badge text-bg-${type} d-inline-block me-1 mb-1'>${label}</span>`;
}).join("");

    // 🔥 AGORA SIM junta tudo
    tooltipHtml += badgesHtml;

    // 🔥 E RETORNA
    return tooltipHtml;
}


async function buscarAssinaturasTabela(id, elementoDestino, doc) {
    if (!id || !elementoDestino) return;
    const listatotal = doc.Locais.results;
    const assinaturas = await buscarAssinaturas(id);

    const agrupadas = agruparAssinaturas(assinaturas);

// Conta apenas únicos
    const concluidos = Object.keys(agrupadas).length;

    const total = Number(doc.Contagem) || 0;

    // 1. Obtém o status de assinatura para todas as secretarias necessárias
    const status_assinaturas = verificarAssinaturasPendentes(
        listatotal,
        assinaturas,
        secretarias
        );

    const required_statuses = status_assinaturas.filter(status => {
        // Exclui a entrada de fallback "Não mapeado" (se implementada)
        return !(status.abreviacao === status.secretaria && status.responsavel === 'Não mapeado (Pendente)');
    });

    // Conta os concluídos (badges 'success')
    const display_concluidos = required_statuses.filter(s => s.assinado).length;

    // Conta o total de secretarias mapeadas/requeridas
    const display_total = required_statuses.length;
    // 2. Gera o HTML do conteúdo do Tooltip (lista de badges)
    const tooltipContent = generateAssinaturaTooltipContent(status_assinaturas, agrupadas);

    // 4. Monta o HTML final para a célula da tabela
    // Substitui aspas duplas internas por &quot; para evitar quebras no atributo data-bs-title.
    const escapedTooltipContent = tooltipContent.replace(/"/g, '&quot;');
    var colortextspan = "dark";
    if(concluidos > total){
        colortextspan = "success";
    }else if(concluidos == total){
        colortextspan = "primary";
    }
    const finalHtml = `
        <span
            class="fw-bold text-${colortextspan} "
            data-bs-toggle="tooltip"
            data-bs-placement="right"
            data-bs-html="true"
            data-bs-title="${escapedTooltipContent}"
        >
            ${concluidos}/${total}
        </span>
    `;

    // 5. Atualiza o conteúdo da célula com o novo SPAN
    elementoDestino.innerHTML = finalHtml;

    // remove botão enviar se já houver assinaturas
    if (concluidos > 0) {
        const botao = elementoDestino.closest("tr").querySelector(".btn-enviar");
        if (botao) botao.remove();
    }
}

function agruparAssinaturas(assinaturas) {
    const normalize = str =>
    (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

    const contagem = {};

    assinaturas.forEach(a => {
        const nome = normalize(a.responsavel);

        if (!contagem[nome]) {
            contagem[nome] = {
                nomeOriginal: a.responsavel,
                count: 0
            };
        }

        contagem[nome].count++;
    });

    return contagem;
}


// Busca signers para um dado id. Trata 404 como "sem assinantes".
async function buscarAssinaturas(idOrLink) {

    // aceita id direto ou link que será sanitizado/extraído
    const possibleLink = sanitizeLinkField(idOrLink) || idOrLink;
    const id = extrairIdAssinador(possibleLink);

    if (!id) {
        // console.debug("buscarAssinaturas: id inválido para", idOrLink);
        return [];
    }

    const url = `https://assinadordigitalexterno.praiagrande.sp.gov.br/sign/pades/signers/${id}`;

    try {
        const res = await fetch(url, {
            method: "GET",
            credentials: "include"
        });

    // Se for 404, retornamos vazio imediatamente sem tentar ler o JSON
        if (res.status === 404) {
            return [];
        }

    // Se houver outro erro (500, 403, etc)
        if (!res.ok) {
            return [];
        }

        const data = await res.json();
        return Array.isArray(data) ? data : [];

    } catch (e) {
    // Erros de rede (DNS, offline, timeout) caem aqui
        console.error("Erro de conexão ao buscar assinaturas:", e);
        return [];
    }
}

// ------------------------------
// Data fetching
// ------------------------------

async function fetchDocuments() {
    try {
        const res = await fetch(API_URL, {
            method: "GET",
            headers: { "Accept": "application/json;odata=verbose" },
            credentials: "include"
        });
        

        if (!res.ok) {
            console.error("Erro ao buscar itens:", res.status, res.statusText);
            return [];
        }

        const data = await res.json();
        return data.d && data.d.results ? data.d.results : [];
    } catch (e) {
        console.error("fetchDocuments erro:", e);
        return [];
    }
}

async function buscarListaCompleta() {

    // 1️⃣ Se já está em memória (sessão atual), retorna
    if (listaBusca.length > 0) {
        return listaBusca;
    }

    // 2️⃣ Tenta ler do IndexedDB
    const cache = await lerListaCache();

    if (cache.length > 0) {
        console.log(`⚡ Cache local carregado: ${cache.length} registros`);
        listaBusca = cache;

        // Atualiza em background (sem travar)
        atualizarCacheEmBackground(cache);

        return listaBusca;
    }

    // 3️⃣ Não tem cache → busca tudo
    console.log("🌐 Cache vazio, buscando lista completa...");
    const lista = await buscarListaCompletaDoServidor();

    if (lista.length > 0) {
        listaBusca = lista;
        await salvarListaCache(lista);
    }

    return listaBusca;
}

async function buscarListaCompletaDoServidor() {
    try {
        const res = await fetch(SEARCH_ENDPOINT, {
            method: "GET",
            headers: { "Accept": "application/json;odata=verbose" },
            credentials: "include"
        });

        if (!res.ok) {
            console.error("Erro ao buscar lista completa:", res.status);
            return [];
        }

        const data = await res.json();
        return data.d?.results || [];
    } catch (e) {
        console.error("Erro fetch lista completa:", e);
        return [];
    }
}

async function atualizarCacheEmBackground(cacheAtual) {
    setTimeout(async () => {
        console.log("🔄 Atualizando cache em background...");

        const listaNova = await buscarListaCompletaDoServidor();

        if (listaNova.length === 0) return;

        // Mescla por ID
        const map = new Map(cacheAtual.map(item => [item.ID, item]));
        listaNova.forEach(item => map.set(item.ID, item));

        const listaMesclada = Array.from(map.values());

        // Atualiza memória + IndexedDB
        listaBusca = listaMesclada;
        await salvarListaCache(listaMesclada);

        console.log(`✅ Cache atualizado: ${listaMesclada.length} registros`);
    }, 200);
}



function preloadListaBusca() {
    // Se já carregou antes, não faz nada
    if (listaBusca.length > 0) return;

    // Roda em background sem travar a página
    setTimeout(() => {
        console.log("🔄 Pré-carregando lista de busca (10k) em background...");
        buscarListaCompleta().then(() => {
            console.log(`✅ Lista completa carregada (cache): ${listaBusca.length} registros`);
            showToast("success", "Página Carregada!");
        });
    }, 100);
}

// ================================================
// ATUALIZAÇÃO ASSÍNCRONA DE ASSINATURAS (CORREÇÃO FINAL DE CLASSE)
// ================================================

async function updateCardDetails(doc, cardElement) {
    if (!cardElement) return;

    const rawLink = doc.Link_x0020_Documento;
    const link = sanitizeLinkField(rawLink);
    const idAssinador = extrairIdAssinador(link || rawLink);

    const signers = idAssinador ? await buscarAssinaturas(idAssinador) : [];
    const concluidosAtuais = signers.length;
    const totalEsperado = Number(doc.Contagem) || 0;

    const assinadas = concluidosAtuais;
    const total = totalEsperado;

    // status calculado
    let textoHeader = "Aguardando Assinaturas";
    let newTextColorClass = "text-dark";
    let additionalHeaderClasses = []; // bg / border / text-* que adicionaremos

    if (total > 0 && assinadas >= total) {
        textoHeader = "Pronto para convocar";
        newTextColorClass = "text-success";
        additionalHeaderClasses.push("bg-white", "text-dark", "border", "border-success");
    } else if (assinadas > 0 && assinadas < total) {
        textoHeader = "Aguardando Assinaturas";
        newTextColorClass = "text-warning";
        additionalHeaderClasses.push("bg-secondary", "text-white");
    } else if (assinadas === 0 && total > 0) {
        textoHeader = "Aguardando Assinaturas";
        newTextColorClass = "text-danger";
        additionalHeaderClasses.push("border", "border-danger");
    } else {
        // Caso sem contagem definida
        textoHeader = "Sem contagem definida";
        newTextColorClass = "text-muted";
    }

    const EditarBtn = `<a target="_blank" href="http://www.intra.pg/SEAD/_layouts/15/listform.aspx?PageType=6&ListId=%7BDA67FC64%2D1B63%2D4608%2DB859%2D8DE4BC9B1FD8%7D&ID=${doc.ID}" class="btn btn-outline-white btn-sm"><i class="fa fa-cog" aria-hidden="true"></i></a>`;
    const btnGrupo = `<button class="btn btn-sm  btn-add-grupo" data-id="${doc.ID}">
                    <i class="fa fa-folder-plus"></i>
</button>`;
    // Seleciona via data-attributes (mais confiável)
const cardHeader = cardElement.querySelector('[data-card-header]');
const cardFooterStrong = cardElement.querySelector('[data-card-footer-count]');
const titleElement = cardElement.querySelector('[data-card-title]');

    // Lista de classes de cor/borda que podemos querer remover antes de aplicar novas
const colorsAndBorders = [
    "bg-white", "bg-secondary",
    "text-dark", "text-white", "text-success", "text-warning", "text-danger", "text-muted",
    "border", "border-success", "border-danger"
];

    // Atualiza header: remove classes conflitantes e aplica as novas
if (cardHeader) {
        // garante que as classes base de layout existam
    cardHeader.classList.add("card-header", "d-flex", "justify-content-between", "align-items-center", "p-2");

        // remove classes de cores/bordas antigas
    colorsAndBorders.forEach(c => cardHeader.classList.remove(c));

        // adiciona as classes de estado calculadas
    additionalHeaderClasses.forEach(c => cardHeader.classList.add(c));

        // atualiza o conteúdo interno (preserva estrutura simples)
    cardHeader.innerHTML = `
        <span>${EditarBtn}</span>
        <span class="flex-grow-1">${textoHeader}</span>


        <span></span>
    `;
}

    // Atualiza footer (contador)
if (cardFooterStrong) {
        // remove classes antigas e aplica a nova
    colorsAndBorders.forEach(c => cardFooterStrong.classList.remove(c));
    cardFooterStrong.classList.add(newTextColorClass);
    cardFooterStrong.textContent = `${assinadas} / ${total}`;
}

    // Atualiza o título (classe de cor)
if (titleElement) {
    colorsAndBorders.forEach(c => titleElement.classList.remove(c));
    titleElement.classList.add('text-dark');
}
}

// =======================================================================
// TRIANGULAÇÃO: SECRETARIAS x ASSINATADORES (função original do usuário)
// A função `verificarAssinaturasPendentes` acima é a recomendada para a tarefa.
// Esta função abaixo (mapearAssinaturasPorSecretaria) está mantida
// porque ela gera os badges HTML e pode ser usada em outro lugar do seu código.
// =======================================================================
function mapearAssinaturasPorSecretaria(assinaturas, secretarias, locaisProcesso) {

    // Normaliza textos
    const normalize = str =>
    (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

    // Lista com todos os nomes que assinaram
    const nomesAssinantes = assinaturas.map(a => normalize(a.responsavel));

    let secretariasProcesso = [];

    locaisProcesso.forEach(local => {
        const localNorm = normalize(local);

        // Verifica se o local existe na lista de secretarias oficiais
        const sec = secretarias.find(s => normalize(s.abreviacao) === localNorm);

        if (sec) {
            const assinou = nomesAssinantes.includes(normalize(sec.nome));

            secretariasProcesso.push({
                abreviacao: sec.abreviacao,
                nome: sec.nome,
                assinou,
                tipo: assinou ? "success" : "secondary"
            });

        } else {
            // Não existe no array oficial → warning
            secretariasProcesso.push({
                abreviacao: local,
                nome: local,
                assinou: false,
                tipo: "warning"
            });
        }
    });

    // Badges HTML
    const badgesHTML = secretariasProcesso.map(s => `
        <span class="badge text-bg-${s.tipo} me-1">${s.abreviacao}</span>
    `).join("");

    return {
        total: secretariasProcesso.length,
        assinadas: secretariasProcesso.filter(s => s.assinou).length,
        badgesHTML,
        secretariasProcesso
    };
}


// ------------------------------
// Render (cards) - Otimizado com isSearch
// ------------------------------
// ------------------------------
// Render (cards) - Otimizado para SEMPRE usar dados SharePoint no primeiro render
// ------------------------------
// ------------------------------
// Render (cards) - Otimizado para SEMPRE usar dados SharePoint no primeiro render
// ------------------------------
// Renomeei isSearch para isInitialLoad. Se true, significa que é a lista inicial do Assinador.
async function renderLista(lista, isInitialLoad = true) {

    let html = `<div class="row">`;

    for (const doc of lista) {

        const rawLink = doc.Link_x0020_Documento;
        const link = sanitizeLinkField(rawLink);
        const id = doc.ID;

        const assinadas = Number(doc.Concluidos) || 0;
        const total = Number(doc.Contagem) || 0;

        // ============================
        //   LÓGICA DE CORES / STATUS
        // ============================
        let classeHeader = "card-header d-flex justify-content-between align-items-center p-2";
        let textoHeader = "Aguardando Assinaturas";
        let footerColor = "text-dark";

        if (total > 0 && assinadas >= total) {
            classeHeader += " bg-white text-dark border border-success";
            textoHeader = "Pronto para convocar";
            footerColor = "text-success";
        }
        else if (assinadas > 0 && assinadas < total) {
            classeHeader += " bg-secondary text-white";
            textoHeader = "Aguardando Assinaturas";
            footerColor = "text-warning";
        }
        else if (assinadas === 0 && total > 0) {
            classeHeader += " border border-danger";
            textoHeader = "Aguardando Assinaturas";
            footerColor = "text-danger";
        }

        const editBtn = `
            <a target="_blank" 
               href="http://www.intra.pg/SEAD/_layouts/15/listform.aspx?PageType=6&ListId=%7BDA67FC64-1B63-4608-B859-8DE4BC9B1FD8%7D&ID=${id}"
               class="btn btn-outline-white btn-sm">
                <i class="fa fa-cog"></i>
            </a>
        `;
        const grupoAtivo = document.getElementById("selectGrupo")?.value || "todos";
        const isRemover = grupoAtivo !== "todos";

// No HTML do botão:
        const botaoGrupo = `
    <button class="btn ${isRemover ? 'btn-outline-danger' : ''} btn-sm" 
            onclick="${isRemover ? `removerProcessoDoGrupo('${doc.ID}')` : `adicionarProcessoAoGrupo('${doc.ID}')`}"
            title="${isRemover ? 'Remover deste grupo' : 'Adicionar a um grupo'}">
        <i class="fa ${isRemover ? 'fa-trash' : 'fa-folder-plus'}"></i>
    </button>
        `;

        const cardId = `doc-card-${id}`;

        html += `
<div class="col-3 mb-3">
  <div class="card text-center shadow-sm" id="${cardId}">

    <div class="${classeHeader}" data-card-header>
        <span>${editBtn}</span>
            <span>${botaoGrupo}</span>
        <span class="flex-grow-1">${textoHeader}</span>
        <span></span>
    </div>

    <a href="${link || '#'}" target="_blank" class="text-decoration-none">
      <div class="card-body">
        <h5 class="card-title text-dark" data-card-title>${doc.Title || ""}</h5>
        <p class="card-text small text-muted">${doc.Categoria || ""}</p>
      </div>
    </a>

    <div class="card-footer text-muted">
      Assinaturas: <strong data-card-footer-count class="${footerColor}">
        ${assinadas} / ${total}
      </strong>
    </div>
  </div>
</div>
        `;
    }

    html += "</div>";
    documentsList.innerHTML = html;

    // Atualização REAL dos contadores
    if (isInitialLoad) {
        startRealSignaturesUpdate(lista);
    }
}

// ================================================
// GERENCIAMENTO DE GRUPOS
// ================================================
// --- Estado Global dos Grupos ---
let grupos = JSON.parse(localStorage.getItem("assinador_grupos")) || {};

// --- Funções de Gestão de Dados ---
function obterGrupos() {
    try {
        const armazenado = localStorage.getItem("assinador_grupos");
        if (!armazenado || armazenado === "undefined" || armazenado === "null") return {};
        
        const dados = JSON.parse(armazenado);
        if (typeof dados !== 'object' || dados === null) return {};
        return dados;
    } catch (e) {
        return {};
    }
}

function salvarGrupos(novosGrupos) {
    // Se por algum motivo vier vazio, a gente recupera o que já existe ou salva vazio
    const dadoSeguro = (novosGrupos && typeof novosGrupos === 'object') ? novosGrupos : {};
    
    localStorage.setItem("assinador_grupos", JSON.stringify(dadoSeguro));
    renderizarOpcoesGrupos(); // Atualiza o select na hora
}

function atualizarSelectGrupos() {
    const select = document.getElementById("selectGrupo");
    if (!select) return;
    
    const valorAtual = select.value;
    select.innerHTML = '<option value="todos">📁 Todos os Documentos</option>';
    
    Object.keys(grupos).forEach(nome => {
        const opt = document.createElement("option");
        opt.value = nome;
        opt.textContent = `📂 ${nome} (${grupos[nome].length})`;
        select.appendChild(opt);
    });
    select.value = valorAtual;
}

function renderizarOpcoesGrupos() {
    const select = document.getElementById("selectGrupo");
    if (!select) return;
    
    const listaGrupos = obterGrupos();
    const valorAtual = select.value;
    
    let html = '<option value="todos">📁 Todos os Documentos</option>';
    for (const nome in listaGrupos) {
        // CORREÇÃO DEFINITIVA: length (sem erros de digitação)
        const qtd = listaGrupos[nome].length; 
        html += `<option value="${nome}">📂 ${nome} (${qtd})</option>`;
    }
    select.innerHTML = html;
    // Tenta manter a seleção após renderizar
    if (listaGrupos[valorAtual] || valorAtual === "todos") {
        select.value = valorAtual;
    }
}
// --- Funções de Interface ---

async function criarNovoGrupo() {
    const { value: nomeGrupo } = await Swal.fire({
        title: 'Novo Grupo',
        input: 'text',
        inputPlaceholder: 'Nome do grupo...',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) return 'O nome não pode ser vazio!';
            const grupos = obterGrupos();
            if (grupos[value]) return 'Este grupo já existe!';
        }
    });

    if (nomeGrupo) {
        const gruposAtuais = obterGrupos();
        // IMPORTANTE: Criamos o grupo já com um array vazio
        gruposAtuais[nomeGrupo] = []; 
        
        salvarGrupos(gruposAtuais); // Aqui não vai mais dar erro de "inválido"
        
        await Swal.fire('Sucesso!', `Grupo "${nomeGrupo}" criado.`, 'success');
        
        // Seleciona e filtra automaticamente
        const select = document.getElementById("selectGrupo");
        if (select) {
            select.value = nomeGrupo;
            filtrarPorGrupo();
        }
    }
}


async function deletarGrupoAtual() {
    const select = document.getElementById("selectGrupo");
    const grupoParaDeletar = select.value;

    if (!grupoParaDeletar || grupoParaDeletar === "todos") {
        Swal.fire('Ops', 'Selecione um grupo válido para excluir.', 'warning');
        return;
    }

    const { isConfirmed } = await Swal.fire({
        title: `Excluir "${grupoParaDeletar}"?`,
        text: "Os processos não serão apagados, apenas o grupo.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sim, excluir'
    });

    if (isConfirmed) {
        const grupos = obterGrupos();
        delete grupos[grupoParaDeletar]; // Remove a chave do objeto
        
        salvarGrupos(grupos); // Salva o que restou
        
        select.value = "todos";
        filtrarPorGrupo();
        showToast("success", "Grupo removido.");
    }
}

async function adicionarProcessoAoGrupo(idDoc) {
    const listaGrupos = obterGrupos();
    const nomes = Object.keys(listaGrupos);
    
    if (nomes.length === 0) {
        const { isConfirmed } = await Swal.fire({
            title: 'Nenhum grupo!',
            text: 'Crie um grupo primeiro no menu superior.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Criar agora'
        });
        if (isConfirmed) document.getElementById('btnNovoGrupo')?.click();
        return;
    }

    const { value: grupoAlvo } = await Swal.fire({
        title: 'Adicionar ao Grupo',
        input: 'select',
        inputOptions: nomes.reduce((acc, curr) => ({...acc, [curr]: curr}), {}),
        showCancelButton: true,
        confirmButtonText: 'Adicionar'
    });

    if (grupoAlvo) {
        const idStr = String(idDoc);
        // Garante que o array do grupo existe
        if (!listaGrupos[grupoAlvo]) listaGrupos[grupoAlvo] = [];

        if (!listaGrupos[grupoAlvo].includes(idStr)) {
            listaGrupos[grupoAlvo].push(idStr);
            salvarGrupos(listaGrupos);
            showToast("success", `Adicionado a ${grupoAlvo}`);
            
            // Se estivermos vendo um grupo, atualiza a tela
            if (document.getElementById("selectGrupo").value !== "todos") {
                filtrarPorGrupo();
            }
        } else {
            showToast("info", "Este processo já está no grupo.");
        }
    }
}

async function removerProcessoDoGrupo(idDoc) {
    const grupoNome = document.getElementById("selectGrupo").value;
    if (grupoNome === "todos") return;

    const { isConfirmed } = await Swal.fire({
        title: 'Remover do grupo?',
        text: `Remover este processo de "${grupoNome}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sim, remover'
    });

    if (isConfirmed) {
        let grupos = obterGrupos();
        const idStr = String(idDoc);

        if (grupos[grupoNome]) {
            // Remove apenas o ID clicado
            grupos[grupoNome] = grupos[grupoNome].filter(id => String(id) !== idStr);
            
            // Salva de forma segura
            localStorage.setItem("assinador_grupos", JSON.stringify(grupos));
            
            // Atualiza o select (contagem) e a lista na tela
            renderizarOpcoesGrupos();
            filtrarPorGrupo(); 
            
            showToast("success", "Removido do grupo");
        }
    }
}


// --- Delegação de Eventos (O segredo para extensões) ---

document.addEventListener('click', function(e) {
    // Verifica se clicou no botão de adicionar ao grupo (que terá a classe btn-add-grupo)
    const btnAdd = e.target.closest('.btn-add-grupo');
    if (btnAdd) {
        const idDoc = btnAdd.getAttribute('data-id');
        adicionarProcessoAoGrupo(idDoc);
    }
});


// Listener do Select
document.getElementById("selectGrupo")?.addEventListener("change", filtrarPorGrupo);

// Listener para criar e apagar
document.getElementById('btnCriarGrupo')?.addEventListener('click', criarNovoGrupo);

// Versão limpa para deletar grupos
document.getElementById('btnGerenciarGrupos')?.addEventListener('click', deletarGrupoAtual);


// Inicialização
atualizarSelectGrupos();

// ===================================================
// RENDERIZAÇÃO EM TABELA (NOVO)
// ===================================================
function renderTabela(lista) {

    let html = `
    <table id="documents-table" class="table table-bordered table-striped shadow-sm">

        <thead class="table-dark">
            <tr>
                <th class='d-none'>ID</th>

                <th class='text-center' >Editar</th>
                <th>Título</th>
                <th class='text-center text-withe'>Categoria</th>
                <th class='text-center'>Assinaturas</th>
                <th class='text-center'> Ações </th>
            </tr>
        </thead>
        <tbody>
    `;

    for (const doc of lista) {

        const link = sanitizeLinkField(doc.Link_x0020_Documento);
        const idAssinador = extrairIdAssinador(link);
        const grupoSelecionado = document.getElementById("selectGrupo")?.value || "todos";
        const modoLixeira = grupoSelecionado !== "todos";

// Define ícone e cor
        const iconeAcao = modoLixeira ? "fa-trash" : "fa-folder-plus";
        const classeCor = modoLixeira ? "btn-outline-danger" : "";
        const classeIdentificadora = modoLixeira ? "btn-remover-do-grupo" : "btn-adicionar-ao-grupo";

        html += `
            <tr data-id="${idAssinador || ''}" >
                <td class='d-none'>${doc.ID}</td>
                <td class='text-center'>
                    <a target="_blank"
                        href="http://www.intra.pg/SEAD/_layouts/15/listform.aspx?PageType=6&ListId=%7BDA67FC64%2D1B63%2D4608%2DB859%2D8DE4BC9B1FD8%7D&ID=${doc.ID}"
                        class="btn btn-sm btn-secondary">
                       <i class="fa fa-cog" aria-hidden="true"></i>

                    </a>



                </td>

                <td class='fw-bold '>

                    <a class="text-dark" href="${link || '#'}" target="_blank">
                        ${doc.Title}
                    </a>


                </td>

                <td class='text-center text-dark'>${doc.Categoria || ""}</td>

                <td class="td-assinaturas text-center">
                    Carregando...
                </td>
                <td class='text-center'>

               <div class=" d-flex justify-content-around align-items-center w-100 " role="group" aria-label="Basic example">
              <a target="_blank" class='app-icon link-offset-2 link-underline link-underline-opacity-0'
                        href="https://assinadordigitalexterno.praiagrande.sp.gov.br/pdfjs-4.5/web/viewer.html?file=/impressao/${idAssinador}"
                        class="btn btn-sm ms-1">
                       <i class="fa fa-eye text-info-emphasis" aria-hidden="true"></i>

                    </a>
<div class="vr bg-dark"></div>
             <a target="_blank" class='app-icon link-offset-2 link-underline link-underline-opacity-0'
                        href="https://assinadordigitalexterno.praiagrande.sp.gov.br/impressao/${idAssinador}"
                        class="btn btn-sm text-primary-emphasis me-1">
                       <i class="fa fa-download text-info-emphasis" aria-hidden="true"></i>

                    </a>
<div class="vr bg-dark"></div>
                    <button type="button" 
            class="btn btn-sm btn-copy-link app-icon link-offset-2 link-underline link-underline-opacity-0 border-0 bg-transparent text-info-emphasis"
            data-link="${link}"
            title="Copiar Link">
        <i class="fa-solid fa-link text-info-emphasis"></i>
    </button>
            <div class="vr bg-dark d-none"></div>
              <button type="button" 
            class="btn btn-sm btn-print app-icon link-offset-2 link-underline link-underline-opacity-0 border-0 bg-transparent text-info-emphasis d-none"
            data-link="https://assinadordigitalexterno.praiagrande.sp.gov.br/pdfjs-4.5/web/viewer.html?file=/impressao/${idAssinador}"
            title="Imprimir">
        <i class="fa-solid fa-print text-info-emphasis"></i>
    </button>
 <div class="vr bg-dark"></div>
        <button class="btn btn-sm ${classeCor} ${classeIdentificadora} float-end" 
            data-id="${doc.ID}" 
            title="${modoLixeira ? 'Remover do grupo' : 'Adicionar ao grupo'}">
        <i class="fa ${iconeAcao}"></i>
    </button>
                </div>


                </td>

            </tr>
        `;
    }

    html += "</tbody></table>";

    documentsList.innerHTML = html;

    // 🔥 Atualiza assinaturas REAL-TIME
    startRealSignaturesUpdateTabela(lista);
}
// Delegação de evento global
document.addEventListener('click', function (e) {
    const btnCopy = e.target.closest('.btn-copy-link');
    const btnPrint = e.target.closest('.btn-print');

    // Lógica de Copiar (Mantida)
    if (btnCopy) {
        const link = btnCopy.getAttribute('data-link');
        if (link) {
            navigator.clipboard.writeText(link).then(() => {
                if (typeof showToast === 'function') showToast("success", "Link copiado!");
                else alert("Copiado!");
            });
        }
    }

    // Lógica de Imprimir (Nova Abordagem)
    if (btnPrint) {
        const linkPDF = btnPrint.getAttribute('data-link');

        // 1. Confirmação antes de qualquer ação
        Swal.fire({
            title: 'Deseja imprimir?',
            text: "O documento será aberto para impressão (2 vias).",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, imprimir!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // 2. Abre a janela IMEDIATAMENTE após o clique no OK
                // O navegador aceita melhor o comando de impressão se houver interação humana
                const win = window.open(linkPDF, '_blank');

                if (win) {
                    win.focus();

                    // 3. Aguarda o PDF.js carregar (4 segundos é o ideal para o portal da PG)
                    setTimeout(() => {
                        try {
                            // Primeira via
                            win.print();
                            
                            // Segunda via (dispara após a primeira ser fechada/confirmada)
                            setTimeout(() => {
                                win.print();
                            }, 1500);
                        } catch (err) {
                            console.warn("Bloqueio de segurança: O site da prefeitura impediu o comando automático.");
                            if (typeof showToast === 'function') {
                                showToast("info", "Use o ícone de impressora da página que abriu.");
                            }
                        }
                    }, 4000); 
                } else {
                    Swal.fire('Erro', 'O bloqueador de pop-ups impediu a impressão.', 'error');
                }
            }
        });
    }
});



// 🚨 NOVO: Inicia a busca real para cada documento em background
function startRealSignaturesUpdate(documentos) {
    // Usar setTimeout com um pequeno delay ou Promise.allSettled
    // para não bloquear a thread principal em uma única iteração

    documentos.forEach((doc, index) => {
        // Um pequeno timeout para espaçar as chamadas e não sobrecarregar
        setTimeout(async () => {
            const cardElement = document.getElementById(`doc-card-${doc.ID}`);
            if (cardElement) {
                // Atualiza o card de forma assíncrona
                await updateCardDetails(doc, cardElement);
            }
        }, 50 * index); // 50ms de delay entre cada atualização
    });
    
    // NOTA: Não precisa de hideLoading() aqui, pois já foi feito na loadAssinador
}

// ------------------------------
// Busca (10k) -> filtra e renderiza como cards também
// ------------------------------
function normalizarParaBusca(str) {
    if (!str) return "";
    // Remove pontos, traços e barras e converte para minúsculo
    return str.toString().toLowerCase().replace(/[\.\-\/]/g, "").trim();
}



async function executarBusca(termoManual = null) {
    const input = document.getElementById("Busca");
    // Se termoManual existir, usa ele; senão, pega o valor do input
    const valorOriginal = termoManual !== null ? termoManual : (input ? input.value : "");
    const valorLimpo = normalizarParaBusca(valorOriginal);

    if (valorOriginal.trim() === "") {
        aplicarModoVisualizacao(todosDocumentos, false);
        return; 
    }

    showLoading();

    // Sincroniza o campo de busca visualmente se a busca veio por link
    if (termoManual && input) {
        input.value = termoManual;
    }

    const lista = await buscarListaCompleta();

    const resultados = lista.filter(item => {
        if (item.Categoria && String(item.Categoria).toLowerCase().trim() === "empenho") {
            return false;
        }
        
        // Compara o termo limpo com o título e ID também limpos
        const tituloLimpo = normalizarParaBusca(item.Title);
        const idString = String(item.ID);

        return tituloLimpo.includes(valorLimpo) || idString.includes(valorLimpo);
    });

    aplicarModoVisualizacao(resultados, false);
    hideLoading();
}

function atualizarContagem(count) { // 🚨 NOVO: Função para atualizar o texto do countDocs
    if (countDocsElement) {
        countDocsElement.textContent = `${count} Documento${count !== 1 ? 's' : ''}`;
    }
}
// ------------------------------
// Inicialização: carrega os itens do assinador e exibe cards
// ------------------------------
// ------------------------------
// Inicialização: carrega os itens do assinador e exibe cards
// ------------------------------
async function loadAssinador() {
    if (!documentsList) {
        console.error("Container 'documents-list' não encontrado no HTML.");
        return;
    }
    showLoading();
    documentsList.innerHTML = "<p>Carregando documentos...</p>";

    const items = await fetchDocuments();

    const SECRETARIAS_PROIBIDAS = [
        "SESAP", "SETRAN", "SEDUC", "SEFIN", "SUBJUV",
        "SEEL", "SEAS", "SEG", "GP", "SEHAB", "SEAD"
    ];
    
    const filtrados = (items || []).filter(doc => {
        // ... (Sua lógica de filtragem)
        if (doc.Categoria && String(doc.Categoria).toLowerCase().trim() == "empenho") {
            return false;
        }

        if (!doc.Title) return false;
        const titulo = String(doc.Title).toUpperCase().trim();
        if (/EMP/i.test(titulo)) return false; 
        if (/ESTORNO/i.test(titulo)) return false;
        const secretaria = titulo.split(" ")[0];
        if (SECRETARIAS_PROIBIDAS.includes(secretaria)) return false;
        return true;
    });

    todosDocumentos = filtrados;
    
    // 🚨 AQUI: Chame renderLista com TRUE para indicar que é a carga inicial
    // e que a atualização real deve ser disparada depois.
    //await renderLista(filtrados); 
    
    hideLoading();
    ligarToggleButton();
    //console.log(todosDocumentos);
    aplicarModoVisualizacao(todosDocumentos, true);

// 🚀 PRÉ-CARREGA A LISTA COMPLETA EM BACKGROUND PARA ACELERAR AS BUSCAS
    preloadListaBusca();
}

// ===================================================
// BOTÃO DE TROCAR VISUALIZAÇÃO
// ===================================================
// ===================================================
// BOTÃO DE TROCAR VISUALIZAÇÃO (AGORA COM LOCALSTORAGE)
// ===================================================
let modoTabela = localStorage.getItem("assinador_modo_tabela") === "true";

// função unificada que aplica o modo visual (recebe a lista a ser renderizada)
// isInitialLoad -> true somente quando é a primeira render após carregamento do SharePoint
function aplicarModoVisualizacao(listaParaExibir = todosDocumentos, isInitialLoad = false) {
    // garante que o botão existe (se por acaso foi injetado dinamicamente)
    const toggleBtn = document.getElementById("toggleView");
    if (toggleBtn) {
        toggleBtn.innerText = modoTabela ? "🗂 Visualizar como Cards" : "📄 Visualizar como Tabela";
    }
    atualizarContagem(listaParaExibir.length);

    if (modoTabela) {
        // renderiza tabela
        renderTabela(listaParaExibir || []);
        // tabela não precisa de atualização de assinaturas assíncrona aqui
    } else {
        // renderiza cards
        // renderLista mantém o html dos cards, mas vamos garantir a atualização das assinaturas
        renderLista(listaParaExibir || [], false);

        // FORÇAR atualização real de assinaturas para os cards atuais
        // usa a função já existente startRealSignaturesUpdate
        // se a listaParaExibir for diferente de todosDocumentos (ex.: resultado de busca),
        // passamos essa lista para atualizar apenas os cards mostrados.
        if (typeof startRealSignaturesUpdate === "function") {
            startRealSignaturesUpdate(listaParaExibir || []);
        } else {
            // fallback: percorre e atualiza manualmente (robusto)
            (listaParaExibir || []).forEach((doc, idx) => {
                setTimeout(async () => {
                    const cardElement = document.getElementById(`doc-card-${doc.ID}`);
                    if (cardElement && typeof updateCardDetails === "function") {
                        await updateCardDetails(doc, cardElement);
                    }
                }, 40 * idx);
            });
        }
    }
}

// Configura evento do botão (com proteção caso o botão ainda não exista no DOM)
function ligarToggleButton() {
    const btn = document.getElementById("toggleView");
    if (!btn) {
        console.warn("toggleView não encontrado — verifique se o botão está no HTML.");
        return;
    }

    // prevenir dupla ligação
    btn.removeEventListener?.("click", toggleClickHandler);

    btn.addEventListener("click", toggleClickHandler);
}

function toggleClickHandler(e) {
    e.preventDefault();

    // Alterna o modo atual
    modoTabela = !modoTabela;

    // Salva no localStorage
    localStorage.setItem("assinador_modo_tabela", modoTabela);

    // Reaplica o modo de visualização usando a lista atualmente exibida

    aplicarModoVisualizacao(todosDocumentos, false);
}


// ------------------------------
// Eventos UI
// ------------------------------
const buscaInput = document.getElementById("Busca");
if (buscaInput) {
    buscaInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            executarBusca();
        }
    });
} else {
    console.warn("Campo de busca (#Busca) não encontrado — eventos não foram ligados.");
}

// start
// Após carregar dados, renderiza baseado no modo salvo
loadAssinador();

// Verifica se existe o parâmetro 'busca' na URL (Ex: lista.html?busca=123.456)
async function verificarParametrosURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const termoBusca = urlParams.get('busca');

    if (termoBusca) {
        // Aguarda um pouco para garantir que a carga inicial não sobreponha a busca
        setTimeout(() => {
            executarBusca(termoBusca);
        }, 500);
    }
}

// Chame a função após o load inicial
loadAssinador().then(() => {
    verificarParametrosURL();
});



// Função para filtrar e exibir
async function filtrarPorGrupo() {
    const select = document.getElementById("selectGrupo");
    if (!select) return;

    const grupoSelecionado = select.value;
    
    if (grupoSelecionado === "todos") {
        aplicarModoVisualizacao(todosDocumentos, false);
        return;
    }

    const listaGrupos = obterGrupos();
    // Garante que idsNoGrupo seja sempre um Array de Strings
    const idsNoGrupo = (listaGrupos[grupoSelecionado] || []).map(id => String(id));

    if (idsNoGrupo.length === 0) {
        documentsList.innerHTML = `
            <div class="col-12 text-center mt-5 text-muted">
                <i class="fa fa-folder-open fa-3x"></i>
                <p class="mt-2">Este grupo está vazio.</p>
        </div>`;
        atualizarContagem(0);
        return;
    }

    showLoading();

    // 1. Busca rápida na memória
    let filtrados = todosDocumentos.filter(doc => idsNoGrupo.includes(String(doc.ID)));

    // 2. BUSCA NO CACHE (IndexedDB) - Se faltar algum ID da lista do grupo
    if (filtrados.length < idsNoGrupo.length) {
        // buscarListaCompleta() já lê do seu IndexedDB conforme seu arquivo
        const listaCache = await buscarListaCompleta(); 
        filtrados = listaCache.filter(doc => idsNoGrupo.includes(String(doc.ID)));
    }

    aplicarModoVisualizacao(filtrados, false);
    hideLoading();
}


function renderizarOpcoesGrupos() {
    const select = document.getElementById("selectGrupo");
    if (!select) return;
    
    const grupos = obterGrupos();
    const valorAtual = select.value;
    
    let html = '<option value="todos">📁 Todos os Documentos</option>';
    for (const nome in grupos) {
        // Correção do erro de digitação: .length
        const quantidade = grupos[nome].length; 
        html += `<option value="${nome}">📂 ${nome} (${quantidade})</option>`;
    }
    select.innerHTML = html;
    select.value = valorAtual;
}
// Inicializa o select ao carregar
renderizarOpcoesGrupos();


function garantirGrupo(boardName) {
   let grupos = JSON.parse(localStorage.getItem("assinador_grupos")) || {};

   if (!grupos[boardName]) {
       grupos[boardName] = [];
       localStorage.setItem("assinador_grupos", JSON.stringify(grupos));
   }
}


// Coloque isto dentro do seu init ou no final do arquivo
document.getElementById("documents-list")?.addEventListener("click", function(e) {
    // Identifica o botão clicado (mesmo se clicar no ícone interno)
    const btnAdd = e.target.closest(".btn-adicionar-ao-grupo");
    const btnRem = e.target.closest(".btn-remover-do-grupo");

    if (btnAdd) {
        e.preventDefault();
        const id = btnAdd.getAttribute("data-id");
        adicionarProcessoAoGrupo(id);
    } 
    else if (btnRem) {
        e.preventDefault();
        const id = btnRem.getAttribute("data-id");
        removerProcessoDoGrupo(id);
    }
});