document.addEventListener('DOMContentLoaded', () => {
    const btnLogin = document.getElementById('btnLogin');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const msg = document.getElementById('mensagem-login');

    btnLogin.addEventListener('click', async () => {
        const email = emailInput.value.trim()
        const senha = senhaInput.value.trim()

        // Validação básica dos campos
        if (!email || !senha) {
            msg.textContent = 'Por favor, preencha o e-mail e a senha.'
            msg.className = 'mensagem erro'
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

                // Mostrar mensagem de sucesso abaixo do campo de senha
                msg.textContent = 'Login realizado com sucesso!'
                msg.className = 'mensagem sucesso'

                // 2. Redirecionar para a tela inicial
                window.location.href = '../index/index.html'
                // Se quiser que a mensagem seja visível antes de redirecionar, use:
                // setTimeout(() => { window.location.href = '../index/index.html' }, 1200)
            } else {
                // Exibe a mensagem do backend (ex: "Email ou senha inválidos")
                msg.textContent = data.error || 'Falha ao autenticar.'
                msg.className = 'mensagem erro'
            }

        } catch (error) {
            console.error('Erro na requisição:', error)
            msg.textContent = 'Não foi possível conectar ao servidor.'
            msg.className = 'mensagem erro'
        }
    })
})