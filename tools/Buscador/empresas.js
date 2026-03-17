let db;
let offsetAtual = 0;
const LIMITE_EXIBICAO = 80;

// Inicialização do Banco
const request = indexedDB.open("empresasDB", 4);
request.onsuccess = e => {
  db = e.target.result;
  listarEmpresas(true);
};

 function formatarCNPJ(cnpj) {
    const v = normalizarCNPJ(cnpj);
    if (v.length !== 14) return cnpj || "";

    return v.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
      );
  }
  
// ... (mantenha o request.onupgradeneeded igual ao anterior) ...

// MAPEAMENTO DE EVENTOS (Substitui o onclick)
document.addEventListener("DOMContentLoaded", () => {
    // Busca
    document.getElementById("busca").addEventListener("input", () => listarEmpresas(true));
    
    // Botões Principais
    document.getElementById("btnCarregarMais").addEventListener("click", carregarMais);
    document.getElementById("btnNovaEmpresa").addEventListener("click", abrirCadastro);
    document.getElementById("btnLimparDuplicados").addEventListener("click", eliminarEmpresasDuplicadas);
    
    // Importação
    document.getElementById("btnAbrirImportar").addEventListener("click", abrirModalImportacao);
    document.getElementById("arquivoExcel").addEventListener("change", habilitarImportacao);
    document.getElementById("btnConfirmarImportacao").addEventListener("click", confirmarImportacao);
    
    // Salvar
    document.getElementById("btnSalvarEmpresa").addEventListener("click", salvarEmpresa);
    document.getElementById("btnSalvarResponsavel").addEventListener("click", salvarResponsavel);

    // Eventos Delegados para a Tabela (Editar/Excluir/Resumo)
    document.getElementById("lista").addEventListener("click", handleTableClick);
  });

request.onupgradeneeded = e => {
  db = e.target.result;

  let empStore;
  if (!db.objectStoreNames.contains("empresas")) {
    empStore = db.createObjectStore("empresas", { keyPath: "id", autoIncrement: true });
  } else {
    empStore = e.target.transaction.objectStore("empresas");
  }

  // 2. CRIE O ÍNDICE AQUI (Isso evita o erro NotFoundError)
  if (!empStore.indexNames.contains("razaoSocial")) {
    empStore.createIndex("razaoSocial", "razaoSocial", { unique: false });
  }

  if (!empStore.indexNames.contains("cnpj")) {
    empStore.createIndex("cnpj", "cnpj", { unique: true });
  }

  // responsáveis
  let respStore;
  if (!db.objectStoreNames.contains("responsaveis")) {
    respStore = db.createObjectStore("responsaveis", {
      keyPath: "id",
      autoIncrement: true
    });
  } else {
    respStore = e.target.transaction.objectStore("responsaveis");
  }

  if (!respStore.indexNames.contains("empresaId")) {
    respStore.createIndex("empresaId", "empresaId");
  }

  // contatos
  let contStore;
  if (!db.objectStoreNames.contains("contatos")) {
    contStore = db.createObjectStore("contatos", {
      keyPath: "id",
      autoIncrement: true
    });
  } else {
    contStore = e.target.transaction.objectStore("contatos");
  }

  if (!contStore.indexNames.contains("empresaId")) {
    contStore.createIndex("empresaId", "empresaId");
  }
};

function empresaJaExiste(cnpj, callback) {
  const cnpjLimpo = normalizarCNPJ(cnpj);
  if (!cnpjLimpo) {
    callback(false);
    return;
  }

  const tx = db.transaction("empresas", "readonly");
  const store = tx.objectStore("empresas");

  store.index("cnpj").get(cnpjLimpo).onsuccess = e => {
    callback(!!e.target.result);
  };
}


