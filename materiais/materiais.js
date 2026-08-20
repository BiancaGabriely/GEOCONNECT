const API_URL = 'http://localhost:3333';

let disciplinaId = null;
let materiais = [];
let materiaisFiltrados = [];
let favoritos = [];

const ITENS_POR_PAGINA = 5;
let paginaAtual = 1;


// ======================================================
// ELEMENTOS
// ======================================================

const disciplinaNome = document.getElementById('disciplina-nome');
const disciplinaDescricao = document.getElementById('disciplina-descricao');
const breadcrumbDisciplina = document.getElementById('breadcrumb-disciplina');

const pesquisaMaterial = document.getElementById('pesquisa-material');
const selectTipoMaterial = document.getElementById('select-tipo-material');

const totalMateriais = document.getElementById('total-materiais');
const containerMateriais = document.getElementById('container-materiais');

const infoPaginacao = document.getElementById('info-paginacao');
const paginacao = document.getElementById('paginacao');

function obterTokenAutenticacao() {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
        return null;
    }
    return token;
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarPagina();
});

async function inicializarPagina() {

    const params = new URLSearchParams(window.location.search);

    disciplinaId = params.get('id') || params.get('disciplinaId');

    console.log('ID da disciplina:', disciplinaId);

    if (!disciplinaId) {
        mostrarErro('Nenhuma disciplina foi selecionada.');
        return;
    }

    await carregarDisciplina();
    await carregarFavoritos();
    await carregarMateriais();
}

//carregar disciplinas

async function carregarDisciplina() {

    try {

        const resposta = await fetch(
            `${API_URL}/disciplinas/${disciplinaId}`
        );

        console.log('Status disciplina:', resposta.status);

        if (!resposta.ok) {
            throw new Error('Erro ao carregar disciplina.');
        }

        const disciplina = await resposta.json();

        console.log('Disciplina recebida:', disciplina);

        disciplinaNome.textContent = disciplina.nome;

        disciplinaDescricao.textContent =
            `${disciplina.materiais || 0} material(is) disponível(is).`;

        breadcrumbDisciplina.textContent = disciplina.nome;

        document.title = `${disciplina.nome} - Materiais`;

    } catch (erro) {

        console.error('Erro ao carregar disciplina:', erro);

        disciplinaNome.textContent = 'Erro ao carregar disciplina';

        disciplinaDescricao.textContent = '';

        mostrarErro(
            'Não foi possível carregar os dados da disciplina.'
        );
    }
}

//carregar materiais

async function carregarMateriais() {

    try {

        containerMateriais.innerHTML = `
            <div class="text-center py-5">

                <div class="spinner-border text-secondary" role="status">
                    <span class="visually-hidden">
                        Carregando...
                    </span>
                </div>

                <p class="text-secondary mt-3 mb-0">
                    Carregando materiais...
                </p>

            </div>
        `;

        const resposta = await fetch(
            `${API_URL}/materiais`
        );

        console.log('Status materiais:', resposta.status);

        if (!resposta.ok) {
            throw new Error('Erro ao carregar materiais.');
        }

        const dados = await resposta.json();

        console.log('MATERIAIS RECEBIDOS:',JSON.stringify(dados, null, 2));

        // O backend já retorna somente materiais aprovados.
        // Aqui filtramos os materiais da disciplina selecionada.

        materiais = dados.filter(material =>
            Number(material.disciplinaId) === Number(disciplinaId)
        );

        console.log(
            'Materiais desta disciplina:',
            materiais
        );

        materiaisFiltrados = [...materiais];

        paginaAtual = 1;

        atualizarTela();

    } catch (erro) {

        console.error(
            'Erro ao carregar materiais:',
            erro
        );

        mostrarErro(
            'Não foi possível carregar os materiais.'
        );
    }
}
//atualizar tela

function atualizarTela() {

    totalMateriais.textContent =
        materiaisFiltrados.length;

    if (materiaisFiltrados.length === 0) {

        mostrarNenhumMaterial();

        infoPaginacao.textContent =
            'Mostrando 0 a 0 de 0 materiais';

        paginacao.innerHTML = '';

        return;
    }

    const totalPaginas = Math.ceil(
        materiaisFiltrados.length / ITENS_POR_PAGINA
    );

    if (paginaAtual > totalPaginas) {
        paginaAtual = totalPaginas;
    }

    const inicio =
        (paginaAtual - 1) * ITENS_POR_PAGINA;

    const fim = Math.min(
        inicio + ITENS_POR_PAGINA,
        materiaisFiltrados.length
    );

    const materiaisPagina =
        materiaisFiltrados.slice(inicio, fim);

    renderizarMateriais(materiaisPagina);

    infoPaginacao.textContent =
        `Mostrando ${inicio + 1} a ${fim} de ${materiaisFiltrados.length} materiais`;

    renderizarPaginacao(totalPaginas);
}

