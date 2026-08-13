document.addEventListener("DOMContentLoaded",()=>{

    const btnLogin=document.getElementById("btnLogin");
    const emailInput=document.getElementById("email");
    const senhaInput=document.getElementById("senha");
    const msg=document.getElementById("mensagem-login");

    btnLogin.addEventListener("click",async()=>{

        const email=emailInput.value.trim();
        const senha=senhaInput.value.trim();

        if(!email||!senha){
            msg.textContent="Por favor, preencha o e-mail e a senha.";
            msg.className="mensagem erro";
            return;
        }

        try{

            const response=await fetch("http://localhost:3333/login",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({email,senha})
            });

            const data=await response.json();

            console.log("Resposta do login:",data);

            if(response.ok){

                if(!data.token){
                    console.error("Token não encontrado:",data);
                    throw new Error("O servidor não retornou o token.");
                }

                if(!data.professor){
                    console.error("Professor não encontrado:",data);
                    throw new Error("O servidor não retornou os dados do professor.");
                }

                if(!data.professor.id){
                    console.error("ID do professor não encontrado:",data.professor);
                    throw new Error("O servidor não retornou o ID do professor.");
                }

                localStorage.setItem("token",data.token);
                localStorage.setItem("professor",JSON.stringify(data.professor));
                localStorage.setItem("professorId",String(data.professor.id));
                localStorage.setItem("usuario",JSON.stringify(data.professor));

                console.log("Professor logado:",data.professor);
                console.log("Professor ID salvo:",localStorage.getItem("professorId"));
                console.log("Token salvo:",!!localStorage.getItem("token"));

                msg.textContent="Login realizado com sucesso!";
                msg.className="mensagem sucesso";

                setTimeout(()=>{
                    window.location.href="../index/index.html";
                },500);

            }else{

                msg.textContent=data.error||data.message||"E-mail ou senha inválidos.";
                msg.className="mensagem erro";

            }

        }catch(error){

            console.error("Erro no login:",error);
            msg.textContent=error.message||"Não foi possível conectar ao servidor.";
            msg.className="mensagem erro";

        }

    });

});