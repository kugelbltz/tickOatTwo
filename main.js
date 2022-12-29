const howToCard = document.getElementById('how-to');
const modal = document.getElementById('modal');
const score = document.getElementById('score');
const newGameBtn = document.getElementById('new-game');
const gameWon = document.getElementById('game-won');
const boardSvg = document.getElementById('board-svg');
const winner = document.getElementById('winner');

const Player = {
    UNKNOWN:0,
    RED:1,
    BLUE:2
};

const regions = {
    "bottom-left": { "positionXY": { "x": 0, "y": 235.5 }, "positionIJ": { "i": 2, "j": 0 }},
    "bottom-right": { "positionXY": { "x": 235.5, "y": 235.5 }, "positionIJ": { "i": 2, "j": 2 }},
    "bottom": { "positionXY": { "x": 160.93, "y": 309.95 }, "positionIJ": { "i": 2, "j": 1 }},
    "center": { "positionXY": { "x": 157, "y": 157 }, "positionIJ": { "i": 1, "j": 1 }},
    "left": { "positionXY": { "x": 1, "y": 161.04 }, "positionIJ": { "i": 1, "j": 0 }},
    "right": { "positionXY": { "x": 309.95, "y": 160.93 }, "positionIJ": { "i": 1, "j": 2 }},
    "top-left": { "positionXY": { "x": 1, "y": 2 }, "positionIJ": { "i": 0, "j": 0 }},
    "top-right": { "positionXY": { "x": 235.5, "y": 0 }, "positionIJ": { "i": 0, "j": 2 }},
    "top": { "positionXY": { "x": 161.04, "y": 1 }, "positionIJ": { "i": 0, "j": 1 }}
}

const board = [
    [Player.UNKNOWN, Player.UNKNOWN, Player.UNKNOWN],
    [Player.UNKNOWN, Player.UNKNOWN, Player.UNKNOWN],
    [Player.UNKNOWN, Player.UNKNOWN, Player.UNKNOWN]
];

let lastI = -1;
let lastJ = -1;
let currentPlayer = Player.RED
let pause = false;
let playerRedScore = 0;
let playerBlueScore = 0;

let alertTimer;


function openHowTo()
{
    modal.style.display = "block";
    howToCard.style.display = 'flex';
}

function closeHowTo()
{
    howToCard.style.display = 'none';
    modal.style.display = 'none';
}

function newGame()
{
    lastI = -1;
    lastJ = -1;
    pause = false;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            board[i][j] = Player.UNKNOWN;
        }
    }

    gameWon.style.display = 'none';
    boardSvg.classList.toggle('disabled');

    const lines = document.querySelectorAll('line');
    for (let line of lines) {
        line.remove();
    }
}

window.onclick = function(event) {
    if (event.target == modal) {
        closeHowTo();
    }
}

function checkHasWon() {
    // Check col
    for (let i = 0; i < 3; i++) {
        if (board[i][0] + board[i][1] + board[i][2] === 9) {
            return true;
        }
    }

    // Check row
    for (let j = 0; j < 3; j++) {
        if (board[0][j] + board[1][j] + board[2][j] === 9) {
            return true;
        }
    }

    // Check diagonals
    return (board[0][0] + board[1][1] + board[2][2] === 9) || (board[0][2] + board[1][1] + board[2][0] === 9)
}

function displayAlert(message) {
    clearTimeout(alertTimer);

    const alert = document.getElementById('alert');

    alert.style.opacity = "100%";
    alert.innerText = message;

    alertTimer = setTimeout(() => {
        alert.style.opacity = "0%";
    }, 2000);
}

function regionClicked(event) {
    if (pause) { return; }

    // IJ coordinates of the clicked region
    const { i, j } = regions[event.target.id].positionIJ;

    if (lastI === i && lastJ === j)  {
        displayAlert('Cannot select the last played region')
        return;
    }

    if (board[i][j] === Player.BLUE + Player.RED) {
        displayAlert('The region is already filled')
        return;
    }

    if (board[i][j] === currentPlayer) {
        displayAlert('Cannot select the region again')
        return;
    }

    board[i][j] += currentPlayer;

    lastI = i;
    lastJ = j;

    // Draw line
    const svg = document.getElementById("board-svg");
    const svgns = "http://www.w3.org/2000/svg";
    let line = document.createElementNS(svgns, "line");
    line.setAttribute("stroke-width", "10px");
    line.setAttribute("stroke-linecap", "round");

    const cx = j * 138 + 100;
    const cy = i * 138 + 100;

    if (currentPlayer === Player.RED) {
        const x1 = cx - 30;
        const x2 = cx + 30;
        line.setAttribute("x1", x1.toString());
        line.setAttribute("x2", x2.toString());
        line.setAttribute("y1", cy.toString());
        line.setAttribute("y2", cy.toString());
        line.setAttribute("stroke", "var(--red)");

    }
    else {
        const y1 = cy - 30;
        const y2 = cy + 30;
        line.setAttribute("y1", y1.toString());
        line.setAttribute("y2", y2.toString());
        line.setAttribute("x1", cx.toString());
        line.setAttribute("x2", cx.toString());
        line.setAttribute("stroke", "var(--blue)");
    }

    svg.prepend(line);

    // Check winner
    if (checkHasWon()) {
        pause = true;

        if (currentPlayer === Player.BLUE) {
            winner.innerHTML = 'BLUE';
            winner.className = 'blue';
            playerBlueScore += 1;
        }
        else if (currentPlayer === Player.RED) {
            winner.innerHTML = 'RED';
            winner.className = 'red';
            playerRedScore += 1;
        }

        winner.style.fontSize = 'smaller';
        score.innerText = `${playerRedScore} - ${playerBlueScore}`;
        gameWon.style.display = 'flex';
        boardSvg.classList.toggle('disabled');
        
        return;
    }

    const currentPlayerElement = document.getElementById('current');
    currentPlayerElement.removeAttribute('id')

    if (currentPlayer === Player.RED) {
        currentPlayer = Player.BLUE;
        const player = document.getElementsByClassName('player blue')[0];
        player.setAttribute('id', 'current');

    } else if (currentPlayer === Player.BLUE) {
        currentPlayer = Player.RED;
        const player = document.getElementsByClassName('player red')[0];
        player.setAttribute('id', 'current');
    }
}

function drawBoard()
{
    for (let name of Object.keys(regions))
    {
        let {positionXY} = regions[name];
        const domElement = document.getElementById(name);
        domElement.addEventListener('click', regionClicked);
        domElement.style.transform = 'translate(' + positionXY.x + 'px, ' + positionXY.y + 'px)';
    }
}
