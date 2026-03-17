// Arquivo: bem-vindo.js (REVISADO para evitar crash em ambiente não-Chrome)

const PREDEFINED_TAGS_KEY = 'predefinedTags';

// Função auxiliar para criar os botões e adicionar listeners
function renderTags(tags, gallery, toast) {
    gallery.innerHTML = ''; // Limpa o conteúdo inicial

    if (tags.length === 0) {
        gallery.innerHTML = '<p style="font-size: 12px; color: #999;">Nenhuma Tag Rápida salva. Configure em: Opções da Extensão.</p>';
        return;
    }

    tags.forEach((tag) => {
        const tagBtn = document.createElement('button');
        tagBtn.className = 'quick-tag-btn';
        tagBtn.textContent = tag.name;
        tagBtn.style.backgroundColor = tag.color;
        tagBtn.style.borderColor = tag.color;

        // Simulação de sucesso no clique
        tagBtn.addEventListener('click', () => {
            toast.textContent = `Tag '${tag.name}' aplicada ao PROCESSO 12345! (Simulação)`;
            toast.style.backgroundColor = tag.color;
            toast.style.display = 'block';

            // Esconde a notificação após 3 segundos
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        });

        gallery.appendChild(tagBtn);
    });
}

// Função principal para buscar tags e renderizar o demo
function renderQuickTagsDemo() {
    const gallery = document.getElementById('quickTagsGallery');
    const toast = document.getElementById('simulationToast');

    // Tags padrão, usadas como fallback
    const defaultTags = [{
            name: 'Urgente',
            color: '#dc3545'
        },
        {
            name: 'Revisar',
            color: '#ffc107'
        },
        {
            name: 'Concluído',
            color: '#0d6efd'
        }
    ];

    // 1. VERIFICAÇÃO CRÍTICA: Verifica se a API chrome.storage existe
    if (typeof chrome === 'undefined' || !chrome.storage) {
        gallery.innerHTML = '<p style="font-size: 12px; color: #dc3545;">AVISO: O armazenamento da extensão não pôde ser carregado. Usando tags de demonstração.</p>';

        // Renderiza com as tags padrão, mantendo a demonstração funcional
        renderTags(defaultTags, gallery, toast);
        return;
    }

    // 2. Se a API existe, buscamos as tags salvas
    chrome.storage.local.get(PREDEFINED_TAGS_KEY, (data) => {
        const tagsFromStorage = data[PREDEFINED_TAGS_KEY];

        // Se houver tags salvas, usa elas; caso contrário, usa as tags padrão
        const tagsToRender = (tagsFromStorage && tagsFromStorage.length > 0) ? tagsFromStorage : defaultTags;

        renderTags(tagsToRender, gallery, toast);
    });
}

// Inicializa a demonstração após o carregamento do DOM
document.addEventListener('DOMContentLoaded', renderQuickTagsDemo);