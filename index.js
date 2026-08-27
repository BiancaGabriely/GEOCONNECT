// ========================================
// CONFIGURAÇÃO
// ========================================

const API_URL = "https://backend-93vk.onrender.com";


// ========================================
// CARREGAR DADOS DO DASHBOARD
// ========================================

async function carregarDashboard() {
    try {
        const response = await fetch(`${API_URL}/dashboard`);

        if (!response.ok) {
            throw new Error("Erro ao buscar dados do dashboard.");
        }

        const dashboard = await response.json();

        document.getElementById("total-materiais").textContent =
            dashboard.materiais ?? 0;

        document.getElementById("total-disciplinas").textContent =
            dashboard.disciplinas ?? 0;

        document.getElementById("total-professores").textContent =
            dashboard.professores ?? 0;

        document.getElementById("total-questoes").textContent =
            dashboard.questoes ?? 0;

    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);

        document.getElementById("total-materiais").textContent = "0";
        document.getElementById("total-disciplinas").textContent = "0";
        document.getElementById("total-professores").textContent = "0";
        document.getElementById("total-questoes").textContent = "0";
    }
}


// ========================================
// CARREGAR DISCIPLINAS
// ========================================

async function carregarDisciplinas() {

    const lista = document.getElementById("lista-disciplinas");

    try {

        const response = await fetch(`${API_URL}/disciplinas`);

        if (!response.ok) {
            throw new Error("Erro ao buscar disciplinas.");
        }

        const disciplinas = await response.json();

        lista.innerHTML = "";

        if (!disciplinas || disciplinas.length === 0) {
            lista.innerHTML = `
                <p class="mensagem-vazia">
                    Nenhuma disciplina encontrada.
                </p>
            `;
            return;
        }

        disciplinas.forEach(disciplina => {

            lista.innerHTML += `
                <div class="card-disciplina">

                    <i class="bi ${disciplina.icone || "bi-book"}"></i>

                    <h5>${disciplina.nome || "Sem nome"}</h5>

                    <p>
                        ${disciplina.descricao || "Sem descrição"}
                    </p>

                    <small>
                        ${disciplina.materiais ?? 0} materiais
                    </small>

                </div>
            `;

        });

    } catch (error) {

        console.error("Erro ao carregar disciplinas:", error);

        lista.innerHTML = `
            <p class="mensagem-erro">
                Não foi possível carregar as disciplinas.
            </p>
        `;
    }
}


// ========================================
// CARREGAR MATERIAIS RECENTES
// ========================================

async function carregarMateriais() {

    const lista = document.getElementById("materiais-recentes");

    try {

        const response = await fetch(`${API_URL}/materiais`);

        if (!response.ok) {
            throw new Error("Erro ao buscar materiais.");
        }

        const materiaisRecentes = await response.json();

        lista.innerHTML = "";

        if (!materiaisRecentes || materiaisRecentes.length === 0) {

            lista.innerHTML = `
                <p class="mensagem-vazia">
                    Nenhum material encontrado.
                </p>
            `;

            return;
        }

        materiaisRecentes.forEach(material => {

            lista.innerHTML += `
                <div class="card-material">

                    <div>

                        <h5>
                            ${material.titulo || "Sem título"}
                        </h5>

                        <p>
                            ${material.disciplina || "Sem disciplina"}
                        </p>

                        <span>
                            ${material.data || ""}
                        </span>

                    </div>

                </div>
            `;

        });

    } catch (error) {

        console.error("Erro ao carregar materiais:", error);

        lista.innerHTML = `
            <p class="mensagem-erro">
                Não foi possível carregar os materiais.
            </p>
        `;
    }
}


// ========================================
// PESQUISA DE DISCIPLINAS
// ========================================

const pesquisa = document.getElementById("pesquisa");

if (pesquisa) {

    pesquisa.addEventListener("input", () => {

        const texto = pesquisa.value
            .toLowerCase()
            .trim();

        const cards = document.querySelectorAll(".card-disciplina");

        cards.forEach(card => {

            const titulo =
                card.querySelector("h5")?.textContent
                    .toLowerCase() || "";

            const descricao =
                card.querySelector("p")?.textContent
                    .toLowerCase() || "";

            const encontrou =
                titulo.includes(texto) ||
                descricao.includes(texto);

            card.style.display =
                encontrou ? "" : "none";

        });

    });

}


// ========================================
// INICIAR DASHBOARD
// ========================================

async function iniciarPagina() {

    await carregarDashboard();

    await carregarDisciplinas();

    await carregarMateriais();

}


// ========================================
// EXECUTAR
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    iniciarPagina();
});