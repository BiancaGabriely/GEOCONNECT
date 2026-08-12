const form = document.getElementById('form-disciplina');

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
                
            })
        });

        const dados = await resposta.json();

        if(!resposta.ok){
            throw new Error( dados.mensagem || `Erro ao cadastrar disciplina`);
        }

        mensagem.textContent = 'Disciplina cadastrada com sucesso!';
        mensagem.className = 'mensagem-sucesso';

        form.reset();

    } catch (erro) {
        console.error(erro);

        mensagem.textContent = 'Erro ao cadastrar disciplina. Tente novamente.';
        mensagem.className = 'mensagem-erro';
    }
});
