const API_URL = 'http://localhost:3333';

const usuarioLogado = JSON.parse(localStorage.getItem("usuario"))

const usuarioId = usuarioLogado?.id || usuarioLogado?.id_professor || usuarioLogado?.professorId

 if(!usuarioLogado || !usuarioLogado.id){
        window.location.href = "../login/login.html"
        
    }

    const listaMateriais = document.getElementById("listaMateriais")
    const qtdMateriais = document.getElementById("qtd-materiais")
    const filtroDisciplina = document.getElementById("filtro-disciplina")
    const filtroTipo = document.getElementById("filtro-tipo")
    const campoPesquisa = document.getElementById("pesquisa")
    const btnLimparFiltros = document.getElementById("btn-limpar-filtros")

    let materiais = []

    async function carregarMateriais() {
        try{
            const resposta = await fetch(`${API_URL}/materiais/meus/${usuarioId}`)

            if (!resposta.ok){
                throw new Error (`Erro HTTP ${resposta.status}`)
            }

            materiais = await resposta.json()

            povoarDisciplinas()
            mostrarMateriais(materiais)


        }catch (erro){
            console.error(erro)
            if (listaMateriais){
                listaMateriais.innerHTML = `
                    <div class="text-center py-4">
                        <p class="text-danger mb-0">Erro ao carregar materiais. Tente novamente mais tarde.</p>
                    </div>
                `
            }
          
        }
    }

    function povoarDisciplinas(){
        if (!filtroDisciplina) return

        const disciplinas = [... new Set(materiais.map(m => m.disciplina?.nome).filter(Boolean))]
        filtroDisciplina.innerHTML = ' <option value="" selected> Todas as disciplinas </option>'

        disciplinas.forEach(nome => {
            filtroDisciplina.innerHTML += `<option value="${nome}">${nome}</option>`
        })

    }

    function mostrarMateriais (lista){
        if (!listaMateriais){
            return
        }

        if (qtdMateriais){
            qtdMateriais.textContent = lista.length
        }

        if (lista.length === 0){
            listaMateriais.innerHTML = `
            <div class="text-center py-4">
                <p class="text-secondary mb-0">Nenhum material aprovado encontrado.</p>
            </div> 
            `
            return
        }
        
        listaMateriais.innerHTML = lista.map(material => {
        const extensao = material.url ? material.url.split('.').pop().toUpperCase() : 'PDF'
        const icone = (extensao === 'PPTX' || extensao === 'PPT') ? 'bi-file-earmark-slides' : 'bi-file-earmark-pdf'
        const nomeDisciplina = material.disciplina?.nome || 'Geral'

        return `
            <div class="card mb-3 p-3 shadow-sm border-0">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div class="d-flex align-items-center gap-3">
                        <div class="fs-2 text-success">
                            <i class="bi ${icone}"></i>
                        </div>
                        <div>
                            <h5 class="mb-1 fw-bold">${material.titulo}</h5>
                            <p class="text-muted small mb-1">${material.descricao || ''}</p>
                            <span class="badge bg-secondary me-1">${nomeDisciplina}</span>
                            <span class="badge bg-light text-dark border">${extensao}</span>
                        </div>
                    </div>
                    <div>
                        <a href="${API_URL}/${material.url}" target="_blank" class="btn btn-outline-success btn-sm">
                            <i class="bi bi-download"></i> Baixar
                        </a>
                    </div>
                </div>
            </div>
        `
        }).join('')

    }

    function aplicarFiltros (){
        const texto = campoPesquisa ? campoPesquisa.value.toLowerCase() : ''
        const disciplinaSel = filtroDisciplina ? filtroDisciplina.value : ''
        const tipoSel = filtroTipo ? filtroTipo.value : ''
        
        const filtrados = materiais.filter(material =>{
            const bateTexto = material.titulo.toLowerCase().includes(texto) ||
                            (material.descricao && material.descricao.toLowerCase().includes(texto))
            
            const bateDisciplina = !disciplinaSel || material.disciplina?.nome === disciplinaSel

            const extensao = material.url ? material.url.split('.').pop().toUpperCase() : ''
            const bateTipo = !tipoSel || extensao === tipoSel.toUpperCase()

            return bateTexto && bateDisciplina && bateTipo
        })

        mostrarMateriais(filtrados)
    }

    if (campoPesquisa){
        campoPesquisa.addEventListener('input', aplicarFiltros)
    }

    if (filtroDisciplina){
        filtroDisciplina.addEventListener('change', aplicarFiltros)
    }

    if(filtroTipo){
        filtroTipo.addEventListener('change', aplicarFiltros)
    }

    if (btnLimparFiltros){
        btnLimparFiltros.addEventListener('click', () =>{
            if (campoPesquisa){
                campoPesquisa.value = ''
            }
            if (filtroDisciplina){
                filtroDisciplina.value = ''
            }
            if (filtroTipo){
                filtroTipo.value = ''
            } 
            mostrarMateriais(materiais)
        })
    }

    carregarMateriais()