// Arquivo: formUtils.js - Lógica para submeter no Enter

document.addEventListener('DOMContentLoaded', () => {
    // 1. Encontra o input do nome da tag (onde o usuário digita por último)
    const tagNameInput = document.getElementById('tagName');
    const saveButton = document.getElementById('saveTag');
    
    if (tagNameInput && saveButton) {
        // 2. Adiciona o listener de tecla no campo de nome
        tagNameInput.addEventListener('keypress', (e) => {
            // Verifica se a tecla pressionada é Enter (código 13)
            if (e.key === 'Enter') {
                e.preventDefault(); // Impede a submissão padrão do formulário (se houver)
                saveButton.click(); // Simula o clique no botão "Salvar"
            }
        });
    }
});