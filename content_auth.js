(function() {
    // 1. Localiza o elemento na página
    const elemento = document.querySelector('a.etapa.btn-primary');
    
    if (elemento) {
        // A variável é definida aqui dentro
        const destinoEncontrado = elemento.textContent.trim();
        console.log("Destino identificado:", destinoEncontrado);

        // 2. Envia a mensagem para o background para SALVAR e RETORNAR os dados
        chrome.runtime.sendMessage({ 
            action: "capturarDadosCompletos", 
            destino: destinoEncontrado 
        }, (dados) => {
            if (dados && !dados.erro) {
                // Aqui você já tem acesso a tudo o que o background salvou
                console.log("Dados salvos e prontos para uso:", dados);
                
                // Variáveis individuais se precisar usar agora:
                const meuDestino = dados.destino;
                const meuNome = dados.nome;
                const meuCpf = dados.cpf;

                // Exemplo: Salva globalmente se precisar acessar de outros scripts
                window.meusDadosCapturados = dados;
            } else {
                console.error("Erro ao receber dados do background:", dados?.erro);
            }
        });

    } else {
        console.warn("Elemento SEAD não encontrado nesta página.");
    }
})();

// REVISÃO: O código que estava aqui embaixo foi removido 
// pois causava o erro de 'variável não definida'.