
"use strict";

// ============================================================
// MINIARCADE - GAME HUB
// ============================================================

const $ = (id) => document.getElementById(id);

let activeGame = "memory";

document.querySelectorAll(".game-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        activeGame = tab.dataset.game;

        document.querySelectorAll(".game-tab").forEach(b => {
            b.classList.toggle("active", b === tab);
        });

        document.querySelectorAll(".game-panel").forEach(p => {
            p.classList.toggle("active", p.id === activeGame);
        });
    });
});

// Fisher-Yates shuffle.
function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


// ============================================================
// 1. MEMORY GAME
// ============================================================

const memorySymbols = [
    "🍕", "🚀", "🐶", "⚽",
    "🍓", "🎸", "🌈", "⭐"
];

let memoryFirst = null;
let memoryBusy = false;
let memoryMoves = 0;
let memoryMatches = 0;
let memoryTimer = null;

function newMemory() {
    clearTimeout(memoryTimer);

    memoryFirst = null;
    memoryBusy = false;
    memoryMoves = 0;
    memoryMatches = 0;

    $("memoryMoves").textContent = "0";
    $("memoryPairs").textContent = "0 / 8";
    $("memoryMessage").textContent = "";

    const board = $("memoryBoard");
    board.innerHTML = "";

    const deck = shuffle([
        ...memorySymbols,
        ...memorySymbols
    ]);

    deck.forEach((symbol, index) => {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "memory-card";
        card.dataset.symbol = symbol;

        card.setAttribute(
            "aria-label",
            `Carta ${index + 1} escondida`
        );

        card.innerHTML = `
            <span class="inner">
                <span class="front">?</span>
                <span class="back">${symbol}</span>
            </span>
        `;

        card.addEventListener("click", () => flipMemory(card));

        board.appendChild(card);
    });
}

function flipMemory(card) {
    if (
        memoryBusy ||
        card.classList.contains("open") ||
        card.classList.contains("matched")
    ) {
        return;
    }

    card.classList.add("open");
    card.setAttribute("aria-label", "Carta " + card.dataset.symbol);

    if (memoryFirst === null) {
        memoryFirst = card;
        return;
    }

    const first = memoryFirst;
    const second = card;

    memoryFirst = null;
    memoryMoves++;

    $("memoryMoves").textContent = memoryMoves;

    if (first.dataset.symbol === second.dataset.symbol) {
        first.classList.add("matched");
        second.classList.add("matched");

        first.disabled = true;
        second.disabled = true;

        memoryMatches++;
        $("memoryPairs").textContent = `${memoryMatches} / 8`;

        if (memoryMatches === 8) {
            $("memoryMessage").textContent =
                `🎉 Parabéns! Encontraste todos os pares em ${memoryMoves} tentativas!`;
        }
    } else {
        memoryBusy = true;

        memoryTimer = setTimeout(() => {
            first.classList.remove("open");
            second.classList.remove("open");

            first.setAttribute("aria-label", "Carta escondida");
            second.setAttribute("aria-label", "Carta escondida");

            memoryBusy = false;
            memoryTimer = null;
        }, 900);
    }
}

$("memoryRestart").addEventListener("click", newMemory);


// ============================================================
// 2. SUDOKU
// ============================================================

// Three predefined puzzles with verified unique solutions.
// Digits are shuffled each time to create variations.

const sudokuPuzzles = {
    easy: {
        puzzle: [
            "530070000",
            "600195000",
            "098000060",
            "800060003",
            "400803001",
            "700020006",
            "060000280",
            "000419005",
            "000080079"
        ],
        solution: [
            "534678912",
            "672195348",
            "198342567",
            "859761423",
            "426853791",
            "713924856",
            "961537284",
            "287419635",
            "345286179"
        ]
    },

    medium: {
        puzzle: [
            "000260701",
            "680070090",
            "190004500",
            "820100040",
            "004602900",
            "050003028",
            "009300074",
            "040050036",
            "703018000"
        ],
        solution: [
            "435269781",
            "682571493",
            "197834562",
            "826195347",
            "374682915",
            "951743628",
            "519326874",
            "248957136",
            "763418259"
        ]
    },

    hard: {
        puzzle: [
            "000000907",
            "000420180",
            "000705026",
            "100904000",
            "050000040",
            "000507009",
            "920108000",
            "034059000",
            "507000000"
        ],
        solution: [
            "462831957",
            "795426183",
            "381795426",
            "173984265",
            "659312748",
            "248567319",
            "926178534",
            "834259671",
            "517643892"
        ]
    }
};

let sudokuValues = [];
let sudokuSolution = [];
let sudokuFixed = new Set();
let sudokuSelected = -1;
let sudokuShowErrors = false;

