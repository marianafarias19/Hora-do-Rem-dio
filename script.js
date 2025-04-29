const form = document.getElementById("remedio-form");
const input = document.getElementById("nome-remedio");
const lista = document.getElementById("lista-remedios");
const periodo = document.getElementById("periodo");
const horaExata = document.getElementById("hora-exata");

let remedios = JSON.parse(localStorage.getItem("remedios")) || [];

const themeToggle = document.getElementById("theme-toggle");
const currentTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

document.body.classList.toggle("dark", currentTheme === "dark");
themeToggle.textContent = currentTheme === "dark" ? "☀️ Modo Claro" : "🌓 Modo Escuro";

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "☀️ Modo Claro" : "🌓 Modo Escuro";
});

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

function salvar() {
  localStorage.setItem("remedios", JSON.stringify(remedios));
}

function getHoje() {
  return new Date().toISOString().split("T")[0];
}

function renderizar() {
  lista.innerHTML = "";
  const periodos = ["manhã", "tarde", "noite"];

  const dataSelecionada = document.getElementById("filtro-data").value || getHoje();

  periodos.forEach(p => {
    const header = document.createElement("h3");
    header.textContent = p.charAt(0).toUpperCase() + p.slice(1);
    lista.appendChild(header);

    remedios
  .map((r, i) => ({ ...r, index: i })) // inclui o índice original
  .filter(r => r.horario === p && r.data === dataSelecionada)
  .forEach(remedio => {
    const li = document.createElement("li");
    li.className = remedio.tomado ? "tomado" : "";
    li.innerHTML = `
      <span>${remedio.nome} - ${remedio.horaExata}</span>
      <div>
        <button onclick="toggleTomado(${remedio.index})" ${remedio.data !== getHoje() ? "disabled" : ""}>
          ${remedio.tomado ? "Desmarcar" : "Tomado"}
        </button>
        <button onclick="removerRemedio(${remedio.index})" style="background-color: red;" ${remedio.data !== getHoje() ? "disabled" : ""}>
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
     if (Notification.permission === "granted") {
      new Notification("Lembrete de Remédio💊", {
        body: `Hora de tomar: ${remedio.nome}`,
        icon: "https://cdn-icons-png.flaticon.com/512/2947/2947898.png",
      });
     }
    }
  });
}

setInterval(verificarNotificacoes, 60000); // verifica a cada minuto

renderizar();

const filtroData = document.getElementById("filtro-data");
filtroData.value = getHoje();
filtroData.addEventListener("change", renderizar);
