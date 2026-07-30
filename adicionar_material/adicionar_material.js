document.addEventListener("DOMContentLoaded", function () {

    const input = document.getElementById("palavras-chave");
    const tags = document.getElementById("tags");
    const inputValor = document.getElementById("palavras-chave-valor");
    const form = document.getElementById("form-material");
    const tagsWrapper = document.querySelector(".tags-input");
    const arquivoInput = document.getElementById("arquivo");
    const nomeArquivoEl = document.getElementById("nome-arquivo-selecionado");
    const listaMateriais = document.querySelector(".card-materiais");
    const disciplinaSelect = document.getElementById("disciplina");

    let palavras = [];

    // ------- Mostrar nome do arquivo escolhido -------

    arquivoInput.addEventListener("change", function () {

        if (arquivoInput.files.length > 0) {
            nomeArquivoEl.textContent = "📄 " + arquivoInput.files[0].name;
        } else {
            nomeArquivoEl.textContent = "";
        }

    });

    input.addEventListener("keydown", function (e) {

        if (e.key === "Enter" || e.key === ",") {

            e.preventDefault();

            adicionarPalavra(input.value);

            input.value = "";

        }

    });

    function adicionarPalavra(valor) {

        let texto = valor.trim().replace(",", "");

        if (texto === "") return;

        // impede palavras repetidas (ignorando maiúsculas/minúsculas)
        const jaExiste = palavras.some(p => p.toLowerCase() === texto.toLowerCase());

        if (jaExiste) return;

        palavras.push(texto);

        atualizarTags();

    }

    function atualizarTags() {

        tags.innerHTML = "";

        inputValor.value = palavras.join(",");

        palavras.forEach((palavra, index) => {

            const tag = document.createElement("span");

            tag.className = "tag";

            tag.innerHTML = `
                ${palavra}
                <span class="remover">&times;</span>
            `;

            tag.querySelector(".remover").addEventListener("click", function () {

                palavras.splice(index, 1);

                atualizarTags();

            });

            tags.appendChild(tag);

        });

    }

    // ------- Validação -------

    function mostrarErro(campo, mensagem) {

        limparErro(campo);

        campo.classList.add("campo-invalido");

        const erro = document.createElement("small");
        erro.className = "mensagem-erro"; // corrigido: era erro.ATTRIBUTE_NODE.className
        erro.textContent = mensagem;

        campo.insertAdjacentElement("afterend", erro);

    }

    function limparErro(campo) {

        campo.classList.remove("campo-invalido"); // corrigido: tinha um typo "campo-invaldo"

        const proximoElemento = campo.nextElementSibling;

        if (proximoElemento && proximoElemento.classList.contains("mensagem-erro")) {
            proximoElemento.remove();
        }

    }
    //----- mensagem de erro ---------
    function validarFormulario() {

        let valido = true;

        const titulo = document.getElementById("titulo");
        const disciplina = document.getElementById("disciplina");
        const descricao = document.getElementById("descricao");
        const tipoMaterial = document.getElementById("tipo-material");
        const arquivo = document.getElementById("arquivo");

        if (titulo.value.trim() === "") {
            mostrarErro(titulo, "O título é obrigatório.");
            valido = false;
        } else {
            limparErro(titulo);
        }

        if (disciplina.value === "") {
            mostrarErro(disciplina, "Selecione uma disciplina.");
            valido = false;
        } else {
            limparErro(disciplina);
        }

        if (descricao.value.trim() === "") {
            mostrarErro(descricao, "A descrição é obrigatória.");
            valido = false;
        } else {
            limparErro(descricao);
        }

        if (tipoMaterial.value === "") {
            mostrarErro(tipoMaterial, "Selecione o tipo de material.");
            valido = false;
        } else {
            limparErro(tipoMaterial);
        }

        if (arquivo.files.length === 0) {
            mostrarErro(arquivo, "Selecione um arquivo.");
            valido = false;
        } else {
            limparErro(arquivo);
        }

        if (palavras.length === 0) {
            mostrarErro(tagsWrapper, "Adicione ao menos uma palavra-chave.");
            valido = false;
        } else {
            limparErro(tagsWrapper);
        }

        return valido;

    }

    // ------- Captura do formulário (um único listener de submit) -------

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        // captura a última palavra-chave digitada, caso o usuário não tenha apertado Enter
        if (input.value.trim() !== "") {
            adicionarPalavra(input.value);
            input.value = "";
        }

        // corrigido: a validação agora é chamada e interrompe o envio se inválida
        if (!validarFormulario()) {
            return;
        }

        const arquivo = arquivoInput.files[0] || null;

        const material = {
            titulo: document.getElementById("titulo").value.trim(),
            disciplina: document.getElementById("disciplina").value,
            descricao: document.getElementById("descricao").value.trim(),
            tipoMaterial: document.getElementById("tipo-material").value,
            palavrasChave: palavras,
            // objetos File não podem ser salvos em JSON/localStorage,
            // então guardamos apenas os dados básicos do arquivo
            arquivo: arquivo ? {
                nome: arquivo.name,
                tipo: arquivo.type,
                tamanho: arquivo.size
            } : null,
            dataEnvio: new Date().toISOString()
        };

        salvarMaterial(material);

        console.log("Material salvo:", material);

        adicionarMaterialNaLista(material);

        mostrarSucesso("Material enviado com sucesso!");

        // limpa o formulário e as tags para um novo envio
        form.reset();
        palavras = [];
        atualizarTags();
        nomeArquivoEl.textContent = "";
        atualizarContadorDescricao();
        avisoLimiteE1.classList.remove("mostrar");

    });

    // ------- Salvar no localStorage -------

    function salvarMaterial(material) {

        // pega o array existente (ou cria um novo, se ainda não houver nada salvo)
        const materiaisSalvos = JSON.parse(localStorage.getItem("materiais")) || [];

        materiaisSalvos.push(material);

        localStorage.setItem("materiais", JSON.stringify(materiaisSalvos));

    }

    // ------- Atualizar a lista "Materiais enviados recentemente" -------

    function obterNomeDisciplina(valor) {

        // pega o texto exibido na option selecionada, em vez de repetir o mapeamento aqui
        const option = disciplinaSelect.querySelector(`option[value="${valor}"]`);

        return option ? option.textContent.trim() : valor;

    }

    function adicionarMaterialNaLista(material) {

        const item = document.createElement("div");

        item.className = "material-item";

        item.innerHTML = `
            <div>
                <h3>${material.titulo}</h3>
                <p>${obterNomeDisciplina(material.disciplina)}</p>
            </div>
            <span class="status-publicado">Publicado</span>
        `;

        // insere o novo material logo no topo da lista, após o cabeçalho
        const cabecalho = listaMateriais.querySelector(".cabecalho-materiais");

        cabecalho.insertAdjacentElement("afterend", item);

    }

    // ------- mensagem de sucesso -------

    function mostrarSucesso(mensagem) {

        const toast = document.createElement("div");

        toast.className = "toast-sucesso";

        toast.innerHTML = `
            <i class="bi bi-check-circle-fill"></i>
            ${mensagem}
        `;

        document.body.appendChild(toast);

        // pequeno delay para a transição de entrada funcionar
        setTimeout(() => toast.classList.add("mostrar"), 10);

        // remove o toast depois de alguns segundos
        setTimeout(() => {

            toast.classList.remove("mostrar");

            // espera a transição de saída terminar antes de remover do DOM
            setTimeout(() => toast.remove(), 300);

        }, 3000);

    }
    //------Contador de caracteres da descrição-------

    const descricaoE1 = document.getElementById("descricao");
    const contadorDescricaoE1 = document.getElementById("contador-descricao");
    const LIMITE_DESCRICAO = 500;

    descricaoE1.addEventListener("input", function() {
        atualizarContadorDescricao();

    });

    const avisoLimiteE1 = document.getElementById("aviso-limite-descricao");
    function atualizarContadorDescricao(){
        if(descricaoE1.value.length > LIMITE_DESCRICAO){
            descricaoE1.value = descricaoE1.value.slice(0, LIMITE_DESCRICAO);
        }

        const tamanho = descricaoE1.value.length;

        contadorDescricaoE1.textContent = `${tamanho} / ${LIMITE_DESCRICAO} caracteres`;

        if(tamanho >= LIMITE_DESCRICAO){
            contadorDescricaoE1.classList.add("limite-atingido");
            avisoLimiteE1.classList.add("mostrar");

        }else{
            contadorDescricaoE1.classList.remove("limite-atingido");
            avisoLimiteE1.classList.remove("mostrar");

        }
    }

    const cancelar = document.querySelector(".btn-cancelar");

    cancelar.addEventListener("click", function(e){
        if(formularioTemDados()){
            e.preventDefault();
            confirmarCancelamento();
        }
        
    })

    function formularioTemDados(){
        const titulo = document.getElementById("titulo").value.trim();
        const descricao = document.getElementById("descricao").value.trim();
        const disciplina = document.getElementById("disciplina").value;
        const tipoMaterial = document.getElementById("tipo-material").value;
        const temArquivo = arquivoInput.files.length > 0;
        const temPalavraChave = palavras.length > 0;

        return (
            titulo !== "" ||
            descricao !== "" ||
            disciplina !== "" ||
            tipoMaterial !== "" ||
            temArquivo ||
            temPalavraChave
        );
    }
    
    function confirmarCancelamento(){
        const confirmou = confirm("Deseja realmente cancelar?\nTodas as informações serão perdidas.");

        if(confirmou){
            form.reset();
            palavras = [];
            atualizarTags();
            nomeArquivoEl.textContent = "";
            atualizarContadorDescricao();
            avisoLimiteE1.classList.remove("mostrar");
        }
    }
});