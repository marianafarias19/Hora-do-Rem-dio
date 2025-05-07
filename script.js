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

function mostrarHoje() {
  document.getElementById("tela-hoje").style.display = "block";
  document.getElementById("tela-historico").style.display = "none";
  renderizar(); // atualiza a tela atual
}

function mostrarHistorico() {
  document.getElementById("tela-hoje").style.display = "none";
  document.getElementById("tela-historico").style.display = "block";
  renderizarHistorico(); // nova função abaixo
}


function renderizarHistorico() {
  const div = document.getElementById("lista-historico");
  div.innerHTML = "";

  const datas = [...new Set(remedios.map(r => r.data))].sort().reverse();

  datas.forEach(data => {
    const titulo = document.createElement("h3");
    titulo.textContent = `📅 ${data}`;
    div.appendChild(titulo);

    const ul = document.createElement("ul");
    remedios
      .filter(r => r.data === data)
      .forEach(r => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${r.nome} - ${r.horario} - ${r.horaExata} - ${r.tomado ? "✅ Tomado" : "❌ Não tomado"}</span>`;
        ul.appendChild(li);
      });
    div.appendChild(ul);
  });
}

mostrarHoje();

let editandoIndex = null;

const editarForm = document.getElementById("editar-form");
const editarNome = document.getElementById("editar-nome");
const editarPeriodo = document.getElementById("editar-periodo");
const editarHora = document.getElementById("editar-hora");

function editarRemedio(index) {
  const r = remedios[index];
  editarNome.value = r.nome;
  editarPeriodo.value = r.horario;
  editarHora.value = r.horaExata;
  editarForm.style.display = "block";
  form.style.display = "none";
  editandoIndex = index;
}

function cancelarEdicao() {
  editarForm.style.display = "none";
  form.style.display = "block";
  editandoIndex = null;
}

editarForm.addEventListener("submit", (e) => {
  e.preventDefault();
  remedios[editandoIndex].nome = editarNome.value;
  remedios[editandoIndex].horario = editarPeriodo.value;
  remedios[editandoIndex].horaExata = editarHora.value;
  salvar();
  renderizar();
  cancelarEdicao();
});