function newSudoku() {
    const difficulty = $("difficulty").value;
    const source = sudokuPuzzles[difficulty];

    const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    function transform(rows) {
        return rows.join("").split("").map(value => {
            const digit = Number(value);
            return digit === 0 ? 0 : digits[digit - 1];
        });
    }

    sudokuValues = transform(source.puzzle);
    sudokuSolution = transform(source.solution);

    sudokuFixed = new Set();

    sudokuValues.forEach((value, index) => {
        if (value !== 0) sudokuFixed.add(index);
    });

    sudokuSelected = sudokuValues.indexOf(0);
    sudokuShowErrors = false;

    $("sudokuMessage").textContent = "";

    const board = $("sudokuBoard");
    board.innerHTML = "";

    for (let index = 0; index < 81; index++) {
        const cell = document.createElement("button");

        cell.type = "button";
        cell.className = "sdk-cell";

        const row = Math.floor(index / 9);
        const col = index % 9;

        if (col === 2 || col === 5) {
            cell.classList.add("block-right");
        }

        if (row === 2 || row === 5) {
            cell.classList.add("block-bottom");
        }

        cell.addEventListener("click", () => {
            sudokuSelected = index;
            renderSudoku();
        });

        board.appendChild(cell);
    }

    renderSudoku();
}

function renderSudoku() {
    const cells = $("sudokuBoard").children;

    for (let i = 0; i < 81; i++) {
        const cell = cells[i];
        const value = sudokuValues[i];

        cell.textContent = value || "";

        cell.classList.toggle("fixed", sudokuFixed.has(i));
        cell.classList.toggle("selected", sudokuSelected === i);

        cell.classList.toggle(
            "wrong",
            sudokuShowErrors &&
            value !== 0 &&
            value !== sudokuSolution[i]
        );

        const row = Math.floor(i / 9) + 1;
        const col = (i % 9) + 1;

        cell.setAttribute(
            "aria-label",
            `Linha ${row}, coluna ${col}: ${value || "vazia"}`
        );
    }
}

function enterSudoku(value) {
    const i = sudokuSelected;

    if (i < 0 || sudokuFixed.has(i)) {
        $("sudokuMessage").textContent =
            "Seleciona primeiro uma casa que possas alterar.";
        return;
    }

    sudokuValues[i] = value;
    sudokuShowErrors = false;

    renderSudoku();

    if (sudokuValues.every(
        (digit, index) => digit === sudokuSolution[index]
    )) {
        $("sudokuMessage").textContent =
            "🎉 Parabéns! Resolveste o Sudoku!";
    } else {
        $("sudokuMessage").textContent = "";
    }
}

function checkSudoku() {
    let wrong = 0;
    let empty = 0;

    sudokuValues.forEach((value, index) => {
        if (value === 0) {
            empty++;
        } else if (value !== sudokuSolution[index]) {
            wrong++;
        }
    });

    sudokuShowErrors = true;
    renderSudoku();

    if (wrong > 0) {
        $("sudokuMessage").textContent =
            `Existem ${wrong} números incorretos.`;
    } else if (empty > 0) {
        $("sudokuMessage").textContent =
            `Tudo correto até agora! Faltam ${empty} casas.`;
    } else {
        $("sudokuMessage").textContent =
            "🎉 Sudoku resolvido! Muito bem!";
    }
}

function sudokuHint() {
    let index = sudokuSelected;

    if (
        index < 0 ||
        sudokuFixed.has(index) ||
        sudokuValues[index] === sudokuSolution[index]
    ) {
        index = sudokuValues.findIndex(
            (v, i) => v !== sudokuSolution[i]
        );
    }

    if (index === -1) {
        $("sudokuMessage").textContent =
            "Já resolveste o Sudoku!";
        return;
    }

    sudokuValues[index] = sudokuSolution[index];
    sudokuFixed.add(index);
    sudokuSelected = index;
    sudokuShowErrors = false;

    renderSudoku();

    $("sudokuMessage").textContent =
        "💡 Esta casa foi preenchida corretamente.";
}

const pad = $("numberPad");

for (let n = 1; n <= 9; n++) {
    const btn = document.createElement("button");

    btn.type = "button";
    btn.textContent = n;

    btn.addEventListener("click", () => enterSudoku(n));
    pad.appendChild(btn);
}

document.addEventListener("keydown", event => {
    if (activeGame !== "sudoku") return;

    if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSelectElement
    ) {
        return;
    }

    if (/^[1-9]$/.test(event.key)) {
        enterSudoku(Number(event.key));
    } else if (
        event.key === "Backspace" ||
        event.key === "Delete" ||
        event.key === "0"
    ) {
        event.preventDefault();
        enterSudoku(0);
    }
});

