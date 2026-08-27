document.addEventListener("DOMContentLoaded", () => {
    const btnCadastrar = document.getElementById("btnCadastrar")
    const formCadastro = document.getElementById("form-cadastro")
    const nomeInput = document.getElementById("nome")
    const emailInput = document.getElementById("email")
    const senhaInput = document.getElementById("senha")
    const confirmarSenhaInput = document.getElementById("confirmar-senha")
    const msg = document.getElementById("mensagem-cadastro")

    btnCadastrar.addEventListener("click", async (e) =>{
        e.preventDefault()

        const nome = nomeInput.value.trim()
        const email = emailInput.value.trim()
        const senha = senhaInput.value.trim()
        const confirmarSenha = confirmarSenhaInput.value.trim()

        if(!nome || !email || !senha || !confirmarSenha){
            msg.textContent = "Por favor, preencha todos os campos."
            msg.className = "mensagem erro"
            return
        }

        if(senha !== confirmarSenha){
            msg.textContent = "As senhas não coincidem."
            msg.className = "mensagem erro"
            return
        }

        try{

            const response = await fetch('https://backend-93vk.onrender.com/cadastro', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({nome, email, senha})
            })

            const data = await response.json()

            console.log("Resposta do cadastro:", data)

            if(response.ok){
                msg.textContent = "Cadastro realizado com sucesso!"
                msg.className = "mensagem sucesso"

                setTimeout(() => {
                    window.location.href = "../login/login.html"
                }, 1000)
            }else{
                msg.textContent = data.error || data.message || "Erro ao realizar o cadastro"
                msg.className = "mensagem erro"            
            }
        }catch(error) {
            console.error("Erro no cadastro", error)
            msg.textContent = error.message || "Não foi possível conectar ao servidor"
            msg.className = "mensagem erro"
        }
    })
})