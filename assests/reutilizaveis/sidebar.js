// assests/reutilizaveis/sidebar.js
fetch('/assests/reutilizaveis/sidebar.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('sidebar-placeholder').outerHTML = html;
    marcarLinkAtivo();
  })
  .catch(err => console.error('Erro ao carregar sidebar:', err));

function marcarLinkAtivo() {
  const paginaAtual = location.pathname.split('/').pop();
  const links = document.querySelectorAll('#sidebar-container .nav-link');

  links.forEach(link => {
    if (link.dataset.page === paginaAtual) {
      link.classList.add('active');
    }
  });
}