function listarEmpresas() {
  const buscaInput = document.getElementById("busca");
  const busca = buscaInput ? buscaInput.value.toLowerCase() : "";
  const tbody = document.getElementById("lista");
  tbody.innerHTML = "";

  const tx = db.transaction("empresas", "readonly");
  const store = tx.objectStore("empresas");
  
  // Usamos o índice para garantir a ordem alfabética
  // Se não criou o índice 'razaoSocial', use a store diretamente, 
  // mas a ordem será pelo ID (ordem de inserção).
  const index = store.index("razaoSocial"); 
  let contador = 0;

  index.openCursor().onsuccess = e => {
    const cursor = e.target.result;
    if (cursor && contador < LIMITE_EXIBICAO) {
      const emp = cursor.value;
      const razao = (emp.razaoSocial || "").toLowerCase();
      const cnpj = (emp.cnpj || "").toLowerCase();

      // Filtro apenas por Razão Social e CNPJ
      if (razao.includes(busca) || cnpj.includes(busca)) {
        renderizarLinha(emp);
        contador++;
      }
      cursor.continue();
    }
  };
}


function abrirCadastro() {
  document.getElementById("empresaId").value = "";
  document.querySelectorAll(".modal-body input").forEach(i => i.value = "");
  new bootstrap.Modal(document.getElementById("modalEmpresa")).show();
}

function salvarEmpresa(form) {
  const cnpjLimpo = normalizarCNPJ(form.cnpj.value);

  empresaJaExiste(cnpjLimpo, existe => {
    if (existe) {
      Swal.fire(
        "CNPJ já cadastrado",
        "Já existe uma empresa com este CNPJ",
        "warning"
        );
      return;
    }

    const tx = db.transaction("empresas", "readwrite");
    tx.objectStore("empresas").add({
      razaoSocial: form.razao.value,
      abrev: form.abrev.value,
      cnpj: cnpjLimpo,
      endereco: form.endereco.value,
      cep: form.cep.value
    });

    tx.oncomplete = () => {
      Swal.fire("Sucesso", "Empresa cadastrada", "success");
      listarEmpresas();
    };
  });
}
// Função auxiliar para não repetir código de criação de TR
function renderizarLinha(emp) {
  const tbody = document.getElementById("lista");

  tbody.insertAdjacentHTML("beforeend", `
    <tr class="linha-empresa" data-action="resumo" data-id="${emp.id}" style="cursor:pointer">
      <td class="text-truncate" style="max-width:400px">
        ${emp.razaoSocial || "<span class='text-muted'>Sem razão social</span>"}
      </td>
      <td>${formatarCNPJ(emp.cnpj)}</td>
      <td>
        <button class="btn btn-sm btn-secondary" data-action="responsaveis" data-id="${emp.id}">
          <i class="fa fa-user-tie"></i>
        </button>
        <button class="btn btn-sm btn-info text-white" data-action="contatos" data-id="${emp.id}">
          <i class="fa fa-phone"></i>
        </button>
        <button class="btn btn-sm btn-warning" data-action="editar" data-id="${emp.id}">
          <i class="fa fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" data-action="excluir" data-id="${emp.id}">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `);
}
function handleTableClick(e) {
  const alvo = e.target.closest("[data-action]");
  if (!alvo) return;

  const id = Number(alvo.dataset.id);
  const acao = alvo.dataset.action;

  e.stopPropagation();

  switch (acao) {
    case "resumo":
      abrirResumoEmpresa(id);
      break;
    case "responsaveis":
      abrirResponsaveis(id);
      break;
    case "contatos":
      abrirContatos(id);
      break;
    case "editar":
      editar(id);
      break;
    case "excluir":
      excluir(id);
      break;
  }
}

