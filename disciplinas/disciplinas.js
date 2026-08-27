const quantidade = document.getElementById("quantidade-disciplinas");
const lista = document.getElementById("lista-disciplinas");
const pesquisa = document.getElementById("pesquisa");

const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));

//  função para controlar o que aparece na tela segundo o perfil
function aplicarPermissoes() {
    // Procura o botão de criar disciplina no HTML (seja link ou botão)
    const btnCriar = document.querySelector(".btn-cadastrar");

    if (btnCriar) {
        // Se NÃO estiver logado ou o tipo NÃO for "adm", esconde o botão
        if (!usuarioLogado || usuarioLogado.tipo !== "adm") {
            btnCriar.style.display = "none";
        } else {
            btnCriar.style.display = "inline-flex"; // ou "block"
        }
    }

    // Atualiza o nome do usuário no menu lateral (se você tiver a tag no HTML)
    const nomeUsuarioMenu = document.getElementById("nome-usuario");
    if (nomeUsuarioMenu && usuarioLogado) {
        nomeUsuarioMenu.textContent = usuarioLogado.nome;
    }
}
async function carregarDisciplinas() {
    try {
        const resposta = await fetch("https://backend-93vk.onrender.com/disciplinas");

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const disciplinas = await resposta.json();
        disciplinas.sort((a,b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

        console.log("Disciplinas recebidas:", disciplinas);

        renderizarDisciplinas(disciplinas);

    } catch (erro) {
        console.error("Erro ao carregar disciplinas:", erro);
        lista.innerHTML = `<p>Não foi possível carregar as disciplinas.</p>`;
    }
}

function renderizarDisciplinas(disciplinas) {
    quantidade.textContent = disciplinas.length;

    lista.innerHTML = "";

    disciplinas.forEach(disciplina => {
        lista.innerHTML += `
            <div class="card-disciplina" 
                 onclick="abrirMateriais(${disciplina.id})"
                 style="cursor: pointer;">

                <div class="info">
                    <div class="icone">
                        <i class="bi bi-book"></i>
                    </div>

                    <div>
                        <div class="titulo">${disciplina.nome}</div>
                    </div>
                </div>

                <div class="estatisticas">
                    <div>
                        <strong>${disciplina.materiais}</strong>
                        <span>materiais</span>
                    </div>
                </div>

                <div class="seta">
                    <i class="bi bi-chevron-right"></i>
                </div>
            </div>
        `;
    });
}

function abrirMateriais(disciplinaId) {
    window.location.href = `../materiais/materiais.html?disciplinaId=${disciplinaId}`;
}

aplicarPermissoes();

carregarDisciplinas();

pesquisa.addEventListener("input", () => {
    const texto = pesquisa.value.toLowerCase();

    const cards = document.querySelectorAll(".card-disciplina");

    cards.forEach(card => {
        const titulo = card
            .querySelector(".titulo")
            .textContent
            .toLowerCase();

        card.style.display = titulo.includes(texto) ? "block" : "none";
    });
});