//renderizar materiais

function renderizarMateriais(lista) {

    containerMateriais.innerHTML = '';

    lista.forEach(material => {

        const tipo =
            descobrirTipoMaterial(material.url);

        const icone =
            obterIconeTipo(tipo);

        const data =
            formatarData(material.createdAt);

        const card =
            document.createElement('div');

        card.className = 'card-material';

        card.innerHTML = `
            <div class="icone-material">
                <i class="bi ${icone}"></i>
            </div>

            <div class="informacoes-material">

                <h5 class="titulo-material">
                    ${escaparHTML(material.titulo)}
                </h5>

                <p class="descricao-material">
                    ${escaparHTML(material.descricao)}
                </p>

                <div class="dados-material">

                    <span class="badge bg-light text-dark">
                        ${tipo}
                    </span>

                    <span class="text-muted small">
                        ${data}
                    </span>

                    ${
                        material.professor
                            ? `
                                <span class="text-muted small">
                                    <i class="bi bi-person"></i>
                                    ${escaparHTML(
                                        material.professor.nome
                                    )}
                                </span>
                            `
                            : ''
                    }

                </div>

            </div>

            <div class="acoes-material">

            <a href="${API_URL}/${material.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-eye"></i>
                Visualizar
            </a>


            ${encontrarFavorito(material.id)? `
                <button
                    type="button"
                    class="btn btn-success btn-sm"
                    onclick="alternarFavorito(${material.id})"
                >
                    <i class="bi bi-star-fill"></i>
                    Favoritado
                </button>
            `
            : `
                <button
                    type="button"
                    class="btn btn-outline-warning btn-sm"
                    onclick="alternarFavorito(${material.id})"
                >
                    <i class="bi bi-star"></i>
                    Favoritar
                </button>
        `
    }

</div>
        `;

        containerMateriais.appendChild(card);
    });
}


//pesquisa
pesquisaMaterial.addEventListener('input', () => {

    aplicarFiltros();

});


//filtrar por tipo
selectTipoMaterial.addEventListener('change', () => {

    aplicarFiltros();

});


//aplicarfiltros
function aplicarFiltros() {

    const texto = pesquisaMaterial
        ? (pesquisaMaterial.value || '').toLowerCase().trim()
        : '';

    const tipoSelecionado = selectTipoMaterial
        ? selectTipoMaterial.value
        : '';

    materiaisFiltrados = materiais.filter(material => {
        if (!material) return false;

        const titulo =
            String(material.titulo || '')
                .toLowerCase();


        const descricao =
            String(material.descricao || '')
                .toLowerCase();


        const palavrasChave =
            String(material.palavrasChave || '')
                .toLowerCase();


        const correspondePesquisa =
            !texto ||
            titulo.includes(texto) ||
            descricao.includes(texto) ||
            palavrasChave.includes(texto);

        const tipoMaterial = descobrirTipoMaterial(material.url);
        const correspondeTipo =
            !tipoSelecionado ||
            tipoMaterial === tipoSelecionado;

        return correspondePesquisa && correspondeTipo;
    })

    paginaAtual = 1;
    atualizarTela();

    }
//paginação
function renderizarPaginacao(totalPaginas) {

    paginacao.innerHTML = '';

    if (totalPaginas <= 1) {
        return;
    }
    //anterior
    const liAnterior =
        document.createElement('li');

    liAnterior.className =
        `page-item ${
            paginaAtual === 1
                ? 'disabled'
                : ''
        }`;

    liAnterior.innerHTML = `
        <button class="page-link">
            <i class="bi bi-chevron-left"></i>
        </button>
    `;

    liAnterior
        .querySelector('button')
        .addEventListener('click', () => {

            if (paginaAtual > 1) {

                paginaAtual--;

                atualizarTela();
            }

        });

    paginacao.appendChild(liAnterior);
    //números
    for (
        let i = 1;
        i <= totalPaginas;
        i++
    ) {

        const li =
            document.createElement('li');

        li.className =
            `page-item ${
                i === paginaAtual
                    ? 'active'
                    : ''
            }`;

        li.innerHTML = `
            <button class="page-link">
                ${i}
            </button>
        `;

        li.querySelector('button')
            .addEventListener('click', () => {

                paginaAtual = i;

                atualizarTela();

            });

        paginacao.appendChild(li);
    }
    //próximo
    const liProximo =
        document.createElement('li');

    liProximo.className =
        `page-item ${
            paginaAtual === totalPaginas
                ? 'disabled'
                : ''
        }`;

    liProximo.innerHTML = `
        <button class="page-link">
            <i class="bi bi-chevron-right"></i>
        </button>
    `;

    liProximo
        .querySelector('button')
        .addEventListener('click', () => {

            if (paginaAtual < totalPaginas) {

                paginaAtual++;

                atualizarTela();
            }

        });

    paginacao.appendChild(liProximo);
}