document.getElementById("lista").addEventListener("click", e => {
  const alvo = e.target.closest("[data-action]");
  if (!alvo) return;

  const id = Number(alvo.dataset.id);
  const acao = alvo.dataset.action;

  e.stopPropagation();

  switch (acao) {
    case "resumo":
      abrirResumoEmpresa(id);
      break;
    case "responsaveis":
      abrirResponsaveis(id);
      break;
    case "contatos":
      abrirContatos(id);
      break;
    case "editar":
      editar(id);
      break;
    case "excluir":
      excluir(id);
      break;
  }
});



  function editar(id) {
    const tx = db.transaction("empresas", "readonly");
    const store = tx.objectStore("empresas");

    store.get(id).onsuccess = e => {
      const emp = e.target.result;
      empresaId.value = emp.id;
      razaoSocial.value = emp.razaoSocial;
      abrev.value = emp.abrev;
      cnpj.value = emp.cnpj;
      endereco.value = emp.endereco;
      cep.value = emp.cep;

      new bootstrap.Modal(modalEmpresa).show();
    };
  }

  function excluir(id) {
    Swal.fire({
      title: "Excluir?",
      text: "Essa ação não pode ser desfeita",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir"
    }).then(r => {
      if (r.isConfirmed) {
        const tx = db.transaction(["empresas", "responsaveis", "contatos"], "readwrite");
        tx.objectStore("empresas").delete(id);
        Swal.fire("Excluído", "", "success");
        listarEmpresas();
      }
    });
  }

  function abrirContatos(empresaId) {
    contEmpresaId.value = empresaId;
    contId.value = "";
    listarContatos();
    new bootstrap.Modal(modalContatos).show();
  }

  function salvarContato() {
    const obj = {
      empresaId: Number(contEmpresaId.value),
      email: contEmail.value,
      telefone: contTelefone.value
    };

    const store = db.transaction("contatos", "readwrite").objectStore("contatos");

    if (contId.value) {
      obj.id = Number(contId.value);
      store.put(obj);
    } else {
      store.add(obj);
    }

    contId.value = "";
    contEmail.value = contTelefone.value = "";
    listarContatos();
  }

  function listarContatos() {
    listaContatos.innerHTML = "";
    const store = db.transaction("contatos").objectStore("contatos");

    store.openCursor().onsuccess = e => {
      const c = e.target.result;
      if (c) {
        const ct = c.value;
        if (ct.empresaId == contEmpresaId.value) {
          listaContatos.innerHTML += `
          <li class="list-group-item d-flex justify-content-between">
          ${ct.email ? `<div>Email: ${ct.email}</div>` : ""}
          ${ct.telefone ? `<div>Telefone: ${ct.telefone}</div>` : ""}
          <div>
          <button data-action="editar-contato" data-id="${ct.id}">
          <i class="fa fa-edit"></i>
          </button>
          <button
  class="btn btn-sm btn-danger"
  data-action="excluir-contato"
  data-id="${ct.id}">
  <i class="fa fa-trash"></i>
</button>
          <i class="fa fa-trash"></i>
          </button>
          </div>
          </li>`;
        }
        c.continue();
      }
    };
  }

  let listaContatos;

  document.addEventListener("DOMContentLoaded", () => {
  listaContatos = document.getElementById("listaContatos");

  if (!listaContatos) {
    console.warn("⚠️ listaContatos não encontrada no DOM");
    return;
  }

  listaContatos.addEventListener("click", e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const id = Number(btn.dataset.id);

    if (btn.dataset.action === "editar-contato") editarContato(id);
    if (btn.dataset.action === "excluir-contato") excluirContato(id);
  });
});


