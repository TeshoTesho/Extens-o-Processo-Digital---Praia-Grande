
document.addEventListener("DOMContentLoaded", () => {
        let secretarias = [
            { abreviacao: "GP", secretaria: "Gabinete do Prefeito", nome: "REINALDO MOREIRA BRUNO", cargo: "Secretário Municipal Geral de Gabinete do Prefeito", cpf: "837.438.808-06", texto: "titular da Secretaria Geral de Gabinete do Prefeito, por atribuição conferida através do artigo 12-A" },
            { abreviacao: "SEG", secretaria: "Secretaria de Governo", nome: "CASSIO DE CASTRO NAVARRO", cargo: "Secretário Municipal de Governo", cpf: "272.459.998-56", texto: "titular da Secretaria de Governo, por atribuição conferida através do artigo 22, inciso VIII" },
            { abreviacao: "SEPLAN", secretaria: "Secretaria de Planejamento", nome: "JOSIE YABUTA DE LIMA HOLLANDA", cargo: "Secretária Municipal de Planejamento", cpf: "300.105.098-52", texto: "titular da Secretaria de Planejamento, por atribuição conferida através do artigo 25, inciso XV" },
            { abreviacao: "SEASP", secretaria: "Secretaria de Assuntos de Segurança Pública", nome: "MAURICIO VIEIRA IZUMI", cargo: "Secretário Municipal de Assuntos de Segurança Pública", cpf: "130.501.278-05", texto: "titular da Secretaria de Assuntos de Segurança Pública, por atribuição conferida através do artigo 28, inciso XIII" },
            { abreviacao: "SEAD", secretaria: "Secretaria de Administração", nome: "RONALDO FERREIRA DE ALCÂNTARA", cargo: "Secretário Municipal de Administração Interino", cpf: "121.247.468-63", texto: "Secretário Municipal de Administração Interino, por atribuição conferida através do inciso XVIII do artigo 31" },
            { abreviacao: "PROGEM", secretaria: "Procuradoria Geral do Município", nome: "GLAUCIA ANTUNES ALVAREZ", cargo: "Procuradora Geral do Município", cpf: "133.887.368-71", texto: "titular da Procuradoria Geral do Município, por atribuição conferida através do artigo 34, inciso XIX" },
            { abreviacao: "SEFIN", secretaria: "Secretaria de Finanças", nome: "CRISTIANO DE MOLA", cargo: "Secretário Municipal de Finanças", cpf: "291.045.598-00", texto: "titular da Secretaria de Finanças, por atribuição conferida através do artigo 40, inciso XX" },
            { abreviacao: "SEAS", secretaria: "Secretaria de Assistência Social", nome: "GISELE DOMINGUES", cargo: "Secretária Municipal de Assistência Social", cpf: "091.127.228-39", texto: "titular da Secretaria de Assistência Social, por atribuição conferida através do artigo 45, inciso IV" },
            { abreviacao: "SEDUC", secretaria: "Secretaria de Educação", nome: "PATRICIA CONCEIÇÃO ALMEIDA DIAS", cargo: "Secretária Municipal de Educação", cpf: "199.354.948-02", texto: "titular da Secretaria de Educação, por atribuição conferida através do artigo 48, inciso XXXI" },
            { abreviacao: "SESAP", secretaria: "Secretaria de Saúde Pública", nome: "JOSÉ ISAIAS COSTA LIMA", cargo: "Secretário Municipal de Saúde Pública", cpf: "318.588.378-04", texto: "titular da Secretaria de Saúde Pública, por atribuição conferida através do artigo 51, inciso XIX" },
            { abreviacao: "SEURB", secretaria: "Secretaria de Urbanismo", nome: "LUÍS FERNANDO FÉLIX DE PAULA", cargo: "Secretário Municipal de Urbanismo", cpf: "133.741.818-80", texto: "titular da Secretaria de Urbanismo, por atribuição conferida através do artigo 54, inciso X" },
            { abreviacao: "SEMA", secretaria: "Secretaria de Meio Ambiente", nome: "VALDIR PEREIRA RAMOS FILHO", cargo: "Secretário Municipal de Meio Ambiente", cpf: "312.019.218-05", texto: "titular da  Secretaria de Meio Ambiente, por atribuição conferida através do artigo 57, inciso IV" },
            { abreviacao: "SEOP", secretaria: "Secretaria de Obras Públicas", nome: "ELOISA OJEA GOMES TAVARES", cargo: "Secretária Municipal de Obras Públicas", cpf: "080.557.808-03", texto: "titular da Secretaria de Obras Públicas, por atribuição conferida através do artigo 60, inciso XII" },
            { abreviacao: "SEHAB", secretaria: "Secretaria de Habitação", nome: "FABRÍCIO MENEZES DE PAULA", cargo: "Secretário Municipal de Habitação", cpf: "270.442.408-01", texto: "titular da Secretaria de Habitação, por atribuição conferida através do artigo 63, inciso V" },
            { abreviacao: "SESURB", secretaria: "Secretaria de Serviços Urbanos", nome: "SORAIA M. MILAN", cargo: "Secretária Municipal de Serviços Urbanos", cpf: "134.045.568-44", texto: "titular da Secretaria de Serviços Urbanos, por atribuição conferida através do artigo 66, inciso XII" },
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

        const resultadoDiv = document.getElementById('resultado');
        const form = document.getElementById('secretariasForm');
        const listaSecretariasDiv = document.getElementById('listaSecretarias');
        const contadorSelecionadas = document.getElementById('contadorSelecionadas');

        const selecionarTudoBtn = document.getElementById('selecionarTudo');
        const deselecionarTudoBtn = document.getElementById('deselecionarTudo');
        const mensagemDiv = document.getElementById("mensagem");
        const emailGeradoDiv = document.getElementById("email_gerado");
        const tituloEmailDiv = document.getElementById("titulo_email");
        const outputEmailDivSegundo = document.getElementById("output_email_segundo");
        const outputEmailDivTerceiro = document.getElementById("output_email_terceiro");
        const outputEmailDivQuarto = document.getElementById("output_email_quarto");


        function mostrarMensagem(mensagem, tipo = 'alert') {
            mensagemDiv.textContent = mensagem;
            mensagemDiv.className = `alert ${tipo}`;
            mensagemDiv.classList.remove('hidden');
            setTimeout(() => {
                mensagemDiv.classList.add('hidden');
            }, 5000);
        }

        function esconderMensagem(mensagem, tipo = 'alert') {
            mensagemDiv.textContent = mensagem;
            mensagemDiv.className = `alert ${tipo}`;
            mensagemDiv.classList.add('hidden');
        }

// Limpa o container antes de gerar
listaSecretariasDiv.innerHTML = "";

// Cria um grid Bootstrap
const row = document.createElement('div');
row.classList.add('row', 'g-2');

secretarias.forEach((secretaria, index) => {
    const col = document.createElement('div');
    col.classList.add('col-6', 'col-md-4', 'col-lg-2'); // Responsivo

    const labelContainer = document.createElement('label');
    labelContainer.classList.add('checkbox-container', 'w-100');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('hidden-checkbox');
    checkbox.name = 'secretaria_' + index;
    checkbox.value = index;
    checkbox.id = 'secretaria_' + index;

    const spanTexto = document.createElement('span');
    spanTexto.classList.add('checkbox-text');
    spanTexto.textContent = secretaria.abreviacao;

    labelContainer.appendChild(checkbox);
    labelContainer.appendChild(spanTexto);
    col.appendChild(labelContainer);
    row.appendChild(col);
});

listaSecretariasDiv.appendChild(row);

// Atualiza o contador
function atualizarContador() {
    const selecionadas = document.querySelectorAll('.hidden-checkbox:checked').length;
    contadorSelecionadas.textContent = selecionadas;
}

// Clique no container atualiza o contador
const checkboxContainers = listaSecretariasDiv.querySelectorAll('.checkbox-container');
checkboxContainers.forEach(container => {
    const checkbox = container.querySelector('.hidden-checkbox');

    container.addEventListener('click', () => {
        checkbox.checked = !checkbox.checked;
        container.classList.toggle('checked', checkbox.checked);
        atualizarContador();
    });
});

// Botões Selecionar / Deselecionar Tudo
selecionarTudoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.hidden-checkbox').forEach(cb => cb.checked = true);
    checkboxContainers.forEach(c => c.classList.add('checked'));
    atualizarContador();
});

deselecionarTudoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.hidden-checkbox').forEach(cb => cb.checked = false);
    checkboxContainers.forEach(c => c.classList.remove('checked'));
    atualizarContador();
});






        // Lógica para o botão "Selecionar Tudo"
        selecionarTudoBtn.addEventListener('click', () => {
            hiddenCheckboxes.forEach((checkbox, index) => {
                checkbox.checked = true;
                checkboxContainers[index].classList.add('checked');
            });
        });

        // Lógica para o botão "Deselecionar Tudo"
        deselecionarTudoBtn.addEventListener('click', () => {
            hiddenCheckboxes.forEach((checkbox, index) => {
                checkbox.checked = false;
                checkboxContainers[index].classList.remove('checked');
            });
        });


        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const checkboxes = document.querySelectorAll('input[name^="secretaria_"][type="checkbox"]:checked');
            const selecionados = [];
            checkboxes.forEach(checkbox => {
                const index = parseInt(checkbox.value);
                selecionados.push(secretarias[index]);
            });
            resultadoDiv.textContent = 'Secretarias selecionadas: ' + selecionados.map(s => s.secretaria).join(', ');
            gerarEmail(selecionados);
        });



        function gerarEmail(secretariasSelecionadas) {
            if (secretariasSelecionadas.length === 0) {
                mostrarMensagem("Por favor, selecione pelo menos uma secretária para gerar o e-mail.", "alert");
                return;
            }else{
                esconderMensagem("","alert");
            }
            let primeiroTexto = "";

            let segundoTexto = `  <div align="center" style='color:#000;margin-top:0cm;margin-right:0cm;margin-bottom:12.0pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;'>
    <table style="width:587px;border-collapse:collapse;border:none;background-color: white;color:#000;">
        <tbody>`;
            var numSecretarias = secretariasSelecionadas.length;
            var contator = 0;
            if(numSecretarias % 2 === 0){

            }else{
                numSecretarias--;
            }
            for (let i = 0; i < numSecretarias ; i++) {

                contator++;

                const secretaria = secretariasSelecionadas[i];
                const nome = secretaria.nome;
                const cargo = secretaria.cargo;

                if (contator == 1) {

                    segundoTexto += `<tr>
                    <td style="width:50%;border:solid windowtext 1.0pt;padding:0cm 5.4pt 0cm 5.4pt;height:46.6pt;">
                        <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"CenturyGothic",sans-serif;text-align:center;'><strong style='text-transform: uppercase;'><span style="font-family:Century Gothic;">________________________________________</span></strong></p>
                        <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:center;'><strong style='text-transform: uppercase;'><span style="font-family:Century Gothic;">${nome}</span><br>${cargo}</strong></p>
                        </td>
                `;

                }else{

                    segundoTexto += `
                    <td style="width:50%;border:solid windowtext 1.0pt;padding:0cm 5.4pt 0cm 5.4pt;height:46.6pt;">
                         <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"CenturyGothic",sans-serif;text-align:center;'><strong style='text-transform: uppercase;'><span style="font-family:Century Gothic;">________________________________________</span></strong></p>
                        <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:center;'><strong style='text-transform: uppercase;'><span style="font-family:Century Gothic;">${nome}</span><br>${cargo}</strong></p>
                        </td>
                        </tr>
                `;
                contator = 0;
            }


            }
            if (contator == 0 ) {
                if(secretariasSelecionadas.length % 2 !== 0){
                const secretaria = secretariasSelecionadas[secretariasSelecionadas.length - 1];

                const nome = secretaria.nome;
                const cargo = secretaria.cargo;
                segundoTexto += `<tr>
                <td colspan="2" style="width:100%;border:solid windowtext 1.0pt;border:solid windowtext 1.0pt;padding:0cm 5.4pt 0cm 5.4pt;height:46.6pt;">
                <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"CenturyGothic",sans-serif;text-align:center;'><strong style='text-transform: uppercase;'><span style="font-family:Century Gothic;">________________________________________</span></strong></p>
                    <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:center;'><strong style='text-transform: uppercase;'><span style='font-family:"Century Gothic";'>${nome}<br>${cargo}</span></strong></p>
                </td>
            </tr>`;
            }
        }
            segundoTexto += `<tr>
                                                        <td colspan="2" style="width: 100%;border-right: 1pt solid windowtext;border-bottom: 1pt solid windowtext;border-left: 1pt solid windowtext;border-image: initial;border-top: none;padding: 0cm 5.4pt;height: 46.6pt;vertical-align: top;">
                    <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:center;'><strong style='text-transform: uppercase;'><span style="font-family:Century Gothic;">&nbsp;</span></strong></p>
                    <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"CenturyGothic",sans-serif;text-align:center;'><strong style='text-transform: uppercase;'><span style="font-family:Century Gothic;">________________________________________</span></strong></p>
                    <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:center;'><strong style='text-transform: uppercase;'><span style="font-family:Century Gothic;">XXXXXXXXX</span></p>
                    <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:center;'><strong style='text-transform: uppercase;'><span style="font-family:Century Gothic;">RESPONSÁVEL LEGAL PELA CONTRATADA</span></p>
                </td>
                                                        </tr>
                                                </table>
                                            </div>`;

                                         var terceirotexto = '';
                                         numSecretarias = secretariasSelecionadas.length;
            if( numSecretarias > 1){
                 terceirotexto = `
                <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><u><span style="font-family:Century Gothic;">RESPONS&Aacute;VEIS PELA HOMOLOGA&Ccedil;&Atilde;O DO CERTAME OU RATIFICA&Ccedil;&Atilde;O DA DISPENSA/INEXIGIBILIDADE DE LICITA&Ccedil;&Atilde;O, QUE ASSINARAM O AJUSTE, ORDENADORES DE DESPESAS DA CONTRATANTE E GESTORES DO CONTRATO:</span></u></strong></p>
                <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><u><span style="font-family:Century Gothic;"><span style="text-decoration:none;">&nbsp;</span></span></u></strong></p>
                <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><u><span style="font-family:Century Gothic;">Pelo contratante</span></u></strong><strong><span style="font-family:Century Gothic;">:</span></strong></p>
                <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><span style="font-family:Century Gothic;">&nbsp;</span></strong></p>`;
            }else{
                 terceirotexto = `
                 <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><u><span style="font-family:Century Gothic;">RESPONS&Aacute;VEL PELA HOMOLOGA&Ccedil;&Atilde;O DO CERTAME OU RATIFICA&Ccedil;&Atilde;O DA DISPENSA/INEXIGIBILIDADE DE LICITA&Ccedil;&Atilde;O, QUE ASSINOU O AJUSTE, ORDENADOR DE DESPESAS DA CONTRATANTE E GESTOR DO CONTRATO:</span></u></strong></p>
               <br> 
                <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><u><span style="font-family:Century Gothic;">Pelo contratante</span></u></strong><strong><span style="font-family:Century Gothic;">:</span></strong></p>
                <p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><span style="font-family:Century Gothic;">&nbsp;</span></strong></p> `;
            }
            
            for (let i = 0; i < numSecretarias; i++) {
                const secretaria = secretariasSelecionadas[i];
                const nome = secretaria.nome;
                const cargo = secretaria.cargo;
                const cpf = secretaria.cpf;

                terceirotexto += `<p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong style='text-transform: uppercase;'><span style="font-family:Century Gothic;">Nome: </span></strong><strong style='text-transform: uppercase;'><span style="font-family:Century Gothic;">${nome}</span></strong></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong style='text-transform: uppercase;'><span style="font-family:Century Gothic;">Cargo: </span></strong><span style="font-family:Century Gothic;">${cargo}</span></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong style='text-transform: uppercase;'><span style="font-family:Century Gothic;">CPF: </span></strong><span style="font-family:Century Gothic;">${cpf}</span></p>
<p style='font-family:"Century Gothic",sans-serif;text-align:justify;'><s><span style="font-family:Century Gothic;"><span style="text-decoration:none;"></span></span></s></p><p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><span style="font-family:Century Gothic;">&nbsp;</span></strong></p>`;
            }

            terceirotexto+=`<p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><u><span style="font-family:Century Gothic;">Pela contratada</span></u></strong><strong><span style="font-family:Century Gothic;">:</span></strong></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;line-height:125%;'><span style="font-family:Century Gothic;">&nbsp;</span></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><span style="font-family:Century Gothic;">Nome: </span></strong><strong><span style="font-family:Century Gothic;color:black;">XXXXXX</span></strong><span style="font-family:Century Gothic;color:black;">&nbsp;</span></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><span style="font-family:Century Gothic;">Cargo: </span></strong><span style="font-family:Century Gothic;">S&oacute;cio &ndash; administrador.</span></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:.0001pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><span style="font-family:Century Gothic;">CPF:</span></strong><span style="font-family:Century Gothic;">&nbsp;</span><span style="font-family:Century Gothic;color:black;">XXXXXX</span></p>
<p><strong><span style='font-size:9.5pt;font-family:"Century Gothic",sans-serif;'>Assinatura:</span></strong><span style='font-size:9.5pt;font-family:"Century Gothic",sans-serif;'>&nbsp;_________________________________________________________________________________</span></p>
  <p style="font-family:'Century Gothic','CenturyGothic', Arial, sans-serif;font-size:9.5pt;border-bottom:3px solid #000;<strong>&nbsp;</strong></p>
    <p style='margin-top:0cm;margin-right:0cm;margin-bottom:12.0pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;line-height:125%;border:none;padding:0cm;'><s><span style="font-family:Century Gothic;"><span style="text-decoration:none;">&nbsp;</span></span></s></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:12.0pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;line-height:125%;'><strong><u><span style="font-family:Century Gothic;">DEMAIS RESPONS&Aacute;VEIS(*):</span></u></strong></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:12.0pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><span style="font-family:Century Gothic;">Tipo de ato sob sua responsabilidade: _______________________________________________________</span></strong></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:12.0pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><span style="font-family:Century Gothic;">Nome: </span></strong><strong><span style='font-family:"Times New Roman";'>_____________________________________________________________________________________</span></strong></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:12.0pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><span style="font-family:Century Gothic;">Cargo: </span></strong><span style="font-family:Century Gothic;">_____________________________________________________________________________________</span></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:12.0pt;margin-left:0cm;font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify;'><strong><span style="font-family:Century Gothic;">CPF: </span></strong><span style="font-family:Century Gothic;">_______________________________________________________________________________________</span></p>
<p><strong><span style='font-size:9.5pt;font-family:"Century Gothic",sans-serif;'>Assinatura:</span></strong><span style='font-size:9.5pt;font-family:"Century Gothic",sans-serif;'>&nbsp;_________________________________________________________________________________</span></p>


<p style="font-family:'Century Gothic','CenturyGothic', Arial, sans-serif;font-size:9.5pt;border-bottom:3px solid #000;<strong>&nbsp;</strong></p>


<p><strong><span style='font-size:9.5pt;font-family:"Century Gothic",sans-serif;'>&nbsp;</p>


<p style='font-size:9.5pt;font-family:"Century Gothic",sans-serif;text-align:justify; '><span style="font-family:Century Gothic;">(*) - O Termo de Ci&ecirc;ncia e Notifica&ccedil;&atilde;o e/ou Cadastro do(s) Respons&aacute;vel(is) deve identificar as pessoas f&iacute;sicas que tenham concorrido para a pr&aacute;tica do ato jur&iacute;dico, &nbsp;na &nbsp;condi&ccedil;&atilde;o &nbsp; de &nbsp;ordenador &nbsp;da &nbsp; despesa; &nbsp;de &nbsp;partes &nbsp; contratantes; de respons&aacute;veis por a&ccedil;&otilde;es de acompanhamento, monitoramento e avalia&ccedil;&atilde;o; de respons&aacute;veis por processos licitat&oacute;rios; de respons&aacute;veis por presta&ccedil;&otilde;es de contas; de respons&aacute;veis com atribui&ccedil;&otilde;es previstas em atos legais ou administrativos e de interessados relacionados a processos de compet&ecirc;ncia deste Tribunal. Na hip&oacute;tese de presta&ccedil;&otilde;es de contas, caso o signat&aacute;rio do parecer conclusivo seja distinto daqueles j&aacute; arrolados como subscritores do Termo de Ci&ecirc;ncia e Notifica&ccedil;&atilde;o, ser&aacute; ele objeto de notifica&ccedil;&atilde;o espec&iacute;fica. (inciso acrescido pela Resolu&ccedil;&atilde;o n&ordm; 11/2021)</span></p>
`;


             const checkboxData = document.querySelector('input[name="data"]');
           
                let quartotexto = "";
                const dataAtual = new Date();
      const dia = dataAtual.getDate();
    
function numeroPorExtenso(num) {
    const unidades = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "", "vinte", "trinta"];
    
    if (num < 10) return unidades[num];
    if (num < 20) return especiais[num - 10];
    if (num < 30) return (num === 20) ? "vinte" : "vinte e " + unidades[num - 20];
    return (num === 30) ? "trinta" : "trinta e " + unidades[num - 30];
}
function anoPorExtenso(ano) {
    const milhares = ["", "mil", "dois mil", "três mil"];
    const centenas = ["", "cem", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
    const dezenas = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];

    if (ano >= 2000 && ano < 2100) {
        const resto = ano - 2000;
        if (resto === 0) return "dois mil";
        if (resto < 10) return "dois mil e " + unidades[resto];
        if (resto < 20) return "dois mil e " + especiais[resto - 10];
        const dezena = Math.floor(resto / 10);
        const unidade = resto % 10;
        if (unidade === 0) return "dois mil e " + dezenas[dezena];
        return "dois mil e " + dezenas[dezena] + " e " + unidades[unidade];
    }

    return ano.toString(); // fallback
}
// Criação da data
const diaExtenso = numeroPorExtenso(dataAtual.getDate());
const mes = dataAtual.toLocaleString('pt-BR', { month: 'long' });
const ano = dataAtual.getFullYear();

