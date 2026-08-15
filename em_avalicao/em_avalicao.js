const API_URL = 'http://localhost:3333';

const listaMateriais = document.getElementById('lista-materiais');
const pesquisa = document.getElementById('pesquisa');
const contadorMateriais = document.getElementById('contador-materiais');

let materiais = [];

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
        return;
    }

    listaMateriais.innerHTML = lista.map(material => {
        const data = new Date(material.createdAt);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        const disciplina = material.disciplina?.nome || 'Disciplina não encontrada';
        const palavrasChave = material.palavrasChave || 'Nenhuma';

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
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-success btn-sm" onclick="aprovarMaterial(${material.id})">
                            <i class="bi bi-check-lg"></i>
                            Aprovar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="rejeitarMaterial(${material.id})">
                            <i class="bi bi-x-lg"></i>
                            Rejeitar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
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
    const confirmar = confirm('Tem certeza que deseja aprovar este material?');

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(
            `${API_URL}/materiais/${id}/aprovar`,
            {
                method: 'PUT'
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
                    'Content-Type': 'application/json'
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

pesquisa.addEventListener('input', () => {
    const texto = pesquisa.value.toLowerCase();

    const filtrados = materiais.filter(material => {
        return material.status === 'pendente' && (
            material.titulo.toLowerCase().includes(texto) ||
            material.descricao.toLowerCase().includes(texto) ||
            material.disciplina?.nome?.toLowerCase().includes(texto) ||
            material.palavrasChave?.toLowerCase().includes(texto)
        );
    });

    if (contadorMateriais) {
        contadorMateriais.textContent =
            `${filtrados.length} material${filtrados.length !== 1 ? 'is' : ''} em análise`;
    }

    mostrarMateriais(filtrados);
});

carregarMateriais();