listaContatos.addEventListener("click", e => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.dataset.id);

  if (btn.dataset.action === "editar-contato") editarContato(id);
  if (btn.dataset.action === "excluir-contato") excluirContato(id);
});
document.getElementById("listaContatos").addEventListener("click", e => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.dataset.id);

  if (btn.dataset.action === "excluir-contato") {
    excluirContato(id);
  }
});

  function editarContato(id) {
    const store = db.transaction("contatos").objectStore("contatos");
    store.get(id).onsuccess = e => {
      const c = e.target.result;
      contId.value = c.id;
      contEmail.value = c.email;
      contTelefone.value = c.telefone;
    };
  }

  function excluirContato(id) {
    Swal.fire({
      title: "Excluir contato?",
      icon: "warning",
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) {
        db.transaction("contatos", "readwrite")
        .objectStore("contatos")
        .delete(id);
        listarContatos();
      }
    });
  }


  function abrirResponsaveis(empresaId) {
    respEmpresaId.value = empresaId;
    respId.value = "";
    listarResponsaveis();
    new bootstrap.Modal(modalResponsaveis).show();
  }

  function salvarResponsavel() {
    const obj = {
      empresaId: Number(respEmpresaId.value),
      nome: respNome.value,
      rg: respRG.value,
      cpf: respCPF.value,
      cargo: respCargo.value
    };

    const tx = db.transaction("responsaveis", "readwrite");
    const store = tx.objectStore("responsaveis");

    if (respId.value) {
      obj.id = Number(respId.value);
      store.put(obj);
    } else {
      store.add(obj);
    }

    tx.oncomplete = () => {
      respId.value = "";
      respNome.value = respRG.value = respCPF.value = respCargo.value = "";
      listarResponsaveis();
    };
  }

  function listarResponsaveis() {
    const tbody = listaResponsaveis;
    tbody.innerHTML = "";

    const tx = db.transaction("responsaveis", "readonly");
    const store = tx.objectStore("responsaveis");

    store.openCursor().onsuccess = e => {
      const c = e.target.result;
      if (c) {
        const r = c.value;
        if (r.empresaId == respEmpresaId.value) {
          tbody.innerHTML += `
          <tr>
          <td>${r.nome}</td>
          <td>${r.cpf}</td>
          <td>${r.cargo}</td>
          <td>
          <button class="btn btn-sm btn-warning" data-action="editar-resp" data-id="${r.id}">
          <i class="fa fa-edit"></i>
          </button>
          <button
  class="btn btn-sm btn-danger"
  data-action="excluir-responsavel"
  data-id="${r.id}">
  <i class="fa fa-trash"></i>
</button>
          <i class="fa fa-trash"></i>
          </button>
          </td>
          </tr>`;
        }
        c.continue();
      }
    };
  }
listaResponsaveis.addEventListener("click", e => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.dataset.id);

  if (btn.dataset.action === "editar-resp") editarResponsavel(id);
  if (btn.dataset.action === "excluir-resp") excluirResponsavel(id);
});

document.getElementById("listaResponsaveis").addEventListener("click", e => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.dataset.id);

  if (btn.dataset.action === "excluir-responsavel") {
    excluirResponsavel(id);
  }
});



  function editarResponsavel(id) {
    const store = db.transaction("responsaveis").objectStore("responsaveis");
    store.get(id).onsuccess = e => {
      const r = e.target.result;
      respId.value = r.id;
      respNome.value = r.nome;
      respRG.value = r.rg;
      respCPF.value = r.cpf;
      respCargo.value = r.cargo;
    };
  }

  function excluirResponsavel(id) {
    Swal.fire({
      title: "Excluir responsável?",
      icon: "warning",
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) {
        db.transaction("responsaveis", "readwrite")
        .objectStore("responsaveis")
        .delete(id);
        listarResponsaveis();
      }
    });
  }
  function abrirResumoEmpresa(empresaId) {
    const tx = db.transaction(["empresas", "responsaveis", "contatos"], "readonly");

    const empresasStore = tx.objectStore("empresas");
    const respStore = tx.objectStore("responsaveis");
    const contStore = tx.objectStore("contatos");

    empresasStore.get(empresaId).onsuccess = e => {
      const emp = e.target.result;

      let html = `
      <h6 class="mt-2"><i class="fa fa-building"></i> Empresa</h6>
      ${campo("Razão Social", emp.razaoSocial)}
      ${campo("Abreviação", emp.abrev)}
      ${campo("CNPJ", emp.cnpj)}
      ${campo("CEP", emp.cep)}
      ${campo("Endereço", emp.endereco)}
      <hr>
      <h6><i class="fa fa-user-tie"></i> Responsáveis Legais</h6>
      `;

      let temResponsavel = false;

      respStore.openCursor().onsuccess = ev => {
        const c = ev.target.result;
        if (c) {
          const r = c.value;
          if (r.empresaId === empresaId) {
            temResponsavel = true;
            html += `
            <div class="mb-2">
            ${campo("Nome", r.nome)}
            ${campo("CPF", r.cpf)}
            ${campo("RG", r.rg)}
            ${campo("Cargo", r.cargo)}
            </div>
            <hr class="my-2">
            `;
          }
          c.continue();
        } else {
          if (!temResponsavel) {
            html += `<div class="text-muted">Nenhum responsável cadastrado</div>`;
          }

          html += `<hr><h6><i class="fa fa-phone"></i> Contatos</h6>`;

          let temContato = false;

          contStore.openCursor().onsuccess = ev2 => {
            const c2 = ev2.target.result;
            if (c2) {
              const ct = c2.value;
              if (ct.empresaId === empresaId) {
                temContato = true;
                html += `
                ${ct.email ? campo("Email", ct.email) : ""}
                ${ct.telefone ? campo("Telefone", ct.telefone) : ""}
                `;
              }
              c2.continue();
            } else {
              if (!temContato) {
                html += `<div class="text-muted">Nenhum contato cadastrado</div>`;
              }

              conteudoResumo.innerHTML = html;
              new bootstrap.Modal(modalResumoEmpresa).show();
            }
          };
        }
      };
    };
  }
