(() => {
  const resultado = document.getElementById("resultado");
  const operacion = document.getElementById("operacion");
  const memoriaIndicador = document.getElementById("memoriaIndicador");
  const botones = document.querySelectorAll(".teclado button");
  const temaBtn = document.getElementById("temaBtn");
  const temasMenu = document.getElementById("temasMenu");
  const botonesTema = document.querySelectorAll("[data-tema]");
  const historialBtn = document.getElementById("historialBtn");
  const historialContenido = document.getElementById("historialContenido");
  const historialFlecha = document.getElementById("historialFlecha");
  const limpiarHistorial = document.getElementById("limpiarHistorial");
  const copiarResultado = document.getElementById("copiarResultado");
  let actual = "0";
  let anterior = null;
  let operador = null;
  let esperandoNuevoNumero = false;
  let memoria = Number(localStorage.getItem("memoriaCalculadora") || 0);
  let historial = JSON.parse(localStorage.getItem("historialCalculadora") || "[]");
  if (historialBtn && historialContenido) {
    historialBtn.addEventListener("click", () => {
      const abierto = historialContenido.classList.toggle("visible");
      historialFlecha.textContent = abierto ? "▴" : "▾";
    });
  }
  if (limpiarHistorial) {
    limpiarHistorial.addEventListener("click", () => {
      historial = [];
      localStorage.removeItem("historialCalculadora");
      mostrarHistorial();
    });
  }
  function agregarHistorial(a, b, op, resultado) {
    historial.unshift({
      operacion: `${a} ${simboloOperador(op)} ${b}`,
      resultado: resultado
    });
    if (historial.length > 20) { historial.pop(); }
    localStorage.setItem("historialCalculadora", JSON.stringify(historial));
    mostrarHistorial();
  }
  function mostrarHistorial() {
    const historialLista = document.getElementById("historialLista");
    if (!historialLista) return;
    historialLista.innerHTML = "";
    historial.forEach((item, indice) => {
      const elemento = document.createElement("div");
      elemento.className = "historial-item";
      elemento.innerHTML = `
        <div class="historial-operacion">${item.operacion}</div>
        <button class="historial-resultado" type="button" data-historial="${indice}">
          ${item.resultado}
        </button>
      `;
      historialLista.appendChild(elemento);
    });
  }
  const historialLista = document.getElementById("historialLista");
  if (historialLista) {
    historialLista.addEventListener("click", evento => {
      const boton = evento.target.closest("[data-historial]");
      if (!boton) return;
      const indice = Number(boton.dataset.historial);
      const item = historial[indice];
      if (!item) return;
      actual = String(item.resultado);
      anterior = null;
      operador = null;
      esperandoNuevoNumero = true;
      actualizarPantalla();
    });
  }
  if (copiarResultado) {
    copiarResultado.addEventListener("click", async () => {
      if (actual === "Error") return;
      try {
        await navigator.clipboard.writeText(actual);
        copiarResultado.textContent = "COPIADO ✓";
        setTimeout(() => { copiarResultado.textContent = "COPIAR"; }, 1200);
      } catch (error) {
        copiarResultado.textContent = "ERROR";
        setTimeout(() => { copiarResultado.textContent = "COPIAR"; }, 1200);
      }
    });
  }
  function actualizarPantalla() {
    resultado.textContent = actual;
    memoriaIndicador.textContent = memoria !== 0 ? "M" : "";
    if (anterior !== null && operador) {
      operacion.textContent = `${anterior} ${simboloOperador(operador)}`;
    } else {
      operacion.textContent = "";
    }
  }
  function simboloOperador(op) {
    const simbolos = { "+": "+", "-": "−", "*": "×", "/": "÷" };
    return simbolos[op] || op;
  }
  function agregarNumero(numero) {
    if (esperandoNuevoNumero) {
      actual = numero;
      esperandoNuevoNumero = false;
      actualizarPantalla();
      return;
    }
    if (actual === "0") {
      actual = numero;
    } else {
      actual += numero;
    }
    actualizarPantalla();
  }
  function agregarDecimal() {
    if (esperandoNuevoNumero) {
      actual = "0.";
      esperandoNuevoNumero = false;
      actualizarPantalla();
      return;
    }
    if (!actual.includes(".")) {
      actual += ".";
      actualizarPantalla();
    }
  }
  function elegirOperador(nuevoOperador) {
    const numeroActual = Number(actual);
    if (operador && esperandoNuevoNumero) {
      operador = nuevoOperador;
      actualizarPantalla();
      return;
    }
    if (anterior === null) {
      anterior = numeroActual;
    } else if (operador) {
      const calculo = calcular(anterior, numeroActual, operador);
      if (calculo === "Error") { mostrarError(); return; }
      anterior = calculo;
      actual = String(calculo);
    }
    operador = nuevoOperador;
    esperandoNuevoNumero = true;
    actualizarPantalla();
  }
  function calcular(a, b, op) {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b === 0 ? "Error" : a / b;
      default: return b;
    }
  }
  function mostrarError() {
    actual = "Error";
    anterior = null;
    operador = null;
    esperandoNuevoNumero = true;
    actualizarPantalla();
  }
  function obtenerResultado() {
    if (operador === null || anterior === null) return;
    const numeroAnterior = anterior;
    const numeroActual = Number(actual);
    const operadorActual = operador;
    const calculo = calcular(numeroAnterior, numeroActual, operadorActual);
    if (calculo === "Error") { mostrarError(); return; }
    agregarHistorial(numeroAnterior, numeroActual, operadorActual, calculo);
    actual = String(calculo);
    anterior = null;
    operador = null;
    esperandoNuevoNumero = true;
    actualizarPantalla();
  }
  function limpiar() {
    actual = "0";
    anterior = null;
    operador = null;
    esperandoNuevoNumero = false;
    actualizarPantalla();
  }
  function cambiarSigno() {
    if (actual === "0" || actual === "Error") return;
    actual = String(Number(actual) * -1);
    actualizarPantalla();
  }
  function porcentaje() {
    if (actual === "Error") return;
    const numeroActual = Number(actual);
    if (anterior !== null && operador !== null) {
      if (operador === "+" || operador === "-") {
        actual = String(anterior * numeroActual / 100);
      } else if (operador === "*" || operador === "/") {
        actual = String(numeroActual / 100);
      }
    } else {
      actual = String(numeroActual / 100);
    }
    actualizarPantalla();
  }
  function borrar() {
    if (esperandoNuevoNumero || actual === "Error") return;
    if (actual.length <= 1 || (actual.length === 2 && actual.startsWith("-"))) {
      actual = "0";
    } else {
      actual = actual.slice(0, -1);
    }
    actualizarPantalla();
  }
  function memoriaAgregar() {
    if (actual === "Error") return;
    memoria += Number(actual);
    localStorage.setItem("memoriaCalculadora", String(memoria));
    actualizarPantalla();
  }
  function memoriaRestar() {
    if (actual === "Error") return;
    memoria -= Number(actual);
    localStorage.setItem("memoriaCalculadora", String(memoria));
    actualizarPantalla();
  }
  function memoriaRecuperar() {
    actual = String(memoria);
    esperandoNuevoNumero = true;
    actualizarPantalla();
  }
  function memoriaLimpiar() {
    memoria = 0;
    localStorage.removeItem("memoriaCalculadora");
    actualizarPantalla();
  }
  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      if (boton.dataset.number !== undefined) {
        agregarNumero(boton.dataset.number);
        return;
      }
      const accion = boton.dataset.action;
      switch (accion) {
        case "decimal": agregarDecimal(); break;
        case "operator": elegirOperador(boton.dataset.value); break;
        case "equals": obtenerResultado(); break;
        case "clear": limpiar(); break;
        case "sign": cambiarSigno(); break;
        case "percent": porcentaje(); break;
        case "delete": borrar(); break;
        case "memory-add": memoriaAgregar(); break;
        case "memory-subtract": memoriaRestar(); break;
        case "memory-recall": memoriaRecuperar(); break;
        case "memory-clear": memoriaLimpiar(); break;
      }
    });
  });
  function cambiarTema(tema) {
    document.body.classList.remove("tema-larenga", "tema-clasico", "tema-metallica", "tema-lospiojos", "tema-gorillaz");
    if (tema !== "base") {
      document.body.classList.add(`tema-${tema}`);
    }
    localStorage.setItem("temaCalculadora", tema);
    if (temasMenu) { temasMenu.classList.remove("visible"); }
  }
  if (temaBtn && temasMenu) {
    temaBtn.addEventListener("click", () => {
      temasMenu.classList.toggle("visible");
    });
  }
  botonesTema.forEach(boton => {
    boton.addEventListener("click", () => {
      cambiarTema(boton.dataset.tema);
    });
  });
  const temaGuardado = localStorage.getItem("temaCalculadora");
  if (temaGuardado) { cambiarTema(temaGuardado); }
  document.addEventListener("click", evento => {
    if (temasMenu && temaBtn && !temasMenu.contains(evento.target) && !temaBtn.contains(evento.target)) {
      temasMenu.classList.remove("visible");
    }
  });
  document.addEventListener("keydown", evento => {
    const tecla = evento.key;
    if (/^[0-9]$/.test(tecla)) { agregarNumero(tecla); return; }
    if (tecla === ".") { agregarDecimal(); return; }
    if (["+", "-", "*", "/"].includes(tecla)) { elegirOperador(tecla); return; }
    if (tecla === "Enter" || tecla === "=") { evento.preventDefault(); obtenerResultado(); return; }
    if (tecla === "Backspace") { evento.preventDefault(); borrar(); return; }
    if (tecla === "Escape") { limpiar(); return; }
    if (tecla === "%") { porcentaje(); return; }
  });
  mostrarHistorial();
  actualizarPantalla();
})();