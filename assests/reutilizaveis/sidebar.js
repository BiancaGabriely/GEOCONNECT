fetch('/assests/reutilizaveis/sidebar.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('sidebar-placeholder').outerHTML = html;

        marcarLinkAtivo();
        configurarMenuMobile();
        carregarNomeUsuario();
    })
    .catch(err => console.error('Erro ao carregar sidebar:', err));


function carregarNomeUsuario() {

    const nomeElemento = document.getElementById('nome-usuario');

    if (!nomeElemento) {
        console.error('Elemento #nome-usuario não encontrado no sidebar.');
        return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    console.log('Usuário salvo:', usuario);

    if (usuario && usuario.nome) {
        nomeElemento.textContent = usuario.nome;
    } else {
        nomeElemento.textContent = 'Usuário';
    }
}


function marcarLinkAtivo() {

    const paginaAtual = location.pathname.split('/').pop();

    const links = document.querySelectorAll('.sidebar a');

    links.forEach(link => {

        const paginaLink =
            link.getAttribute('href')?.split('/').pop();

        if (paginaLink === paginaAtual) {
            link.classList.add('ativo');
        }

    });
}


function configurarMenuMobile() {

    const btnMenu = document.getElementById('btn-menu');
    const sidebar = document.querySelector('.sidebar');

    if (!btnMenu || !sidebar) return;

    btnMenu.addEventListener('click', () => {
        sidebar.classList.toggle('aberto');
    });
}