function campo(label, valor) {
  if (!valor) return "";
  return `
    <div class="mb-1">
      <strong>${label}:</strong>
      <span class="text-primary copiar" data-texto="${valor}" style="cursor:pointer">
        ${valor}
      </span>
    </div>
  `;
}
document.addEventListener("click", e => {
  const el = e.target.closest(".copiar");
  if (!el) return;
  copiarTexto(el.dataset.texto);
});

  function copiarTexto(texto) {
    navigator.clipboard.writeText(texto).then(() => {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Copiado!",
        showConfirmButton: false,
        timer: 1200
      });
    });
  }
  function importarExcel(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = e => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const linhas = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      processarLinhasExcel(linhas);
    };

    reader.readAsArrayBuffer(file);
  }

  function normalizarCNPJ(cnpj) {
    return (cnpj || "").replace(/\D/g, "");
  }


  async function processarLinhasExcel(linhas) {
  // Usamos um loop for...of para poder usar async/await e manter o fluxo sob controle
  for (const linhaOriginal of linhas) {
    const l = normalizarLinhaExcel(linhaOriginal);
    const cnpj = normalizarCNPJ(l.cnpj) || "";
    const razao = l.razaosocial || l.empresa || "";

    if (!razao && !cnpj) continue;

    // Criamos uma função interna para lidar com a gravação de cada empresa isoladamente
    await cadastrarEmpresaEObjetos(l, cnpj, razao);
  }

  Swal.fire("Importação concluída", "Os dados foram processados", "success");
  listarEmpresas();
}

// 2. Nova função auxiliar com sua própria transação
function cadastrarEmpresaEObjetos(l, cnpj, razao) {
  return new Promise((resolve) => {
    const tx = db.transaction(["empresas", "responsaveis", "contatos"], "readwrite");
    const empStore = tx.objectStore("empresas");

    // Verifica se existe
    const request = empStore.index("cnpj").get(cnpj);

    request.onsuccess = (e) => {
      const empresaExistente = e.target.result;

      if (empresaExistente) {
        // Se já existe, apenas salva as dependências para o ID existente
        salvarDependencias(tx, empresaExistente.id, l);
        resolve();
      } else {
        // Se não existe, adiciona e depois salva dependências
        const addRequest = empStore.add({
          razaoSocial: razao,
          abrev: l.abrev || "",
          cnpj: cnpj,
          endereco: l.endereco || l.enderecocompleto || "",
          cep: l.cep || ""
        });

        addRequest.onsuccess = (ev) => {
          salvarDependencias(tx, ev.target.result, l);
          resolve();
        };
      }
    };
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve(); // Evita travar o loop em caso de erro de duplicata
  });
}

// 3. Ajuste a salvarDependencias para aceitar a transação ativa (tx)
function salvarDependencias(tx, empresaId, l) {
  const respStore = tx.objectStore("responsaveis");
  const contStore = tx.objectStore("contatos");

  // --- Lógica de Responsáveis ---
  const textoResponsaveis = l.responsavel || l.responsavellegal || l.socios || "";
  const responsaveis = separarResponsaveisDeCelula(textoResponsaveis);

  responsaveis.forEach(r => {
    respStore.add({
      empresaId,
      nome: r.nome || "",
      cargo: r.cargo || "",
      rg: r.rg || "",
      cpf: r.cpf || ""
    });
  });

  // --- Lógica de Contatos ---
  const emails = extrairEmails(l.email || l.email2 || l.contato || "");
  const telefone = extrairTelefone(l.telefone || l.contato || "");

  if (emails.length > 0 || telefone) {
    contStore.add({
      empresaId,
      email: emails[0] || "",
      email2: emails[1] || "",
      telefone: telefone
    });
  }
}

