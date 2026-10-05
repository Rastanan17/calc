(() => {
    const resultado = document.getElementById("resultado");
    const operacion = document.getElementById("operacion");
    const memoriaIndicador = document.getElementById("memoriaIndicador");
    const botones = document.querySelectorAll(".teclado button");

    const temaBtn = document.getElementById("temaBtn");
    const temasMenu = document.getElementById("temasMenu");
    const botonesTema = document.querySelectorAll("[data-tema]");

    let actual = "0";
    let anterior = null;
    let operador = null;
    let esperandoNuevoNumero = false;
    let memoria = 0;
    let historial = [];

    const limpiarHistorial = document.getElementById("limpiarHistorial");

    if (limpiarHistorial) {
        limpiarHistorial.addEventListener("click", () => {
            historial = [];
            mostrarHistorial();
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

    function agregarHistorial(a, b, op, resultado) {
        historial.unshift({
            operacion: `${a} ${simboloOperador(op)} ${b}`,
            resultado: resultado
        });

        if (historial.length > 20) {
            historial.pop();
        }

        mostrarHistorial();
    }

    function mostrarHistorial() {
        const historialLista = document.getElementById("historialLista");

        historialLista.innerHTML = "";

        historial.forEach(item => {
            const elemento = document.createElement("div");

            elemento.className = "historial-item";

            elemento.innerHTML = `
                <div class="historial-operacion">${item.operacion}</div>
                <div class="historial-resultado">${item.resultado}</div>
            `;

            historialLista.appendChild(elemento);
        });
    }

    function simboloOperador(op) {
        const simbolos = {
            "+": "+",
            "-": "−",
            "*": "×",
            "/": "÷"
        };

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

            if (calculo === "Error") {
                mostrarError();
                return;
            }

            anterior = calculo;
            actual = String(calculo);
        }

        operador = nuevoOperador;
        esperandoNuevoNumero = true;

        actualizarPantalla();
    }

    function calcular(a, b, op) {
        switch (op) {
            case "+":
                return a + b;

            case "-":
                return a - b;

            case "*":
                return a * b;

            case "/":
                return b === 0 ? "Error" : a / b;

            default:
                return b;
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
        if (operador === null || anterior === null) {
            return;
        }

        const numeroAnterior = anterior;
        const numeroActual = Number(actual);
        const operadorActual = operador;

        const calculo = calcular(
            numeroAnterior,
            numeroActual,
            operadorActual
        );

        if (calculo === "Error") {
            mostrarError();
            return;
        }

        agregarHistorial(
            numeroAnterior,
            numeroActual,
            operadorActual,
            calculo
        );

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
        if (actual === "0" || actual === "Error") {
            return;
        }

        actual = String(Number(actual) * -1);
        actualizarPantalla();
    }

    function porcentaje() {
        if (actual === "Error") {
            return;
        }

        actual = String(Number(actual) / 100);
        actualizarPantalla();
    }

    function borrar() {
        if (esperandoNuevoNumero || actual === "Error") {
            return;
        }

        if (
            actual.length <= 1 ||
            (actual.length === 2 && actual.startsWith("-"))
        ) {
            actual = "0";
        } else {
            actual = actual.slice(0, -1);
        }

        actualizarPantalla();
    }

    function memoriaAgregar() {
        if (actual === "Error") {
            return;
        }

        memoria += Number(actual);
    }

    function memoriaRestar() {
        if (actual === "Error") {
            return;
        }

        memoria -= Number(actual);
    }

    function memoriaRecuperar() {
        actual = String(memoria);
        esperandoNuevoNumero = true;
        actualizarPantalla();
    }

    function memoriaLimpiar() {
        memoria = 0;
    }

    // ========================================
    // CALCULADORA
    // ========================================

    botones.forEach(boton => {
        boton.addEventListener("click", () => {

            if (boton.dataset.number !== undefined) {
                agregarNumero(boton.dataset.number);
                return;
            }

            const accion = boton.dataset.action;

            switch (accion) {
                case "decimal":
                    agregarDecimal();
                    break;

                case "operator":
                    elegirOperador(boton.dataset.value);
                    break;

                case "equals":
                    obtenerResultado();
                    break;

                case "clear":
                    limpiar();
                    break;

                case "sign":
                    cambiarSigno();
                    break;

                case "percent":
                    porcentaje();
                    break;

                case "delete":
                    borrar();
                    break;

                case "memory-add":
                    memoriaAgregar();
                    break;

                case "memory-subtract":
                    memoriaRestar();
                    break;

                case "memory-recall":
                    memoriaRecuperar();
                    break;

                case "memory-clear":
                    memoriaLimpiar();
                    break;
            }
        });
    });

    // ========================================
    // SISTEMA DE TEMAS
    // ========================================

    function cambiarTema(tema) {

        document.body.classList.remove(
            "tema-larenga",
            "tema-clasico"
        );

        if (tema !== "base") {
            document.body.classList.add(`tema-${tema}`);
        }

        localStorage.setItem("temaCalculadora", tema);

        temasMenu.classList.remove("visible");
    }

    // Abrir / cerrar menú de temas

    if (temaBtn && temasMenu) {
        temaBtn.addEventListener("click", () => {
            temasMenu.classList.toggle("visible");
        });
    }

    // Seleccionar tema

    botonesTema.forEach(boton => {
        boton.addEventListener("click", () => {
            cambiarTema(boton.dataset.tema);
        });
    });

    // Recuperar tema guardado

    const temaGuardado = localStorage.getItem("temaCalculadora");

    if (temaGuardado) {
        cambiarTema(temaGuardado);
    }

    // Cerrar menú al hacer click fuera

    document.addEventListener("click", evento => {

        if (
            temasMenu &&
            temaBtn &&
            !temasMenu.contains(evento.target) &&
            !temaBtn.contains(evento.target)
        ) {
            temasMenu.classList.remove("visible");
        }

    });
    
    // ========================================
    // TECLADO FÍSICO
    // ========================================

    document.addEventListener("keydown", evento => {

        const tecla = evento.key;

        // Números
        if (/^[0-9]$/.test(tecla)) {
            agregarNumero(tecla);
            return;
        }

        // Decimal
        if (tecla === ".") {
            agregarDecimal();
            return;
        }

        // Operadores
        if (["+", "-", "*", "/"].includes(tecla)) {
            elegirOperador(tecla);
            return;
        }

        // Igual
        if (tecla === "Enter" || tecla === "=") {
            evento.preventDefault();
            obtenerResultado();
            return;
        }

        // Borrar último número
        if (tecla === "Backspace") {
            evento.preventDefault();
            borrar();
            return;
        }

        // Limpiar
        if (tecla === "Escape") {
            limpiar();
            return;
        }

        // Porcentaje
        if (tecla === "%") {
            porcentaje();
            return;
        }
    });

    actualizarPantalla();

})();