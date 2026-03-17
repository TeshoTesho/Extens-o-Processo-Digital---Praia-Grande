// content_dados.js
(function() {
    console.log("[Content-Dados] Script de captura de perfil carregado.");

    function salvarDados() {
        const cpf = document.querySelector('#cpf')?.value;
        const nome = document.querySelector('#Nome')?.value;

        // Só salva se ambos os campos tiverem valor (ignora se estiverem vazios/carregando)
        if (cpf && nome && cpf.length > 5) {
            chrome.storage.local.set({ 
                dadosPessoais: { 
                    nome: nome.trim(), 
                    cpf: cpf.trim(), 
                    timestamp: new Date().getTime() 
                } 
            }, () => {
               // console.log("[Content-Dados] SUCESSO: Dados salvos no storage!", {nome, cpf});
            });
            // Para de tentar capturar depois que salvou com sucesso
            clearInterval(tentativa);
        } else {
            console.log("[Content-Dados] Aguardando preenchimento dos campos...");
        }
    }

    // Tenta capturar a cada 1 segundo (útil para páginas lentas ou SPAs)
    const tentativa = setInterval(salvarDados, 1000);

    // Para de tentar após 10 segundos para não pesar o navegador
    setTimeout(() => clearInterval(tentativa), 10000);
})();