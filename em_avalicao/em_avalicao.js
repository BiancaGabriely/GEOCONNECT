const API_URL = 'https://backend-93vk.onrender.com';

const listaMateriais = document.getElementById('lista-materiais');
const pesquisa = document.getElementById('pesquisa');
const contadorMateriais = document.getElementById('contador-materiais');

const usuarioLogado = JSON.parse(localStorage.getItem('usuario'))
const ehAdm = usuarioLogado?.tipo === 'adm' || usuarioLogado?.tipo === 'admin' || usuarioLogado?.ehAdm === true

let materiais = [];
let listaFiltradaAtual = []
let paginaAtual = 1
const materiaisPorPagina = 5

function obterToken() {
    return localStorage.getItem('token');
}

document.addEventListener('DOMContentLoaded', () =>{
    if(!ehAdm){
        const thAcoes = document.getElementById('th-acoes')
        if(thAcoes){
            thAcoes.remove()
        }
    }
})


async function carregarMateriais() {
    try {
        const resposta = await fetch(`${API_URL}/materiais/todos`);

        console.log('Status:', resposta.status);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        console.log('Todos os materiais:', dados);

        materiais = dados;

        atualizarContadores();

        const pendentes = materiais.filter(
            material => material.status === 'pendente'
        );

        if (contadorMateriais) {
            contadorMateriais.textContent =
                `${pendentes.length} material${pendentes.length !== 1 ? 'is' : ''} em análise`;
        }

        paginaAtual = 1;

        mostrarMateriais(pendentes);

    } catch (erro) {
        console.error('Erro ao carregar materiais:', erro);

        if (contadorMateriais) {
            contadorMateriais.textContent = 'Erro ao carregar materiais';
        }
    }
}