$("sudokuRestart").addEventListener("click", newSudoku);
$("difficulty").addEventListener("change", newSudoku);
$("sudokuErase").addEventListener("click", () => enterSudoku(0));
$("sudokuHint").addEventListener("click", sudokuHint);
$("sudokuCheck").addEventListener("click", checkSudoku);


// ============================================================
// 3. HANGMAN
// ============================================================

const hangmanWords = [
    { word: "ELEFANTE", hint: "Animal" },
    { word: "PORTUGAL", hint: "País" },
    { word: "COMPUTADOR", hint: "Tecnologia" },
    { word: "CHOCOLATE", hint: "Alimentação" },
    { word: "GUITARRA", hint: "Instrumento musical" },
    { word: "HOSPITAL", hint: "Local" },
    { word: "PLANETA", hint: "Espaço" },
    { word: "BICICLETA", hint: "Transporte" },
    { word: "DINOSSAURO", hint: "Animal pré-histórico" },
    { word: "FUTEBOL", hint: "Desporto" },
    { word: "BIBLIOTECA", hint: "Local" },
    { word: "MONTANHA", hint: "Natureza" }
];

let hangmanCurrent = null;
let hangmanGuessed = new Set();
let hangmanMistakes = 0;
let hangmanFinished = false;

function newHangman() {
    let options = hangmanWords.filter(
        item => item !== hangmanCurrent
    );

    hangmanCurrent =
        options[Math.floor(Math.random() * options.length)];

    hangmanGuessed = new Set();
    hangmanMistakes = 0;
    hangmanFinished = false;

    $("hangmanHint").textContent = hangmanCurrent.hint;
    $("hangmanMessage").textContent = "";

    const keyboard = $("hangmanLetters");
    keyboard.innerHTML = "";

    for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
        const btn = document.createElement("button");

        btn.type = "button";
        btn.textContent = letter;

        btn.addEventListener("click", () => {
            guessLetter(letter);
        });

        keyboard.appendChild(btn);
    }

    renderHangman();
}

function guessLetter(letter) {
    if (hangmanFinished || hangmanGuessed.has(letter)) return;

    hangmanGuessed.add(letter);

    if (!hangmanCurrent.word.includes(letter)) {
        hangmanMistakes++;
    }

    const won = [...hangmanCurrent.word].every(
        letter => hangmanGuessed.has(letter)
    );

    const lost = hangmanMistakes >= 6;

    if (won || lost) {
        hangmanFinished = true;

        $("hangmanMessage").textContent = won
            ? "🎉 Parabéns! Descobriste a palavra!"
            : `Fim do jogo! A palavra era ${hangmanCurrent.word}.`;
    }

    renderHangman();
}

function renderHangman() {
    $("hangmanErrors").textContent =
        `Erros: ${hangmanMistakes} / 6`;

    const wordBox = $("hangmanWord");
    wordBox.innerHTML = "";

    for (const letter of hangmanCurrent.word) {
        const span = document.createElement("span");

        span.textContent =
            hangmanGuessed.has(letter) || hangmanFinished
                ? letter
                : "";

        wordBox.appendChild(span);
    }

    document.querySelectorAll(".body-part").forEach(
        (part, index) => {
            part.classList.toggle(
                "visible",
                index < hangmanMistakes
            );
        }
    );

    $("hangmanLetters").querySelectorAll("button").forEach(btn => {
        btn.disabled =
            hangmanFinished ||
            hangmanGuessed.has(btn.textContent);
    });
}

$("hangmanRestart").addEventListener("click", newHangman);


// ============================================================
// 4. TIC TAC TOE
// ============================================================

const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

let tttCells = Array(9).fill("");
let tttWaiting = false;
let tttEnded = false;
let tttTimer = null;

const tttScore = {
    X: 0,
    O: 0,
    draws: 0
};

function newTtt() {
    clearTimeout(tttTimer);

    tttCells = Array(9).fill("");
    tttWaiting = false;
    tttEnded = false;

    $("tttMessage").textContent = "A tua vez!";

    renderTtt();
}

function tttResult(board) {
    for (const line of winningLines) {
        const [a, b, c] = line;

        if (
            board[a] &&
            board[a] === board[b] &&
            board[b] === board[c]
        ) {
            return { winner: board[a], line };
        }
    }

    if (board.every(cell => cell !== "")) {
        return { winner: "draw", line: [] };
    }

    return null;
}

