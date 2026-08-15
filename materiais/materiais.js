const params = new URLSearchParams(window.location.search);
const disciplinaId = params.get("disciplinaId");

console.log("Disciplina selecionada:", disciplinaId);