//dashboard


function carregarDashboard(){
    document.getElementById("total-materiais").textContent = dashboard.materiais;
    document.getElementById("total-disciplinas").textContent = dashboard.disciplinas;
    document.getElementById("total-professores").textContent = dashboard.professores;
    document.getElementById("total-questoes").textContent = dashboard.questoes;
}

function carregarDisciplinas(){
    const lista = document.getElementById("lista-disciplinas");

    lista.innerHTML = "";

    disciplinas.forEach(disciplina=> {
        lista.innerHTML += `
            <div class="card-disciplina">

                <i class="bi ${disciplina.icone}"></i>

                <h5>${disciplina.nome}</h5>

                <p>${disciplina.descricao}</p>

                <small>${disciplina.materiais} materiais</small>

            </div>
        `;
    });

}

function carregarMateriais(){
    const lista = document.getElementById("materiais-recentes");
    
    lista.innerHTML="";

    materiaisRecentes.forEach(material => {
        lista.innerHTML += `
           <div class="card-material">
                <div>
                    <h5> ${material.titulo}</h5>
                    <p> ${material.disciplina}</p>

                    <span> ${material.data}</span>
                </div>
           </div>

        `;
    });
}

const pesquisa = document.getElementById("pesquisa");

pesquisa.addEventListener("input", ()=>{
    const texto = pesquisa.value.toLowerCase();
    const cards = document.querySelectorAll(".card-disciplina");

    cards.forEach(card=>{
        const titulo = card.querySelector("h5").textContent.toLowerCase();

        card.style.display = titulo.includes(texto) ? "block":"none";
    });
});

function iniciarPagina(){
    carregarDashboard();
    carregarDisciplinas();
    carregarMateriais();
}

iniciarPagina();


