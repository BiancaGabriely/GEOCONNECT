const API_URL = 'http://localhost:3333';

const listaFavoritos = document.querySelector('.listaFavoritos');
const pesquisa = document.getElementById('pesquisa');
const contadorFavoritos = document.querySelector('.contadorFavoritos');
const filtroDisciplina = document.getElementById('filtro-disciplina');
const filtroTipo = document.getElementById('filtro-tipo');
const limparFiltrosBotao = document.getElementById('limpar-filtros');

let favoritos = [];

//carregar favoritos
async function carregarFavoritos(){
    try{
        const resposta = await fetch(`${API_URL}/favoritos`);

        console.log('Status favoritos:', resposta.status);
        if(!resposta.ok){
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();
        console.log('Favoritos recebidos:', dados);

        favoritos = dados;

        atualizarContador();
        carregarFiltros();
        mostrarFavoritos(favoritos);
        
    } catch(erro){
        console.error('Erro ao carregar favoritos:', erro);

        if(listaFavoritos){
            listaFavoritos.innerHTML = `
                <div class="mensagem-sem-favoritos text-center py-5">
                    <i class="bi bi-exclamation-circle fs-1 text-danger"></i>

                    <h5 class="mt-3">
                        Não foi possível carregar os favoritos
                    </h5>

                    <p class="text-secondary mb-0">
                        Verifique se o servidor está funcionando.
                    </p>
                </div>
            `
        }
    }
}

//mostrar favoritos
function mostrarFavoritos(lista){
    console.log('Lista de favoritos: ', lista);

    if(!listaFavoritos){
        console.error('Elemento .listaFavoritos não encontrado!');
        return;
    }

    if(lista.length === 0){
        listaFavoritos.innerHTML = `
            <div class="mensagem-sem-favoritos text-center py-5">

                <i class="bi bi-star fs-1 text-secondary"></i>

                <h5 class="mt-3">
                    Nenhum material favorito
                </h5>

                <p class="text-secondary mb-0">
                    Os materiais que você favoritar aparecerão aqui.
                </p>

            </div>
        `;
        return;
    }

    listaFavoritos.innerHTML = lista.map(favorito => {
        const material = favorito.material;

        if(!material){
            return '';
        }

        const disciplina = material.disciplina?.nome || 'Disciplina não encontrada';
        const palavrasChave = material.palavrasChave || 'Nenhuma';
        const data = material.createdAt ? new Date(material.createdAt) : null;
        const dataFormatada = data ? data.toLocaleDateString('pt-BR') : "Data não informada";

        return `
            <div class="card favorito-item mb-3">

                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-start gap-3">

                        <div class="flex-grow-1">

                            <h5 class="titulo-material mb-2">
                                ${material.titulo}
                            </h5>

                            <p class="descricao-material mb-3">
                                ${material.descricao}
                            </p>


                            <div class="informacoes-material">

                                <span class="info-material">
                                    <i class="bi bi-book"></i>
                                    ${disciplina}
                                </span>

                                <span class="info-material">
                                    <i class="bi bi-file-earmark"></i>
                                    ${obterTipoMaterial(material)}
                                </span>


                                <span class="info-material">
                                    <i class="bi bi-calendar3"></i>
                                    ${dataFormatada}
                                </span>

                            </div>


                            <div class="palavras-chave mt-3">

                                <span class="badge bg-light text-dark border">
                                    ${palavrasChave}
                                </span>

                            </div>

                        </div>


                        <button
                            type="button"
                            class="btn btn-outline-danger btn-remover-favorito"
                            onclick="removerFavorito(${favorito.id})"
                            title="Remover dos favoritos"
                        >
                            <i class="bi bi-star-fill"></i>
                        </button>

                    </div>

                </div>

            </div>
        `;
        
    }).join('');
}

function atualizarContador(){
    if(!contadorFavoritos){
        return;
    }

    const quantidade = favoritos.length;

    contadorFavoritos.innerHTML = ` 
        <i class ="bi bi-star"></i>
        ${quantidade} material${quantidade !== 1 ? '(is)' : ''} favorito${quantidade !== 1 ? '(s)' : ''}

    `
}

//filtros
function carregarFiltros() {

    if (filtroDisciplina) {

        const disciplinas = [];

        favoritos.forEach(favorito => {

            const material = favorito.material;

            if (material && material.disciplina
            ) {
                const id = material.disciplina.id;
                const nome = material.disciplina.nome;
                const existe = disciplinas.some(
                    disciplina => disciplina.id === id
                );

                if (!existe) {
                    disciplinas.push({
                        id: id,
                        nome: nome
                    });
                }
            }
        });

        disciplinas.sort((a, b) =>
            a.nome.localeCompare(b.nome)
        );

        filtroDisciplina.innerHTML = `
            <option value="" selected>
                Todas as disciplinas
            </option>
        `;

        disciplinas.forEach(disciplina => {

            filtroDisciplina.innerHTML += `
                <option value="${disciplina.id}">
                    ${disciplina.nome}
                </option>
            `;

        });
    }

    if (filtroTipo) {

        const tipos = [];

        favoritos.forEach(favorito => {

            const material = favorito.material;

            if (material) {
                const tipo = obterTipoMaterial(material);
                if (!tipos.includes(tipo)) {
                    tipos.push(tipo);
                }
            }
        });

        tipos.sort((a, b) =>a.localeCompare(b));

        filtroTipo.innerHTML = `
            <option value="" selected>
                Todos os tipos
            </option>
        `;

        tipos.forEach(tipo => {

            filtroTipo.innerHTML += `
                <option value="${tipo}">
                    ${tipo}
                </option>
            `;

        });
    }
     console.log('favoritos:', favoritos);
    console.log('filtroTipo element:', filtroTipo);
}

//aplicar filtros
function aplicarFiltros(){
    const texto = pesquisa ? pesquisa.value.toLocaleLowerCase().trim() : '';
    const disciplinaSelecionada = filtroDisciplina ? filtroDisciplina.value : '';
    const tipoSelecionado = filtroTipo ? filtroTipo.value : '';
    const filtrados = favoritos.filter(favorito => {
        const material = favorito.material;
        if(!material){
            return false;
        }

        const titulo = (material.titulo || '').toLocaleLowerCase().includes(texto);
        const descricao = (material.descricao || '').toLocaleLowerCase().includes(texto); 
        const palavrasChave = (material.palavrasChave || '').toLocaleLowerCase().includes(texto);
        const correspondePesquisa = !texto || titulo || descricao ||palavrasChave;
        const correspondeDisciplina = !disciplinaSelecionada || String(material.disciplina?.id) === disciplinaSelecionada;
        const correspondeTipo = !tipoSelecionado || obterTipoMaterial(material) === tipoSelecionado;
        
        return (
            correspondePesquisa && correspondeDisciplina && correspondeTipo
        );
    });

    mostrarFavoritos(filtrados);
}

//pesquisa
if(pesquisa){
    pesquisa.addEventListener('input', () => {
        aplicarFiltros();
    });
}

//filtro de disciplina
if(filtroDisciplina){
    filtroDisciplina.addEventListener('change', () => {
        aplicarFiltros();
    });
}

//filtro de tipo
if(filtroTipo){
    filtroTipo.addEventListener('change', () => {
        aplicarFiltros();
    })
}

//limpar filtros
function limparFiltros(){
    if(pesquisa){
        pesquisa.value = '';
    }

    if(filtroDisciplina){
        filtroDisciplina.value = '';
    }

    if(filtroTipo){
        filtroTipo.value = '';
    }

    mostrarFavoritos(favoritos);

}

//remover favorito
async function removerFavorito(id) {
    const confirmar = confirm(
        'Tem certeza que desja remover este material dos favoritos?'
    );

    if(!confirmar){
        return;
    }

    try{
        const resposta = await fetch(`${API_URL}/favoritos/${id}`, {
         method: 'DELETE'   
        });

        if(!resposta.ok){
            throw new Error(
                `Erro HTTP${resposta.status}`
            );
        }

        favoritos = favoritos.filter(
            favorito => favorito.id !== id
        );

        atualizarContador();
        carregarFiltros();
        aplicarFiltros();

    } catch (erro){
        console.error(
            'Erro ao remover favorito',
            erro
        );

        alert(
            'Não foi possível remover o favorito.'
        );
    }
}
//botão limpar filtros

if (limparFiltrosBotao) {

    limparFiltrosBotao.addEventListener('click', () => {

        limparFiltros();

    });
}

//descobrir tipo do material pela extensão do arquivo
function obterTipoMaterial(material) {
    if (!material || !material.url) {
        return 'Outro';
    }

    const extensao = material.url.split('.').pop().toLowerCase();

    const tipos = {
        pdf: 'PDF',
        doc: 'Word',
        docx: 'Word',
        ppt: 'PowerPoint',
        pptx: 'PowerPoint',
        xls: 'Excel',
        xlsx: 'Excel',
        jpg: 'Imagem',
        jpeg: 'Imagem',
        png: 'Imagem',
        txt: 'Texto'
    };

    return tipos[extensao] || 'Outro';
}
//inicialização
carregarFavoritos();