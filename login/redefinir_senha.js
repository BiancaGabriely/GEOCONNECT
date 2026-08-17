const API_URL = "http://localhost:3333";

const form = document.getElementById("form-redefinir-senha");
const novaSenhaInput = document.getElementById("novaSenha");
const confirmarSenhaInput = document.getElementById("confirmarSenha");
const mensagem = document.getElementById("mensagem");
const btnRedefinir = document.getElementById("btn-redefinir");


// Pega o token que veio na URL
const parametros = new URLSearchParams(window.location.search);
const token = parametros.get("token");


function mostrarMensagem(texto, tipo) {

    mensagem.textContent = texto;

    mensagem.className = `alert alert-${tipo} mt-3`;

    mensagem.style.display = "block";
}


// Verifica se existe token na URL
if (!token) {

    mostrarMensagem(
        "Link de recuperação inválido ou incompleto.",
        "danger"
    );

    btnRedefinir.disabled = true;
}


form.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!token) {
        return;
    }

    const novaSenha = novaSenhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;


    // Verifica se as senhas são iguais
    if (novaSenha !== confirmarSenha) {

        mostrarMensagem(
            "As senhas não são iguais.",
            "warning"
        );

        return;
    }


    // Verifica tamanho mínimo
    if (novaSenha.length < 6) {

        mostrarMensagem(
            "A senha deve ter pelo menos 6 caracteres.",
            "warning"
        );

        return;
    }


    btnRedefinir.disabled = true;
    btnRedefinir.textContent = "Redefinindo...";

    mensagem.style.display = "none";


    try {

        const resposta = await fetch(
            `${API_URL}/redefinir-senha`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    token: token,
                    novaSenha: novaSenha
                })
            }
        );


        const dados = await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.error ||
                dados.message ||
                "Não foi possível redefinir a senha."
            );
        }


        mostrarMensagem(
            dados.message ||
            "Senha redefinida com sucesso!",
            "success"
        );


        form.reset();


        // Depois de 2 segundos volta para o login
        setTimeout(() => {

            window.location.href = "login.html";

        }, 2000);


    } catch (error) {

        console.error(
            "Erro ao redefinir senha:",
            error
        );

        mostrarMensagem(
            error.message ||
            "Erro ao conectar com o servidor.",
            "danger"
        );


    } finally {

        btnRedefinir.disabled = false;
        btnRedefinir.textContent = "Redefinir senha";

    }

});
