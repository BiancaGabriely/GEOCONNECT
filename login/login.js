
const formLogin = document.getElementById('formLogin');

const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');

const btnLogin = document.getElementById('btnLogin');

const mensagem = document.getElementById('mensagem');


formLogin.addEventListener('submit', async (event) => {

    // Impede o navegador de recarregar a página
    event.preventDefault();

    const email = emailInput.value.trim();
    const senha = senhaInput.value;


    // Desativa o botão enquanto faz a requisição
    btnLogin.disabled = true;
    btnLogin.textContent = 'Entrando...';


    try {

        // Conecta o FRONTEND com o BACKEND
        const resposta = await fetch('http://localhost:3333/login', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                email: email,
                senha: senha
            })

        });


        // Pega a resposta enviada pelo backend
        const dados = await resposta.json();

        console.log('Resposta do backend:', dados);


        // Se o backend retornar erro
        if (!resposta.ok) {

            mensagem.textContent =
                dados.error || 'Erro ao fazer login.';

            mensagem.style.color = 'red';

            return;
        }


        // ==========================================
        // LOGIN REALIZADO COM SUCESSO
        // ==========================================

        mensagem.textContent = 'Login realizado com sucesso!';
        mensagem.style.color = 'green';


        // Guarda o JWT
        localStorage.setItem('token', dados.token);


        // Guarda os dados do professor
        localStorage.setItem(
            'professor',
            JSON.stringify(dados.professor)
        );


        console.log('Token:', dados.token);
        console.log('Professor:', dados.professor);


        // Vai para a página inicial
        setTimeout(() => {

            window.location.href = '../index.html';

        }, 800);


    } catch (erro) {

        console.error('Erro ao conectar com o backend:', erro);

        mensagem.textContent =
            'Não foi possível conectar ao servidor.';

        mensagem.style.color = 'red';


    } finally {

        btnLogin.disabled = false;
        btnLogin.textContent = 'Login';

    }

});

