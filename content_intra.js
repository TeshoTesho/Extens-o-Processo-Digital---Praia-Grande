(function () {

    const STORAGE_KEY = "assinador_preferencia";
    const NEW_VIEW_URL = chrome.runtime.getURL("lista_assinador.html");

    // Recupera a preferência usando chrome.storage.local (ASSÍNCRONO)
    function getPref(callback) {
        chrome.storage.local.get([STORAGE_KEY], result => {
            callback(result[STORAGE_KEY] || {});
        });
    }

    // Salva a preferência
    function setPref(obj) {
        chrome.storage.local.set({ [STORAGE_KEY]: obj });
    }

    // Remove preferência
    function removePref(callback) {
        chrome.storage.local.remove(STORAGE_KEY, callback);
    }

    // Exibe o modal
    function showPrompt() {
        getPref(pref => {
            const agora = Date.now();

            // SE "sempre usar"
            if (pref.choice === "always") {
                chrome.runtime.sendMessage({ action: "openNewViewTab" });
                return;
            }

            // SE "deixar pra depois" e ainda não venceu o prazo
            if (pref.choice === "later" && pref.until && agora < pref.until) {
                return;
            }

            // Se venceu o prazo → limpar
            if (pref.choice === "later" && pref.until && agora >= pref.until) {
                removePref(() => {});
            }

            // Exibe SweetAlert
            Swal.fire({
                title: "✨ Novo Assinador disponível!",
                html: "Deseja testar a nova tela de assinaturas?",
                icon: "question",
                showCancelButton: true,
                showDenyButton: true,
                showConfirmButton: true,

                confirmButtonText: "Testar",
                denyButtonText: "Sempre usar",
                cancelButtonText: "Deixar para depois (24h)",
                reverseButtons: true
            }).then(res => {

                // TESTAR
                if (res.isConfirmed) {

                    setPref({ choice: "test" }); // não grava permanente

                    chrome.runtime.sendMessage({
                        action: "openNewViewTab"
                    });

                    return;
                }

                // SEMPRE
                if (res.isDenied) {

                    setPref({ choice: "always" });

                    chrome.runtime.sendMessage({
                        action: "openNewViewTab"
                    });

                    return;
                }

                // DEPOIS
                if (res.dismiss === Swal.DismissReason.cancel) {

                    setPref({
                        choice: "later",
                        until: Date.now() + (24 * 60 * 60 * 1000) // 24h
                    });

                    return;
                }

            });
        });
    }

    // Executa após pequeno delay
    setTimeout(showPrompt, 50);

})();