const anoExtenso = anoPorExtenso(dataAtual.getFullYear());

const dataFormatada = `Aos ${diaExtenso} de ${mes} de ${anoExtenso}`;


                if(checkboxData.checked){
                    quartotexto+=`<p><span style='font-size:9.5pt;font-family:"Century Gothic",sans-serif;color:#000;'>${dataFormatada}, na`;
                }else{
                    quartotexto+=`<p><span style='font-size:9.5pt;font-family:"Century Gothic",sans-serif;color:#000;'>Na`;
                }


                quartotexto += ` Divisão de Expediente Administrativo, da Secretaria de Administração, da <strong style='text-transform: uppercase;'>PREFEITURA DA ESTÂNCIA BALNEÁRIA DE PRAIA GRANDE</strong>, Pessoa Jurídica de Direito Público Interno, inscrita no CNPJ/MF sob nº. 46.177.531/0001-55, localizada à Avenida Presidente Kennedy, nº. 9.000 - Vila Mirim, Praia Grande/SP,`;





            numSecretarias = secretariasSelecionadas.length;

            if(numSecretarias > 1){
                 quartotexto += `onde se achavam os presentes senhores </span>`;
            }else{
                quartotexto += `onde se achava o(a) presente senhor(a) </span>`;
            }


            for (let i = 0; i < numSecretarias; i++) {
                const secretaria = secretariasSelecionadas[i];
                const nome = secretaria.nome;
                const cargo = secretaria.cargo;
                const cpf = secretaria.cpf;

                const texto = secretaria.texto;

                if(i==numSecretarias-1){
                    quartotexto += `<span style='font-size:9.5pt;font-family:"Century Gothic",sans-serif;color:#000;'><strong style='text-transform: uppercase;'>${nome},&nbsp;</strong>${texto}</span>`;
                }else{
                    quartotexto += `<span style='font-size:9.5pt;font-family:"Century Gothic",sans-serif;color:#000;'><strong style='text-transform: uppercase;'>${nome},&nbsp;</strong>${texto}; </span>`;
                }

                
            }

              if(numSecretarias > 1){
                 quartotexto +=`<span style='font-size:9.5pt;font-family:"Century Gothic",sans-serif;color:#000;'>, referentes à Lei Complementar Municipal nº. 913/2022 alterada pela Lei Complementar nº. 1.011/2025.</span></p>`;
            }else{
                quartotexto +=`<span style='font-size:9.5pt;font-family:"Century Gothic",sans-serif;color:#000;'>, referente à Lei Complementar Municipal nº. 913/2022 alterada pela Lei Complementar nº. 1.011/2025.</span></p>`;
            }





            //tituloEmailDiv.innerHTML =    `<h2><span style='font-size:16px;font-family:"Century Gothic",sans-serif;color:black;'>Convocação para Assinatura: Termo de Ata</span></h2>`;
            outputEmailDivSegundo.innerHTML =  segundoTexto;

            outputEmailDivTerceiro.innerHTML =  terceirotexto;
            outputEmailDivQuarto.innerHTML =  quartotexto;
            emailGeradoDiv.classList.remove('hidden');




        }

        function copiarEmail() {
            const emailTexto = outputEmailDivSegundo.innerText + "\n" + outputEmailDivTerceiro.innerText + "\n" + outputEmailDivQuarto.innerText;
            navigator.clipboard.writeText(emailTexto).then(() => {
                alert('Texto copiado para a área de transferência!');
            }).catch(err => {
                console.error('Falha ao copiar: ', err);
                alert('Não foi possível copiar o texto. Por favor, selecione e copie manualmente.');
            });
        }

        function selecionarTexto(numeroTexto) {
            let textoParaSelecionar = "";
            switch (numeroTexto) {
                case 2:
                    textoParaSelecionar = outputEmailDivSegundo.innerText;
                    break;
                case 3:
                    textoParaSelecionar = outputEmailDivTerceiro.innerText;
                    break;
                case 4:
                    textoParaSelecionar = outputEmailDivQuarto.innerText;
                    break;
                default:
                    alert('Número do texto inválido!');
                    return;
            }

            const range = document.createRange();
            const elementoTexto = numeroTexto === 2 ? outputEmailDivSegundo : numeroTexto === 3 ? outputEmailDivTerceiro : outputEmailDivQuarto;
            range.selectNodeContents(elementoTexto);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);

            //alert(`Texto ${numeroTexto} selecionado!`);

        }


    const btnTexto1 = document.getElementById("selecionar_texto_segundo");
    const btnTexto2 = document.getElementById("selecionar_texto_terceiro");
    const btnTexto3 = document.getElementById("selecionar_texto_quarto");

        btnTexto1.addEventListener("click", () => selecionarTexto(4));
btnTexto2.addEventListener("click", () => selecionarTexto(2));
btnTexto3.addEventListener("click", () => selecionarTexto(3));


        function selecionarEmail() {
            const range = document.createRange();
            range.selectNode(emailGeradoDiv);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        }

       // gerarEmailButton.addEventListener("click", gerarEmail);

});