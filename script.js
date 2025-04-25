const form = document.getElementById("remedio-form");
const input = document.getElementById("nome-remedio");
const lista = document.getElementById("lista-remedios");
const periodo = document.getElementById("periodo");
const horaExata = document.getElementById("hora-exata");

let remedios = JSON.parse(localStorage.getItem("remedios")) || [];

function salvar() {
  localStorage.setItem("remedios", JSON.stringify(remedios));
}

function getHoje() {
  return new Date().toISOString().split("T")[0];
}

function renderizar() {
  lista.innerHTML = "";
  const periodos = ["manhã", "tarde", "noite"];

  periodos.forEach(periodoAtual => {
    const header = document.createElement("h3");
    header.textContent = periodoAtual.charAt(0).toUpperCase() + periodoAtual.slice(1);
    lista.appendChild(header);

    remedios
      .map((remedio, index) => ({ ...remedio, index }))
      .filter(r => r.horario === periodoAtual && r.data === getHoje())
      .forEach((remedio) => {
        const li = document.createElement("li");
        li.className = remedio.tomado ? "tomado" : "";
        li.innerHTML = `
          <span>${remedio.nome} - ${remedio.horaExata}</span>
          <div>
            <button onclick="toggleTomado(${remedio.index})">
              ${remedio.tomado ? "Desmarcar" : "Tomado"}
            </button>
            <button onclick="removerRemedio(${remedio.index})" style="background-color: red;">
              Remover
            </button>
          </div>
        `;
        lista.appendChild(li);
      });
  });
}

function adicionarRemedio(nome, horario, hora) {
  remedios.push({
    nome,
    horario,
    horaExata: hora,
    tomado: false,
    data: getHoje()
  });
  salvar();
  renderizar();
}

function removerRemedio(index) {
  remedios.splice(index, 1);
  salvar();
  renderizar();
}

function toggleTomado(index) {
  remedios[index].tomado = !remedios[index].tomado;
  salvar();
  renderizar();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = input.value.trim();
  if (nome !== "") {
    adicionarRemedio(nome, periodo.value, horaExata.value);
    input.value = "";
    horaExata.value = "";
  }
});

function verificarNotificacoes() {
  const agora = new Date();
  const horaAtual = agora.toTimeString().slice(0, 5);

  remedios.forEach(remedio => {
    if (
      remedio.horaExata === horaAtual && 
      !remedio.tomado &&
      remedio.data === getHoje()
    ) {
      alert(`Lembrete: está na hora de tomar o remédio "${remedio.nome}"`);
    }
  });
}

setInterval(verificarNotificacoes, 60000); // verifica a cada minuto

renderizar();