function renderTtt() {
    const board = $("tttBoard");
    board.innerHTML = "";

    const result = tttResult(tttCells);

    tttCells.forEach((value, index) => {
        const btn = document.createElement("button");

        btn.type = "button";
        btn.className = "ttt-cell";
        btn.textContent = value;

        if (value === "O") btn.classList.add("o");

        if (
            result &&
            result.line.includes(index)
        ) {
            btn.classList.add("win");
        }

        btn.disabled = Boolean(value) || tttWaiting || tttEnded;

        btn.setAttribute(
            "aria-label",
            `Casa ${index + 1}: ${value || "vazia"}`
        );

        btn.addEventListener("click", () => playerTtt(index));

        board.appendChild(btn);
    });

    $("tttPlayer").textContent = tttScore.X;
    $("tttComputer").textContent = tttScore.O;
    $("tttDraws").textContent = tttScore.draws;
}

function finishTtt() {
    const result = tttResult(tttCells);

    if (!result) return false;

    tttEnded = true;
    tttWaiting = false;

    if (result.winner === "X") {
        tttScore.X++;
        $("tttMessage").textContent = "🎉 Ganhaste!";
    } else if (result.winner === "O") {
        tttScore.O++;
        $("tttMessage").textContent = "O computador ganhou!";
    } else {
        tttScore.draws++;
        $("tttMessage").textContent = "Empate!";
    }

    renderTtt();
    return true;
}

function playerTtt(index) {
    if (tttCells[index] || tttWaiting || tttEnded) return;

    tttCells[index] = "X";

    if (finishTtt()) return;

    tttWaiting = true;

    $("tttMessage").textContent = "Computador a pensar...";
    renderTtt();

    tttTimer = setTimeout(() => {
        const index = chooseComputerMove();

        if (index !== -1) {
            tttCells[index] = "O";
        }

        tttWaiting = false;

        if (!finishTtt()) {
            $("tttMessage").textContent = "A tua vez!";
            renderTtt();
        }
    }, 450);
}

function findWinningMove(symbol) {
    for (const line of winningLines) {
        const empty = line.filter(i => tttCells[i] === "");
        const marks = line.filter(i => tttCells[i] === symbol);

        if (marks.length === 2 && empty.length === 1) {
            return empty[0];
        }
    }

    return -1;
}

function chooseComputerMove() {
    // Win when possible.
    let move = findWinningMove("O");
    if (move !== -1) return move;

    // Block the player's immediate win.
    move = findWinningMove("X");
    if (move !== -1) return move;

    // Prefer the centre.
    if (tttCells[4] === "") return 4;

    // Otherwise, choose a random available corner.
    const corners = shuffle([0, 2, 6, 8]).filter(
        i => tttCells[i] === ""
    );

    if (corners.length) return corners[0];

    // Finally, choose any free square.
    const free = tttCells
        .map((value, i) => value === "" ? i : -1)
        .filter(i => i !== -1);

    return free.length
        ? free[Math.floor(Math.random() * free.length)]
        : -1;
}

$("tttRestart").addEventListener("click", newTtt);


// ============================================================
// 5. ROCK PAPER SCISSORS
// ============================================================

const rpsChoices = ["pedra", "papel", "tesoura"];

const rpsEmoji = {
    pedra: "✊",
    papel: "✋",
    tesoura: "✌️"
};

let rpsWins = 0;
let rpsLosses = 0;
let rpsDraws = 0;

function playRps(player) {
    const computer =
        rpsChoices[Math.floor(Math.random() * 3)];

    let result;

    if (player === computer) {
        rpsDraws++;
        result = "Empate!";
    } else if (
        (player === "pedra" && computer === "tesoura") ||
        (player === "papel" && computer === "pedra") ||
        (player === "tesoura" && computer === "papel")
    ) {
        rpsWins++;
        result = "🎉 Ganhaste!";
    } else {
        rpsLosses++;
        result = "O computador ganhou!";
    }

    $("rpsWins").textContent = rpsWins;
    $("rpsLosses").textContent = rpsLosses;
    $("rpsDraws").textContent = rpsDraws;

    $("rpsResult").textContent =
        `${rpsEmoji[player]} vs ${rpsEmoji[computer]} — ${result}`;
}

document.querySelectorAll(".rps-choice").forEach(btn => {
    btn.addEventListener("click", () => {
        playRps(btn.dataset.choice);
    });
});

$("rpsRestart").addEventListener("click", () => {
    rpsWins = 0;
    rpsLosses = 0;
    rpsDraws = 0;

    $("rpsWins").textContent = "0";
    $("rpsLosses").textContent = "0";
    $("rpsDraws").textContent = "0";

    $("rpsResult").textContent = "Faz a tua escolha!";
});


// ============================================================
// INITIALISE ALL GAMES
// ============================================================

newMemory();
newSudoku();
newHangman();
newTtt();