//tipo do arquivo

function descobrirTipoMaterial(url) {

    if (!url) {
        return 'OUTRO';
    }

    const extensao =
        url
            .split('.')
            .pop()
            .split('?')[0]
            .toLowerCase();

    switch (extensao) {

        case 'pdf':
            return 'PDF';

        case 'ppt':
        case 'pptx':
            return 'PPTX';

        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
            return 'IMG';

        default:
            return extensao.toUpperCase();
    }
}

//ícone

function obterIconeTipo(tipo) {

    switch (tipo) {

        case 'PDF':
            return 'bi-file-earmark-pdf';

        case 'PPTX':
            return 'bi-file-earmark-slides';

        case 'IMG':
            return 'bi-file-earmark-image';

        default:
            return 'bi-file-earmark';
    }
}

//data

function formatarData(data) {

    if (!data) {
        return '';
    }

    const dataObj =
        new Date(data);

    if (isNaN(dataObj.getTime())) {
        return '';
    }

    return dataObj.toLocaleDateString('pt-BR');
}

//escapar material
function escaparHTML(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {
        return '';
    }

    const div =
        document.createElement('div');

    div.textContent = texto;

    return div.innerHTML;
}


//nenhum material
function mostrarNenhumMaterial() {

    containerMateriais.innerHTML = `
        <div class="mensagem-sem-materiais text-center py-5">

            <i class="bi bi-folder-x fs-1 text-secondary"></i>

            <h5 class="mt-3">
                Nenhum material encontrado
            </h5>

            <p class="text-secondary mb-0">
                Não existem materiais aprovados
                para esta disciplina.
            </p>

        </div>
    `;
}
//erro

function mostrarErro(mensagem) {

    containerMateriais.innerHTML = `
        <div class="text-center py-5">

            <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>

            <h5 class="mt-3">
                Ocorreu um erro
            </h5>

            <p class="text-secondary">
                ${escaparHTML(mensagem)}
            </p>

            <button
                class="btn btn-outline-primary btn-sm"
                onclick="carregarMateriais()"
            >
                <i class="bi bi-arrow-clockwise"></i>
                Tentar novamente
            </button>

        </div>
    `;
}
//carregar favoritos
async function carregarFavoritos() {
    const token = obterTokenAutenticacao();
    if (!token) {
        favoritos = [];
        return;
    }

    try {

        const resposta = await fetch(`${API_URL}/favoritos`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        console.log(
            'Status favoritos:',
            resposta.status
        );

        if (!resposta.ok) {
            throw new Error(
                'Erro ao carregar favoritos.'
            );
        }

        favoritos = await resposta.json();

        console.log(
            'FAVORITOS RECEBIDOS:',
            favoritos
        );

    } catch (erro) {

        console.error(
            'Erro ao carregar favoritos:',
            erro
        );

        favoritos = [];
    }
}

// verificar se material está favoritado
function encontrarFavorito(materialId) {
  return favoritos.find(favorito => {
    const favMaterialId = favorito.materialId || favorito.id_material || favorito.idMaterial || favorito.material?.id;
    return Number(favMaterialId) === Number(materialId);
  });
}

//favoritar - desfavoritar
async function alternarFavorito(materialId) {

    const token = obterTokenAutenticacao();
    if (!token) {
        alert("Você precisa estar logado para favoritar materiais.");
        return;
    }

    const favoritoExistente = encontrarFavorito(materialId);


    try {

        if (favoritoExistente) {

            const resposta = await fetch(
                `${API_URL}/favoritos/${favoritoExistente.id}`, {
                    method: 'DELETE',
                    headers: {
                    "Authorization": `Bearer ${token}`
                    }
                });


            if (!resposta.ok) {
                throw new Error('Erro ao remover favorito.');
            }

            favoritos = favoritos.filter(fav => fav.id !== favoritoExistente.id);
            console.log('Material removido dos favoritos.');

        } else {

            const resposta = await fetch(
                `${API_URL}/favoritos`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        id_material: materialId
                    })
                }
            );


            if (!resposta.ok) {
                throw new Error(
                    'Erro ao adicionar favorito.'
                );
            }


            const novoFavorito = await resposta.json();
            favoritos.push(novoFavorito);


            console.log('Material adicionado aos favoritos.');
        }

        atualizarTela();


    } catch (erro) {

        console.error(
            'Erro ao alterar favorito:',
            erro
        );

        alert(
            'Não foi possível alterar o favorito.'
        );
    }
}