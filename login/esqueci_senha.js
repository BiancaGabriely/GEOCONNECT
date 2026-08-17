const API_URL = "http://localhost:3333";

const form = document.getElementById("form-esqueci-senha");
const emailInput = document.getElementById("email");
const mensagem = document.getElementById("mensagem");
const btnEnviar = document.getElementById("btn-enviar");


function mostrarMensagem(texto, tipo) {

    mensagem.textContent = texto;

    mensagem.className = `alert alert-${tipo} mt-3`;

    mensagem.style.display = "block";
}


form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {

        mostrarMensagem(
            "Digite seu e-mail.",
            "warning"
        );

        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.textContent = "Enviando...";

    mensagem.style.display = "none";

    try {

        const resposta = await fetch(
            `${API_URL}/esqueci-senha`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                dados.error ||
                dados.message ||
                "Não foi possível solicitar a recuperação da senha."
            );
        }

        mostrarMensagem(
            dados.message ||
            "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
            "success"
        );

        form.reset();

    } catch (error) {

        console.error(
            "Erro ao solicitar recuperação de senha:",
            error
        );

        mostrarMensagem(
            error.message ||
            "Erro ao conectar com o servidor.",
            "danger"
        );

    } finally {

        btnEnviar.disabled = false;
        btnEnviar.textContent = "Enviar link de recuperação";

    }

});
