const API_URL = "http://localhost:3333";

const msg = document.getElementById("mensagem-login");
const formLogin = document.getElementById("form-login");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const btnLogin = document.getElementById("btn-login");

// FUNÇÃO PARA SALVAR OS DADOS DO USUÁRIO
function salvarDadosLogin(data) {
    if (!data.token) {
        throw new Error("O servidor não retornou o token.");
    }

    if (!data.professor) {
        throw new Error("O servidor não retornou os dados do professor.");
    }

    if (!data.professor.id) {
        throw new Error("O servidor não retornou o ID do professor.");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("professor", JSON.stringify(data.professor));
    localStorage.setItem("professorId", String(data.professor.id));
    localStorage.setItem("usuario", JSON.stringify(data.professor));

    console.log(">>> Professor logado:", data.professor);
    console.log(">>> Professor ID:", data.professor.id);
    console.log(">>> JWT salvo:", !!localStorage.getItem("token"));
}

// LOGIN NORMAL - E-MAIL E SENHA
if (formLogin) {
    formLogin.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const senha = senhaInput.value;

        // VALIDAÇÃO
        if (!email || !senha) {
            msg.textContent = "Preencha o e-mail e a senha.";
            msg.className = "mensagem erro";
            return;
        }

        // DESABILITA BOTÃO
        btnLogin.disabled = true;
        btnLogin.textContent = "Entrando...";

        msg.textContent = "Verificando seus dados...";
        msg.className = "mensagem";

        try {
            // ENVIA PARA O BACKEND
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            });

            // RESPOSTA DO BACKEND
            const data = await response.json();
            console.log(">>> Resposta do login normal:", data);

            // ERRO
            if (!response.ok) {
                throw new Error(data.error || data.message || "E-mail ou senha incorretos.");
            }

            // SALVA TOKEN E USUÁRIO
            salvarDadosLogin(data);

            // SUCESSO
            msg.textContent = "Login realizado com sucesso!";
            msg.className = "mensagem sucesso";

            // REDIRECIONAMENTO
            setTimeout(() => {
                window.location.href = "../index/index.html";
            }, 500);

        } catch (error) {
            console.error(">>> Erro no login normal:", error);
            msg.textContent = error.message || "Não foi possível conectar ao servidor.";
            msg.className = "mensagem erro";

        } finally {
            btnLogin.disabled = false;
            btnLogin.textContent = "Entrar";
        }
    });
}

// CALLBACK DO GOOGLE
window.handleCredentialResponse = function (response) {
    console.log(">>> Credential recebido do Google");

    if (!response || !response.credential) {
        msg.textContent = "Não foi possível obter os dados do Google.";
        msg.className = "mensagem erro";
        return;
    }

    fazerLoginGoogle(response.credential);
};

// LOGIN COM GOOGLE
async function fazerLoginGoogle(credential) {
    try {
        msg.textContent = "Entrando com Google...";
        msg.className = "mensagem";

        const response = await fetch(`${API_URL}/login/google`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                credential: credential
            })
        });

        const data = await response.json();
        console.log(">>> Resposta do backend:", data);

        // ERRO
        if (!response.ok) {
            throw new Error(data.error || data.message || "Não foi possível entrar com Google.");
        }

        // SALVA OS DADOS
        salvarDadosLogin(data);

        // SUCESSO
        msg.textContent = "Login realizado com sucesso!";
        msg.className = "mensagem sucesso";

        // REDIRECIONAMENTO
        setTimeout(() => {
            window.location.href = "../index/index.html";
        }, 500);

    } catch (error) {
        console.error(">>> Erro no login Google:", error);
        msg.textContent = error.message || "Não foi possível conectar ao servidor.";
        msg.className = "mensagem erro";
    }
}