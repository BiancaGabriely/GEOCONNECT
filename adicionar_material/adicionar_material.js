document.addEventListener("DOMContentLoaded",function(){
    const API_URL = 'https://backend-93vk.onrender.com';
    const input=document.getElementById("palavras-chave");
    const tags=document.getElementById("tags");
    const inputValor=document.getElementById("palavras-chave-valor");
    const form=document.getElementById("form-material");
    const tagsWrapper=document.querySelector(".tags-input");
    const arquivoInput=document.getElementById("arquivo");
    const nomeArquivoEl=document.getElementById("nome-arquivo-selecionado");
    const listaMateriais=document.querySelector(".card-materiais");
    const disciplinaSelect=document.getElementById("disciplina");
    const descricaoEl=document.getElementById("descricao");
    const contadorDescricaoEl=document.getElementById("contador-descricao");
    const avisoLimiteEl=document.getElementById("aviso-limite-descricao");
    const LIMITE_DESCRICAO=500;
    let palavras=[];
    let idEmEdicao=null;

function validarAutenticacao() {
        const token = localStorage.getItem("token");

        console.log("[DEBUG 1] Valor do token no localStorage:", JSON.stringify(token));
        if (!token || token === "null" || token === "undefined") {
            console.log("[DEBUG 2] ❌ Token inválido. Exibindo alerta e redirecionando...");
            alert("Sessão inválida ou expirada. Faça login para continuar.");
            console.log("[DEBUG 3] Executando redirecionamento para ../login/login.html");
            window.location.href = "../login/login.html";
            return null;
        }
        console.log("[DEBUG 2] ✅ Token válido encontrado:", token);
        return token;
    }

function obterProfessorId(){
const professorId=localStorage.getItem("professorId");
if(professorId)return professorId;
const usuarioSalvo=localStorage.getItem("usuario");
if(!usuarioSalvo)return null;
try{
const usuario=JSON.parse(usuarioSalvo);
if(usuario?.id)return usuario.id;
if(usuario?.id_professor)return usuario.id_professor;
}catch(erro){console.error("Erro ao ler usuário:",erro);}
return null;
}

function ehAdmin(){
const usuarioSalvo=localStorage.getItem("usuario");
if(!usuarioSalvo)return false;
try{
const usuario=JSON.parse(usuarioSalvo);
return usuario?.tipo==="adm";
}catch(erro){
console.error("Erro ao ler usuário:",erro);
return false;
}
}

arquivoInput.addEventListener("change",function(){
if(arquivoInput.files.length>0)nomeArquivoEl.textContent="📄 "+arquivoInput.files[0].name;
else nomeArquivoEl.textContent="";
});

input.addEventListener("keydown",function(e){
    if(e.key==="Enter"||e.key===","){
        e.preventDefault();
        adicionarPalavra(input.value);
        input.value="";
    }
});

function adicionarPalavra(valor){
    const texto=valor.trim().replace(/,$/,"");
    if(texto==="")return;
    const jaExiste=palavras.some(palavra=>palavra.toLowerCase()===texto.toLowerCase());
    if(jaExiste)return;
    palavras.push(texto);
    atualizarTags();
}

function atualizarTags(){
    tags.innerHTML="";
    inputValor.value=palavras.join(",");
        palavras.forEach(function(palavra,index){
            const tag=document.createElement("span");
            tag.className="tag";
            tag.innerHTML=`${escapeHtml(palavra)}<span class="remover">&times;</span>`;
            tag.querySelector(".remover").addEventListener("click",function(){
            palavras.splice(index,1);
            atualizarTags();
        });
        tags.appendChild(tag);
    });
}

function mostrarErro(campo,mensagem){
limparErro(campo);
campo.classList.add("campo-invalido");
const erro=document.createElement("small");
erro.className="mensagem-erro";
erro.textContent=mensagem;
campo.insertAdjacentElement("afterend",erro);
}

function limparErro(campo){
campo.classList.remove("campo-invalido");
const proximoElemento=campo.nextElementSibling;
if(proximoElemento&&proximoElemento.classList.contains("mensagem-erro"))proximoElemento.remove();
}

function validarFormulario(){
let valido=true;
const titulo=document.getElementById("titulo");
const disciplina=document.getElementById("disciplina");
const descricao=document.getElementById("descricao");
const tipoMaterial=document.getElementById("tipo-material");
const arquivo=document.getElementById("arquivo");

if(titulo.value.trim()===""){mostrarErro(titulo,"O título é obrigatório.");valido=false;}else limparErro(titulo);
if(disciplina.value===""){mostrarErro(disciplina,"Selecione uma disciplina.");valido=false;}else limparErro(disciplina);
if(descricao.value.trim()===""){mostrarErro(descricao,"A descrição é obrigatória.");valido=false;}else limparErro(descricao);
if(tipoMaterial.value===""){mostrarErro(tipoMaterial,"Selecione o tipo de material.");valido=false;}else limparErro(tipoMaterial);

if(!idEmEdicao&&arquivo.files.length===0){mostrarErro(arquivo,"Selecione um arquivo.");valido=false;}else limparErro(arquivo);
if(palavras.length===0){mostrarErro(tagsWrapper,"Adicione ao menos uma palavra-chave.");valido=false;}else limparErro(tagsWrapper);

return valido;
}

form.addEventListener("submit",async function(e){
e.preventDefault();

const token = validarAutenticacao();
  if (!token) {
    alert("Sua sessão expirou ou você não está logado. Faça login novamente.");
    return;
  }

if(input.value.trim()!==""){
adicionarPalavra(input.value);
input.value="";
}

if(!validarFormulario())return;

const professorId=obterProfessorId();

if(!professorId){
alert("Não foi possível identificar o professor logado.");
return;
}

const titulo=document.getElementById("titulo").value.trim();
const descricao=document.getElementById("descricao").value.trim();
const disciplinaId=document.getElementById("disciplina").value;
const tipoMaterial=document.getElementById("tipo-material").value;
const arquivo=arquivoInput.files[0];

try{

if(idEmEdicao){

const dados={
titulo:titulo,
descricao:descricao,
disciplinaId:Number(disciplinaId),
tipoMaterial:tipoMaterial,
palavrasChave:palavras.join(",")
};

const resposta=await fetch(`${API_URL}/materiais/${idEmEdicao}`,{
method:"PUT",
headers:{
    "Content-Type":"application/json", 
    "Authorization": `Bearer ${token}`,
},
body:JSON.stringify(dados)
});

if(!resposta.ok){
const erro=await resposta.text();
throw new Error(erro||"Erro ao atualizar material.");
}

mostrarSucesso("Material atualizado com sucesso!");

}else{

const formData=new FormData();
formData.append("titulo",titulo);
formData.append("descricao",descricao);
formData.append("disciplinaId",disciplinaId);
formData.append("professorId",professorId);
formData.append("tipoMaterial",tipoMaterial);
formData.append("palavrasChave",palavras.join(","));

if(arquivo)formData.append("arquivo",arquivo);

const resposta=await fetch(`${API_URL}/materiais`,{
method:"POST",
headers: {
     "Authorization": `Bearer ${token}`, 
},
body:formData
});

if(!resposta.ok){
const erro=await resposta.text();
console.error("Erro do backend:",erro);
throw new Error(erro||"Erro ao enviar material.");
}

mostrarSucesso("Material enviado com sucesso!");
}

idEmEdicao=null;
document.querySelector(".btn-enviar").innerHTML=`<i class="bi bi-send"></i> Enviar material`;
form.reset();
palavras=[];
atualizarTags();
nomeArquivoEl.textContent="";
atualizarContadorDescricao();
avisoLimiteEl.classList.remove("mostrar");
await carregarMateriais();

}catch(erro){
console.error(erro);
alert(erro.message||"Erro ao conectar com o backend.");
}
});

async function carregarDisciplinas(){
    const token = validarAutenticacao();
    if (!token) return;

    try{
    const resposta=await fetch(`${API_URL}/disciplinas`,{
        headers: { "Authorization": `Bearer ${token}` }
    });

    if(!resposta.ok)throw new Error("Erro ao carregar disciplinas.");
    const disciplinas=await resposta.json();
    disciplinaSelect.innerHTML=`<option value="">Selecione uma disciplina</option>`;

    disciplinas.forEach(function(disciplina){
    const option=document.createElement("option");
    option.value=disciplina.id;
    option.textContent=disciplina.nome||disciplina.titulo||disciplina.name;
    disciplinaSelect.appendChild(option);
    });

}catch(erro){
console.error(erro);
alert("Erro ao carregar disciplinas.");
}
}

async function carregarMateriais(){
    const token = validarAutenticacao();
    if (!token) return;
try{
const resposta=await fetch(`${API_URL}/materiais`,{
    headers: { "Authorization": `Bearer ${token}` }
});
if(!resposta.ok)throw new Error("Erro ao carregar materiais.");

const materiais=await resposta.json();
const itensAntigos=listaMateriais.querySelectorAll(".material-item");
itensAntigos.forEach(item=>item.remove());
materiais.forEach(material=>adicionarMaterialNaLista(material));

}catch(erro){
console.error(erro);
alert("Erro ao carregar materiais.");
}
}

function obterNomeDisciplina(valor){
const option=disciplinaSelect.querySelector(`option[value="${valor}"]`);
return option?option.textContent.trim():valor;
}

function adicionarMaterialNaLista(material){
const item=document.createElement("div");
item.className="material-item";
item.dataset.id=material.id;

const disciplinaId=material.disciplinaId??material.disciplina?.id??material.disciplina_id;
const nomeDisciplina=material.disciplina?.nome||material.disciplina?.titulo||obterNomeDisciplina(disciplinaId);
const status=material.status||"Pendente";

const botoesAdmin=ehAdmin()?`
<button type="button" class="btn-editar" title="Editar"><i class="bi bi-pencil"></i></button>
<button type="button" class="btn-excluir" title="Excluir"><i class="bi bi-trash"></i></button>
`:"";

item.innerHTML=`
<div>
<h3>${escapeHtml(material.titulo||"")}</h3>
<p>${escapeHtml(nomeDisciplina||"")}</p>
</div>
<div class="acoes-material">
<span class="status-publicado">${escapeHtml(status)}</span>
${botoesAdmin}
</div>
`;

if(ehAdmin()){
item.querySelector(".btn-editar").addEventListener("click",function(){
editarMaterial(material.id);
});

item.querySelector(".btn-excluir").addEventListener("click",function(){
excluirMaterial(material.id);
});
}

const cabecalho=listaMateriais.querySelector(".cabecalho-materiais");

if(cabecalho)cabecalho.insertAdjacentElement("afterend",item);
else listaMateriais.appendChild(item);
}

function escapeHtml(valor){
const div=document.createElement("div");
div.textContent=valor;
return div.innerHTML;
}

function mostrarSucesso(mensagem){
const toast=document.createElement("div");
toast.className="toast-mensagem";
toast.innerHTML=`<i class="bi bi-check-circle"></i><span>${escapeHtml(mensagem)}</span>`;
document.body.appendChild(toast);

setTimeout(()=>toast.classList.add("mostrar"),10);

setTimeout(()=>{
toast.classList.remove("mostrar");
setTimeout(()=>toast.remove(),300);
},3000);
}

descricaoEl.addEventListener("input",function(){
atualizarContadorDescricao();
});

function atualizarContadorDescricao(){
if(descricaoEl.value.length>LIMITE_DESCRICAO)descricaoEl.value=descricaoEl.value.slice(0,LIMITE_DESCRICAO);

const tamanho=descricaoEl.value.length;
contadorDescricaoEl.textContent=`${tamanho} / ${LIMITE_DESCRICAO} caracteres`;

if(tamanho>=LIMITE_DESCRICAO){
contadorDescricaoEl.classList.add("limite-atingido");
avisoLimiteEl.classList.add("mostrar");
}else{
contadorDescricaoEl.classList.remove("limite-atingido");
avisoLimiteEl.classList.remove("mostrar");
}
}

const cancelar=document.querySelector(".btn-cancelar");

cancelar.addEventListener("click",function(e){
if(formularioTemDados()){
e.preventDefault();
confirmarCancelamento();
}
});

function formularioTemDados(){
const titulo=document.getElementById("titulo").value.trim();
const descricao=document.getElementById("descricao").value.trim();
const disciplina=document.getElementById("disciplina").value;
const tipoMaterial=document.getElementById("tipo-material").value;
const temArquivo=arquivoInput.files.length>0;
const temPalavraChave=palavras.length>0;

return titulo!==""||descricao!==""||disciplina!==""||tipoMaterial!==""||temArquivo||temPalavraChave;
}

function confirmarCancelamento(){
const confirmou=confirm("Deseja realmente cancelar?\nTodas as informações serão perdidas.");

if(confirmou){
form.reset();
palavras=[];
atualizarTags();
nomeArquivoEl.textContent="";
atualizarContadorDescricao();
avisoLimiteEl.classList.remove("mostrar");
idEmEdicao=null;
document.querySelector(".btn-enviar").innerHTML=`<i class="bi bi-send"></i> Enviar material`;
}
}

async function excluirMaterial(id){
const confirmou=confirm("Deseja realmente excluir este material?\nEsta ação não pode ser desfeita");

if(!confirmou)return;
const token = validarAutenticacao();
  if (!token) {
    alert("Você precisa estar logado para excluir.");
    return;
  }

try{
const resposta = await fetch(`${API_URL}/materiais/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

if(!resposta.ok){
const erro=await resposta.text();
throw new Error(erro||"Não foi possível excluir o material");
}

const item=listaMateriais.querySelector(`.material-item[data-id="${id}"]`);
if(item)item.remove();

mostrarSucesso("Material excluído com sucesso!");

}catch(erro){
console.error("Erro ao excluir:",erro);
alert(erro.message||"Erro ao excluir material");
}
}

async function editarMaterial(id){
    const token = validarAutenticacao();
    if (!token) return;

try{
const resposta=await fetch(`${API_URL}/materiais/${id}`, {
    headers: { "Authorization": `Bearer ${token}` }
});

if(!resposta.ok)throw new Error("Não foi possível carregar o material.");

const material=await resposta.json();

idEmEdicao=material.id;
document.getElementById("titulo").value=material.titulo||"";

const disciplinaId=material.disciplinaId??material.disciplina?.id??material.disciplina??"";
document.getElementById("disciplina").value=disciplinaId;
document.getElementById("descricao").value=material.descricao||"";
document.getElementById("tipo-material").value=material.tipoMaterial||"";

if(Array.isArray(material.palavrasChave)){
palavras=[...material.palavrasChave];
}else if(typeof material.palavrasChave==="string"){
palavras=material.palavrasChave.split(",").map(p=>p.trim()).filter(Boolean);
}else{
palavras=[];
}

atualizarTags();
atualizarContadorDescricao();

if(material.url){
const nomeArquivo=material.url.split("/").pop();
nomeArquivoEl.textContent=`${nomeArquivo} (selecione novamente para alterar)`;
}else{
nomeArquivoEl.textContent="";
}

document.querySelector(".btn-enviar").innerHTML=`<i class="bi bi-check"></i> Salvar alteração`;
form.scrollIntoView({behavior:"smooth"});

}catch(erro){
console.error("Erro ao editar",erro);
alert(erro.message||"Erro ao carregar material");
}
}
console.log("[DEBUG 4] Script carregado até o final. Iniciando verificação de autenticação...");

    try {
        if (validarAutenticacao()) {
            console.log("[DEBUG 5] Usuário autenticado. Carregando dados...");
            carregarDisciplinas();
            carregarMateriais();
            atualizarContadorDescricao();
        }
    } catch (erro) {
        console.error("[DEBUG ERRO] Falha durante a inicialização:", erro);
    }
});