function obterEmpresaPorCNPJ(cnpj, callback) {
  const tx = db.transaction("empresas", "readonly");
  const store = tx.objectStore("empresas");

  store.index("cnpj").get(cnpj).onsuccess = e => {
    callback(e.target.result || null);
  };
}


function confirmarImportacao() {
  Swal.fire({
    title: "Importar dados?",
    text: "Os dados do Excel serão gravados no sistema",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Importar"
  }).then(r => {
    if (r.isConfirmed) {
      importarExcel({ files: arquivoExcel.files });
      bootstrap.Modal.getInstance(modalImportarExcel).hide();
    }
  });
}
function abrirModalImportacao() {
  const modal = new bootstrap.Modal(
    document.getElementById("modalImportarExcel")
    );

  document.getElementById("arquivoExcel").value = "";
 document.getElementById("btnConfirmarImportacao").disabled = true;

  modal.show();
}

function habilitarImportacao() {
document.getElementById("btnConfirmarImportacao").disabled =
  !document.getElementById("arquivoExcel").files.length;
}

function confirmarImportacao() {
  Swal.fire({
    title: "Importar dados?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Importar"
  }).then(r => {
    if (r.isConfirmed) {
      importarExcel({
        files: document.getElementById("arquivoExcel").files
      });

      bootstrap.Modal
      .getInstance(document.getElementById("modalImportarExcel"))
      .hide();
    }
  });
}

function normalizarLinhaExcel(linha) {
  const normalizado = {};

  Object.keys(linha).forEach(k => {
    const chave = k
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z]/g, "");

    normalizado[chave] = String(linha[k]).trim();
  });

  return normalizado;
}
function extrairEmails(texto) {
  if (!texto) return [];

  const matches = texto.match(
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
    );

  // remove duplicados
  return matches ? [...new Set(matches)] : [];
}

function extrairTelefone(texto) {
  if (!texto) return "";
  const match = texto.match(/(\+55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}/);
  return match ? match[0] : "";
}

function eliminarEmpresasDuplicadas() {

  // 1️⃣ PRIMEIRA TRANSAÇÃO: detectar duplicadas
  const tx1 = db.transaction("empresas", "readonly");
  const empStore1 = tx1.objectStore("empresas");

  const mapa = {};
  const duplicadas = [];

  empStore1.openCursor().onsuccess = e => {
    const cursor = e.target.result;
    if (!cursor) return;

    const emp = cursor.value;
    const cnpj = normalizarCNPJ(emp.cnpj);

    if (!cnpj) {
      cursor.continue();
      return;
    }

    if (!mapa[cnpj]) {
      mapa[cnpj] = emp.id;
    } else {
      duplicadas.push({
        id: emp.id,
        manterId: mapa[cnpj]
      });
    }

    cursor.continue();
  };

  tx1.oncomplete = () => {

    if (duplicadas.length === 0) {
      Swal.fire("Tudo certo", "Nenhuma empresa duplicada encontrada", "success");
      return;
    }

    // 2️⃣ SEGUNDA TRANSAÇÃO: unificar dados
    const tx2 = db.transaction(
      ["empresas", "responsaveis", "contatos"],
      "readwrite"
      );

    const empStore = tx2.objectStore("empresas");
    const respStore = tx2.objectStore("responsaveis");
    const contStore = tx2.objectStore("contatos");

    duplicadas.forEach(d => {

      // 🔁 RESPONSÁVEIS
      respStore.index("empresaId")
      .openCursor(IDBKeyRange.only(d.id))
      .onsuccess = e => {
        const cur = e.target.result;
        if (!cur) return;

        const r = cur.value;
        r.empresaId = d.manterId;
        respStore.put(r);
        cur.delete();
        cur.continue();
      };

      // 🔁 CONTATOS
      contStore.index("empresaId")
      .openCursor(IDBKeyRange.only(d.id))
      .onsuccess = e => {
        const cur = e.target.result;
        if (!cur) return;

        const c = cur.value;
        c.empresaId = d.manterId;
        contStore.put(c);
        cur.delete();
        cur.continue();
      };

      // ❌ EXCLUI EMPRESA DUPLICADA
      empStore.delete(d.id);
    });

    tx2.oncomplete = () => {
      Swal.fire(
        "Limpeza concluída",
        `${duplicadas.length} empresa(s) duplicada(s) foram unificadas`,
        "success"
        );
      listarEmpresas();
    };
  };
}

