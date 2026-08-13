const API_URL = 'http://localhost:3333';

const listaMateriais = document.getElementById('lista-materiais');
const pesquisa = document.getElementById('pesquisa');

let materiais = [];

//carrega materiais pendentes


async function carregarMateriais() {
    try {

        const resposta = await fetch(
            `${API_URL}/materiais/pendentes`
        );

        console.log('Status:', resposta.status);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        console.log('Todos os materiais:', dados);

        materiais = dados;

        // Atualiza os 5 contadores
        atualizarContadores();

        // Mostra somente os pendentes na tabela
        const pendentes = materiais.filter(
            material => material.status === 'pendente'
        );

        mostrarMateriais(pendentes);

    } catch (erro) {

        console.error(
            'Erro ao carregar materiais:',
            erro
        );
    }
}

function mostrarMateriais(lista){

    console.log('ENTROU EM mostrarMateriais');
    console.log('Lista:', lista);

    if (!listaMateriais) {
        console.error('ERRO: tbody #lista-materiais não encontrado!');
        return;
    }

    if(lista.length === 0){
        listaMateriais.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-secondary"></i>
                    <p class="mt-3 mb-1 fw-semibold"> Nenhum material em avaliação </p>
                    <p class="text-secondary mb-0"> Os materiais enviados para avaliação aparecerão aqui. </p>
                </td>
            </tr>
        `;
        return;
    }
    

    listaMateriais.innerHTML = lista.map(material => {
        const data = new Date(material.createdAt);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        const disciplina = `Disciplina ${material.disciplinaId}`;

        return `
            <tr>
                <td><strong>${material.titulo}</strong></td>
                <br>

                <small class="text-secondary">${material.descricao}</small>

                <td>${disciplina}</td>

                <td>${dataFormatada}</td>

                <td>
                    <span class = "badge bg-warning text-dark">
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

// contadores

function atualizarContadores() {

    const contadores =
        document.querySelectorAll('.card strong');

    console.log('Contadores encontrados:', contadores.length);

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

        // Todos
        contadores[0].textContent = todos;

        // Em análise
        contadores[1].textContent = pendentes;

        // Aguardando ajustes
        contadores[2].textContent = 0;

        // Aprovados
        contadores[3].textContent = aprovados;

        // Rejeitados
        contadores[4].textContent = rejeitados;
    }
}

async function aprovarMaterial(id){
    const confirmar = confirm('Tem certeza que deseja aprovar este material?');

    if(!confirmar){
        return;
    }

    try{
        const resposta = await fetch(`${API_URL}/materiais/${id}/aprovar`,
            {
                method:'PUT'
            }
        );

        if(!resposta.ok){
            throw new Error('Erro ao aprovar material');
        }

        alert('Material aprovado com sucesso!');

        carregarMateriais();

    }catch(erro){
        console.error(erro);

        alert('Não foi possível aprovar o material.');

    }


}

async function rejeitarMaterial(id) {

    const motivo = prompt('Diite o motivo da rejeição:');

    if(!motivo){
        return
    }

    try{
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

        });

        if(!resposta.ok){
            throw new Error('Erro ao rejeitar material');

        }

        alert('Material rejeitado.');

        carregarMateriais();

    } catch (erro){
        console.error(erro);

        alert('Não foi possível rejeitar o material');
    }
    
} 

//pesquisa

pesquisa.addEventListener('input', () => {
    const texto = pesquisa.value.toLocaleLowerCase();

    const filtrados = materiais.filter(material => {
        return (
            material.titulo.toLowerCase().includes(texto) ||
            material.descricao.toLowerCase().includes(texto)
        );
    });

    mostrarMateriais(filtrados);
})

carregarMateriais();




