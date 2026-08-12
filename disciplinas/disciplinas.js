const quantidade = document.getElementById("quantidade-disciplinas");
const lista = document.getElementById("lista-disciplinas");
const pesquisa = document.getElementById("pesquisa");

async function carregarDisciplinas() {
    try {
        const resposta = await fetch("http://localhost:3333/disciplinas");

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const disciplinas = await resposta.json();

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
            <div class="card-disciplina">
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
                        <strong>-</strong>
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