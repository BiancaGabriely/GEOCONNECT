fetch('/assests/reutilizaveis/sidebar.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('sidebar-placeholder').outerHTML = html;

        marcarLinkAtivo();
        configurarMenuMobile();
    })
    .catch(err => console.error('Erro ao carregar sidebar:', err));


function marcarLinkAtivo() {

    const paginaAtual = location.pathname.split('/').pop();

    const links = document.querySelectorAll('.sidebar a');

    links.forEach(link => {

        const paginaLink = link.getAttribute('href')?.split('/').pop();

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