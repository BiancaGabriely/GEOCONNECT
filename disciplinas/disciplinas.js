const disciplinas = [
    {
        nome: "Mineralogia",
        descricao: "Materiais voltados ao estudo dos minerais.",
        materiais: 34,
        questoes: 78,
        acessos: 150,
        professores: 3
    },
    {
        nome: "Topografia",
        descricao: "Materiais sobre levantamento topográfico.",
        materiais: 20,
        questoes: 45,
        acessos: 89,
        professores:7
    }
];

const quantidade = document.getElementById("quantidade-disciplinas");

quantidade.textContent = disciplinas.length;
const lista = document.getElementById("lista-disciplinas");

disciplinas.forEach(disciplina => {
    lista.innerHTML += `
    <div class="card-disciplina">

        <div class="info">

            <div class="icone">
             <i class="bi bi-book"></i>
            </div>

            <div>

                <div class="titulo">${disciplina.nome}</div>

                <div class="descricao">${disciplina.descricao}</div>

            </div>

        </div>
        <div class="estatisticas">

            <div>
                <strong>${disciplina.materiais}</strong>
                <span>materiais</span>
            </div>

            <div>
                <strong>${disciplina.questoes}</strong>
                <span>questões</span>
            </div>

            <div>
                <strong>${disciplina.professores}</strong>
                <span>professores</span>
            </div>
        </div>

        <div class="seta">
            <i class="bi bi-chevron-right"></i>
        </div>

    </div>
    `;
});

const pesquisa = document.getElementById("pesquisa");

pesquisa.addEventListener("input", ()=>{
    const texto = pesquisa.value.toLowerCase();
    const cards = document.querySelectorAll(".card-disciplina");

    cards.forEach(card=>{
        const titulo = card.querySelector(".titulo").textContent.toLowerCase();

        card.style.display = titulo.includes(texto) ? "block":"none";
    });
});
    