function mostrarMateriais(lista) {
    console.log('Lista:', lista);

    if (!listaMateriais) {
        console.error('ERRO: tbody #lista-materiais não encontrado!');
        return;
    }

    if (lista.length === 0) {
        listaMateriais.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-secondary"></i>
                    <p class="mt-3 mb-1 fw-semibold">Nenhum material em avaliação</p>
                    <p class="text-secondary mb-0">Os materiais enviados para avaliação aparecerão aqui.</p>
                </td>
            </tr>
        `;

        atualizarPaginacao(0);

        return;
    }


    const totalPaginas = Math.ceil(
        lista.length / materiaisPorPagina
    );


    if (paginaAtual > totalPaginas) {
        paginaAtual = totalPaginas;
    }


    if (paginaAtual < 1) {
        paginaAtual = 1;
    }


    const inicio = (paginaAtual - 1) * materiaisPorPagina;

    const fim = inicio + materiaisPorPagina;

    const materiaisPagina = lista.slice(inicio, fim);


    listaMateriais.innerHTML = materiaisPagina.map(material => {

        const data = new Date(material.createdAt);

        const dataFormatada = data.toLocaleDateString('pt-BR');

        const disciplina =
            material.disciplina?.nome ||
            'Disciplina não encontrada';

        const palavrasChave =
            material.palavrasChave ||
            'Nenhuma';


        const tdAcoes = ehAdm ? `
            <td>
                <div class="d-flex gap-2">
                    <button
                        class="btn btn-outline-primary btn-sm"
                        onclick="visualizarMaterial(${material.id})"
                    >
                        <i class="bi bi-eye"></i>
                        Visualizar
                    </button>

                    <button
                        class="btn btn-success btn-sm"
                        onclick="aprovarMaterial(${material.id})"
                    >
                        <i class="bi bi-check-lg"></i>
                        Aprovar
                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="rejeitarMaterial(${material.id})"
                    >
                        <i class="bi bi-x-lg"></i>
                        Rejeitar
                    </button>
                </div>
            </td>
        ` : '';

        return `
            <tr>
                <td>
                    <strong>${material.titulo}</strong>
                    <br>
                    <small class="text-secondary">${material.descricao}</small>
                </td>

                <td>${disciplina}</td>

                <td>
                    <span class="badge bg-light text-dark border">
                        ${palavrasChave}
                    </span>
                </td>

                <td>${dataFormatada}</td>

                <td>
                    <span class="badge bg-warning text-dark">
                        <i class="bi bi-clock"></i>
                        Pendente
                    </span>
                </td>

                ${tdAcoes}
            </tr>
        `;

    }).join('')


    atualizarPaginacao(totalPaginas);
}


function atualizarContadores() {
    const contadores = document.querySelectorAll('.card strong');

    const todos = materiais.length;

    const pendentes = materiais.filter(
        material => material.status === 'pendente'
    ).length;

    const aprovados = materiais.filter(
        material => material.status === 'aprovado'
    ).length;

    const rejeitados = materiais.filter(
        material => material.status === 'rejeitado'
    ).length;

    console.log('Todos:', todos);
    console.log('Pendentes:', pendentes);
    console.log('Aprovados:', aprovados);
    console.log('Rejeitados:', rejeitados);

    if (contadores.length >= 5) {
        contadores[0].textContent = todos;
        contadores[1].textContent = pendentes;
        contadores[2].textContent = 0;
        contadores[3].textContent = aprovados;
        contadores[4].textContent = rejeitados;
    }
}


async function aprovarMaterial(id) {

    const token = obterToken();

    if (!token) {
        alert('Sua sessão expirou ou você não está logado.');
        return;
    }

    const confirmar = confirm('Tem certeza que deseja aprovar este material?');

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(
            `${API_URL}/materiais/${id}/aprovar`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'aprovado' })
            }
        );

        if (!resposta.ok) {
            throw new Error('Erro ao aprovar material');
        }

        alert('Material aprovado com sucesso!');

        carregarMateriais();

    } catch (erro) {
        console.error(erro);

        alert('Não foi possível aprovar o material.');
    }
}


async function rejeitarMaterial(id) {
    const token = obterToken();

    if (!token) {
        alert('Sua sessão expirou ou você não está logado.');
        return;
    }
    const motivo = prompt('Digite o motivo da rejeição:');

    if (!motivo) {
        return;
    }

    try {
        const resposta = await fetch(
            `${API_URL}/materiais/${id}/rejeitar`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },

                body: JSON.stringify({
                    motivoRejeicao: motivo
                })
            }
        );

        if (!resposta.ok) {
            throw new Error('Erro ao rejeitar material');
        }

        alert('Material rejeitado.');

        carregarMateriais();

    } catch (erro) {
        console.error(erro);

        alert('Não foi possível rejeitar o material');
    }
}


/* ==========================================================================
   PAGINAÇÃO
   ========================================================================== */

function atualizarPaginacao(totalPaginas) {

    const paginacao = document.querySelector('.pagination');

    if (!paginacao) {
        console.warn('Elemento .pagination não encontrado.');
        return;
    }


    if (totalPaginas <= 1) {
        paginacao.innerHTML = '';
        return;
    }


    paginacao.innerHTML = `
        <li class="page-item ${paginaAtual === 1 ? 'disabled' : ''}">
            <button
                class="page-link"
                type="button"
                onclick="paginaAnterior()"
                ${paginaAtual === 1 ? 'disabled' : ''}
            >
                <i class="bi bi-chevron-left"></i>
            </button>
        </li>

        <li class="page-item active">
            <button
                class="page-link"
                type="button"
            >
                ${paginaAtual}
            </button>
        </li>

        <li class="page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}">
            <button
                class="page-link"
                type="button"
                onclick="proximaPagina()"
                ${paginaAtual === totalPaginas ? 'disabled' : ''}
            >
                <i class="bi bi-chevron-right"></i>
            </button>
        </li>
    `;
}


function paginaAnterior() {

    if (paginaAtual <= 1) {
        return;
    }

    paginaAtual--;

    const pendentes = materiais.filter(
        material => material.status === 'pendente'
    );

    mostrarMateriais(pendentes);
}


function proximaPagina() {

    const pendentes = materiais.filter(
        material => material.status === 'pendente'
    );

    const totalPaginas = Math.ceil(
        pendentes.length / materiaisPorPagina
    );


    if (paginaAtual >= totalPaginas) {
        return;
    }

    paginaAtual++;

    mostrarMateriais(pendentes);
}


/* ==========================================================================
   PESQUISA
   ========================================================================== */

pesquisa.addEventListener('input', () => {

    paginaAtual = 1;

    const texto = pesquisa.value.toLowerCase();

    const filtrados = materiais.filter(material => {

        return material.status === 'pendente' && (

            material.titulo
                .toLowerCase()
                .includes(texto) ||

            material.descricao
                .toLowerCase()
                .includes(texto) ||

            material.disciplina?.nome
                ?.toLowerCase()
                .includes(texto) ||

            material.palavrasChave
                ?.toLowerCase()
                .includes(texto)

        );
    });


    if (contadorMateriais) {
        contadorMateriais.textContent =
            `${filtrados.length} material${filtrados.length !== 1 ? 'is' : ''} em análise`;
    }


    mostrarMateriais(filtrados);
});
function visualizarMaterial(id) {
    const material = materiais.find(m => m.id === id);

    if (!material) {
        alert('Material não encontrado.');
        return;
    }

    if (!material.url) {
        alert('Este material não possui arquivo anexado.');
        return;
    }

    window.open(`${API_URL}/${material.url}`, '_blank');
}

carregarMateriais();