function carregarMais() {
  offsetAtual += LIMITE_EXIBICAO;
  listarEmpresas(false);
}

function separarResponsaveisDeCelula(texto) {
  if (!texto) return [];

  const linhas = texto
  .split(/\r?\n/)
  .map(l => l.trimEnd())
  .filter(l => l.trim());

  const resp1 = {};
  const resp2 = {};

  linhas.forEach(linha => {
    // separa por 2 ou mais espaços (colunas visuais)
    const partes = linha.split(/\s{2,}/);

    if (partes[0]) atribuirCampo(resp1, partes[0]);
    if (partes[1]) atribuirCampo(resp2, partes[1]);
  });

  return [resp1, resp2].filter(r => Object.keys(r).length > 0);
}


function atribuirCampo(resp, valor) {
  valor = valor.trim();

  if (valor.includes("@")) {
    if (!resp.email) resp.email = valor;
    else resp.email2 = valor;
    return;
  }

  if (/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/.test(valor)) {
    resp.telefone = valor;
    return;
  }

  if (/\d{2}\.\d{3}\.\d{3}-\d/.test(valor)) {
    resp.rg = valor;
    return;
  }

  if (/socio|administrador|diretor|presidente/i.test(valor)) {
    resp.cargo = valor;
    return;
  }

  // fallback: nome
  if (!resp.nome) {
    resp.nome = valor;
  }
}
function eliminarDuplicadosGeral() {
  const tx = db.transaction(["empresas", "responsaveis", "contatos"], "readwrite");
  
  const empStore = tx.objectStore("empresas");
  const respStore = tx.objectStore("responsaveis");
  const contStore = tx.objectStore("contatos");

  // --- 1. LIMPAR RESPONSÁVEIS DUPLICADOS (Mesma Empresa + Mesmo CPF/Nome) ---
  const mapaResp = {}; // Chave: empresaId_cpf ou empresaId_nome
  respStore.openCursor().onsuccess = e => {
    const cursor = e.target.result;
    if (!cursor) return;

    const r = cursor.value;
    const cpfLimpo = r.cpf ? r.cpf.replace(/\D/g, "") : "";
    const chave = `${r.empresaId}_${cpfLimpo || r.nome.toLowerCase().trim()}`;

    if (!mapaResp[chave]) {
      mapaResp[chave] = r.id;
    } else {
      console.log("Removendo Responsável Duplicado:", r.nome);
      cursor.delete();
    }
    cursor.continue();
  };

  // --- 2. LIMPAR CONTATOS DUPLICADOS (Mesma Empresa + Mesmo Email/Telefone) ---
  const mapaCont = {}; // Chave: empresaId_email ou empresaId_telefone
  contStore.openCursor().onsuccess = e => {
    const cursor = e.target.result;
    if (!cursor) return;

    const c = cursor.value;
    const identificador = c.email ? c.email.toLowerCase().trim() : c.telefone;
    const chave = `${c.empresaId}_${identificador}`;

    if (!mapaCont[chave]) {
      mapaCont[chave] = c.id;
    } else {
      console.log("Removendo Contato Duplicado:", identificador);
      cursor.delete();
    }
    cursor.continue();
  };

  tx.oncomplete = () => {
    Swal.fire({
      title: "Limpeza Concluída",
      text: "Responsáveis e contatos duplicados na mesma empresa foram removidos.",
      icon: "success"
    });
    listarEmpresas();
  };
}