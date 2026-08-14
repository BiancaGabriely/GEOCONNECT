document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));
    
    // Captura os elementos do formulário e de mensagem da tela
    const form = document.getElementById("form-disciplina");
    const msg = document.getElementById("mensagem");

    if(!usuarioLogado || usuarioLogado.tipo !== "adm"){
        if (msg){
            msg.textContent = "Acesso negado! Apenas professores administradores podem acessar esta página.";
            msg.className = "mensagem-erro";
        }
        if (form) {
            // Esconde o formulário pra ninguém preencher
            form.style.display = "none"; 
        }

        // Manda o usuário de volta para a lista após 2 segundos
        setTimeout(() => {
            window.location.href = "../disciplinas/disciplinas.html";
        }, 2000);
        return; // Encerra a execução aqui

    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const mensagem = document.getElementById('mensagem');

        mensagem.textContent = '';
        mensagem.className = '';
        
        try{
            const resposta = await fetch('http://localhost:3333/disciplinas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    nome:nome,
                    professorId: usuarioLogado.id
                    
                })
            })

            const dados = await resposta.json();

            if(!resposta.ok){
                throw new Error( dados.mensagem || 'Erro ao cadastrar disciplina');
            }

            mensagem.textContent = 'Disciplina cadastrada com sucesso!';
            mensagem.className = 'mensagem-sucesso';

            form.reset();

        } catch (erro) {
            console.error(erro);

            mensagem.textContent = erro.message; 
            mensagem.className = 'mensagem-erro';
        }

    })

})
