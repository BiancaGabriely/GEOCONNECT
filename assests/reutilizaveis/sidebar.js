// assests/reutilizaveis/sidebar.js

fetch('/assests/reutilizaveis/sidebar.html')

  .then(res => res.text())

  .then(html => {

    document.getElementById('sidebar-placeholder').outerHTML = html;

    marcarLinkAtivo();
    carregarNomeUsuario();

  })

  .catch(err => console.error('Erro ao carregar sidebar:', err));


// Marca o link da página atual
function marcarLinkAtivo() {

  const paginaAtual = location.pathname.split('/').pop();

  const links = document.querySelectorAll('#sidebar-container .nav-link');

  links.forEach(link => {

    if (link.dataset.page === paginaAtual) {

      link.classList.add('active');

    }

  });

}


// Mostra o nome do usuário logado
function carregarNomeUsuario() {

  const elementoNome = document.getElementById('nome-usuario');

  if (!elementoNome) return;

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (usuario && usuario.nome) {

    elementoNome.textContent = usuario.nome;

  } else {

    elementoNome.textContent = 'Usuário';

  }

}