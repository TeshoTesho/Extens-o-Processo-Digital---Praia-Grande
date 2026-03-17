const lista = JSON.parse(localStorage.getItem("emailsGerais")) || [];
const tbody = document.getElementById("listaEmails");

// Renderiza a lista
if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Nenhum e-mail salvo ainda</td></tr>`;
} else {
    lista.forEach(email => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class='text-dark'>${email.objeto_termo}</td>
            <td class='text-dark'>${email.modalidade_licitacao}</td>
            <td class='text-dark'>${email.numero_processo}</td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-success btn-usar" data-id="${email.id}">Usar</button>
                <button class="btn btn-sm btn-danger btn-apagar" data-id="${email.id}">Apagar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ESCUTADOR DE EVENTOS (Substitui o onclick)
tbody.addEventListener('click', (event) => {
    // Verifica se o clique foi no botão 'Usar'
    if (event.target.classList.contains('btn-usar')) {
        const id = parseInt(event.target.getAttribute('data-id'));
        usarEmail(id);
    }
    
    // Verifica se o clique foi no botão 'Apagar'
    if (event.target.classList.contains('btn-apagar')) {
        const id = parseInt(event.target.getAttribute('data-id'));
        apagarEmail(id);
    }
});

// Botão de Adicionar
document.getElementById('AddMail').addEventListener('click', () => {
    window.location.href = "convocacao_geral.html";
});

function usarEmail(id) {
    const email = lista.find(e => e.id === id);
    localStorage.setItem("dadosEmailSelecionado", JSON.stringify(email));
    window.location.href = "convocacao_individual.html";
}

function apagarEmail(id) {
    if (!confirm("Deseja realmente apagar este e-mail?")) return;
    const novaLista = lista.filter(e => e.id !== id);
    localStorage.setItem("emailsGerais", JSON.stringify(novaLista));
    location.reload();
}