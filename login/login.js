const API_URL = "http://localhost:3333";

const msg = document.getElementById("mensagem-login");


// =====================================================
// CALLBACK DO GOOGLE
// =====================================================

window.handleCredentialResponse = function (response) {

    console.log(">>> Credential recebido do Google");

    if (!response || !response.credential) {

        msg.textContent = "Não foi possível obter os dados do Google.";
        msg.className = "mensagem erro";

        return;
    }

    fazerLoginGoogle(response.credential);
};


// =====================================================
// LOGIN COM GOOGLE
// =====================================================

async function fazerLoginGoogle(credential) {

    try {

        msg.textContent = "Entrando com Google...";
        msg.className = "mensagem";


        const response = await fetch(
            `${API_URL}/login/google`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    credential: credential
                })
            }
        );


        const data = await response.json();

        console.log(">>> Resposta do backend:", data);


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "Não foi possível entrar com Google."
            );
        }


        // =============================================
        // VERIFICAÇÕES
        // =============================================

        if (!data.token) {

            throw new Error(
                "O servidor não retornou o token."
            );
        }


        if (!data.professor) {

            throw new Error(
                "O servidor não retornou os dados do professor."
            );
        }


        if (!data.professor.id) {

            throw new Error(
                "O servidor não retornou o ID do professor."
            );
        }


        // =============================================
        // SALVA OS DADOS
        // =============================================

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "professor",
            JSON.stringify(data.professor)
        );

        localStorage.setItem(
            "professorId",
            String(data.professor.id)
        );

        localStorage.setItem(
            "usuario",
            JSON.stringify(data.professor)
        );


        console.log(
            ">>> Professor logado:",
            data.professor
        );

        console.log(
            ">>> Professor ID:",
            data.professor.id
        );

        console.log(
            ">>> JWT salvo:",
            !!localStorage.getItem("token")
        );


        // =============================================
        // SUCESSO
        // =============================================

        msg.textContent =
            "Login realizado com sucesso!";

        msg.className =
            "mensagem sucesso";


        setTimeout(() => {

            window.location.href =
                "../index/index.html";

        }, 500);


    } catch (error) {

        console.error(
            ">>> Erro no login Google:",
            error
        );

        msg.textContent =
            error.message ||
            "Não foi possível conectar ao servidor.";

        msg.className =
            "mensagem erro";
    }
}