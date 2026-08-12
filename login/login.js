document.addEventListener('DOMContentLoaded', () => {
    const btnLogin = document.getElementById('btnLogin');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');

    btnLogin.addEventListener('click', async () => {
        const email = emailInput.value.trim()
        const senha = senhaInput.value.trim()

        // Validação básica dos campos
        if (!email || !senha) {
            alert('Por favor, preencha o e-mail e a senha.');
            return;
        }

        try {
            // Chamada para a sua API Fastify
            const response = await fetch('http://localhost:3333/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha }) // stringify - transforma valores ou objetos do js em string JSON
            });

            const data = await response.json() // ler o texto bruto do json e transforma em objeto do js

            if (response.ok) {
                // 1. Guardar a chave (token JWT) no navegador
                localStorage.setItem('token', data.token) // data.token - string do token jwt
                localStorage.setItem('professor', JSON.stringify(data.professor)) // data.professor - dados do professor cadastrado

                alert('Login realizado com sucesso!')

                // 2. Redirecionar para a tela inicial
                window.location.href = '../index/index.html'
            } else {
                // Exibe a mensagem do backend (ex: "Email ou senha inválidos")
                alert(data.error || 'Falha ao autenticar.')
            }

        } catch (error) {
            console.error('Erro na requisição:', error)
            alert('Não foi possível conectar ao servidor. O Fastify está rodando na porta 3333?')
        }
    })
})