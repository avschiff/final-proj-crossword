document.addEventListener("DOMContentLoaded", function () {

// crossword data with answers, starting positions, and directions
const crosswordData = {
    "1-across": { answer: "SMACK", row: 0, col: 0, direction: "across" },
    "2-across": { answer: "TABLE", row: 1, col: 0, direction: "across" },
    "3-across": { answer: "AMOUR", row: 2, col: 0, direction: "across" },
    "4-across": { answer: "RIVER", row: 3, col: 0, direction: "across" },
    "5-across": { answer: "SEEDY", row: 4, col: 0, direction: "across" },
    "1-down": { answer: "STARS", row: 0, col: 0, direction: "down" },
    "3-down": { answer: "ABOVE", row: 0, col: 2, direction: "down" },
    "5-down": { answer: "KERRY", row: 0, col: 4, direction: "down" },
    "4-down": { answer: "CLUED", row: 0, col: 3, direction: "down" },
    "2-down": { answer: "MAMIE", row: 0, col: 1, direction: "down" }
};

// function to create crossword grid
function createCrossword() {
    const crossword = document.getElementById('crossword');

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.maxLength = 1;
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.setAttribute('aria-label', `Crossword cell at row ${i + 1}, column ${j + 1}`); //added aria to combat issues within Axe and Wave accessibility checkers, help from copilot
            crossword.appendChild(cell);
        }
    }
}

// function to check answers
function checkAnswers() {
    let allCorrect = true;

    for (const key in crosswordData) {
        const { answer, row, col, direction } = crosswordData[key];

        for (let i = 0; i < answer.length; i++) {
            const cellRow = direction === "across" ? row : row + i;
            const cellCol = direction === "across" ? col + i : col;

            const cell = document.querySelector(
                `input[data-row="${cellRow}"][data-col="${cellCol}"]` // get the cell element based on calculated row and column, help from copilot
            );

            const userAnswer = cell ? cell.value.trim().toUpperCase() : "";

            if (cell) {
                cell.classList.remove('incorrect');
                if (userAnswer !== answer[i]) {
                    allCorrect = false;
                    if (userAnswer !== "") {
                        cell.classList.add('incorrect');
                    }
                }
            }
        }
    }

    // display message at end of crossword check
    const message = document.getElementById('message');
    message.textContent = allCorrect
        ? "Congratulations! All answers are correct!"
        : "Some answers are incorrect. Try again!";
}

// after typing a letter, focus moves to the next cell
let currentDirection = "across"; // track current direction for navigation

// prevent spaces from being entered in cells
document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('cell') && e.key === ' ') {
        e.preventDefault();
    }
});

// helper function to get next cell position based on current direction
function getNextPosition(row, col, direction) { // returns next row and column based on direction, edited with copilot
    let nextRow = row;
    let nextCol = col;
    if (direction === "across") {
        nextCol++;
        if (nextCol >= 5) {
            nextCol = 0;
            nextRow++;
            if (nextRow >= 5) nextRow = 0;
        }
    } else {
        nextRow++;
        if (nextRow >= 5) {
            nextRow = 0;
            nextCol++;
            if (nextCol >= 5) nextCol = 0;
        }
    }
    return { nextRow, nextCol };
}

document.addEventListener('input', function(e) {
    if (!e.target.classList.contains('cell')) return;

    let row = parseInt(e.target.dataset.row);
    let col = parseInt(e.target.dataset.col);

    let steps = 0;

    while (steps < 25) { // prevent infinite loop
        const next = getNextPosition(row, col, currentDirection);
        row = next.nextRow;
        col = next.nextCol;

        const nextCell = document.querySelector(
            `input[data-row="${row}"][data-col="${col}"]`
        );

        // if we find an empty cell → go there
        if (nextCell && nextCell.value === '') {
            nextCell.focus();
            return;
        }

        steps++;
    }

    // if no empty cell found, do nothing
});

// press enter to swap between across and down
document.addEventListener('keydown', function(e) {
    if (!e.target.classList.contains('cell')) return;
    if (e.key !== 'Enter') return;

    currentDirection = currentDirection === "across" ? "down" : "across"; // toggle direction, helped by copilot
    highlightLine(e.target);
    e.preventDefault();
});

// function to highlight current row or column based on direction
function highlightLine(cell) {
    //first clear all highlights that may exist
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('highlight')); // get current cell position, then highlight entire row or column based on current direction, help from copilot

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (currentDirection === "across") {
        // highlight entire row
        document.querySelectorAll(`input[data-row="${row}"]`).forEach(c => { // highlight entire row, help from copilot
            c.classList.add('highlight');
        });
    } else {
        // highlight entire column
        document.querySelectorAll(`input[data-col="${col}"]`).forEach(c => {
            c.classList.add('highlight');
        });
    }
}

// highlight on cell focus
document.addEventListener('focus', function(e) {
    if (!e.target.classList.contains('cell')) return;
    highlightLine(e.target);
}, true);

// backspace handling, delete previous cell if current is empty
document.addEventListener('keydown', function(e) {
    if (!e.target.classList.contains('cell')) return;
    if (e.key !== 'Backspace') return;

    if (e.target.value === '') {
        let row = parseInt(e.target.dataset.row);
        let col = parseInt(e.target.dataset.col);

        if (currentDirection === "across") {
            col--;
            if (col < 0) {
                col = 4;
                row--;
                if (row < 0) row = 4;
            }
        } else {
            row--;
            if (row < 0) {
                row = 4;
                col--;
                if (col < 0) col = 4;
            }
        }

        const prevCell = document.querySelector(
            `input[data-row="${row}"][data-col="${col}"]` // get the previous cell element based on calculated row and column, help from copilot
        );

        if (prevCell) {
            prevCell.value = '';
            prevCell.focus();
        }
    }
});

// arrow key navigation 
document.addEventListener('keydown', function(e) {
    if (!e.target.classList.contains('cell')) return;

    let row = parseInt(e.target.dataset.row);
    let col = parseInt(e.target.dataset.col);

    if (e.key === "ArrowRight") col++;
    else if (e.key === "ArrowLeft") col--;
    else if (e.key === "ArrowUp") row--;
    else if (e.key === "ArrowDown") row++;
    else return;

    const nextCell = document.querySelector(
        `input[data-row="${row}"][data-col="${col}"]`
    );

    if (nextCell) {
        nextCell.focus();
        e.preventDefault();
    }
});

// event listener for check answers button
document.getElementById('checkAnswers')
    .addEventListener('click', checkAnswers);

// initialize crossword on page load
createCrossword();
});

// I used GitHub Copilot to help with some of the more complex functions, such as finding the next empty cell in the current direction and handling navigation. 
// I have labeled some spots where I used Copilot to generate code, but I also made edits to that code to fit the specific needs of my crossword game. I did not
// label every single line that was generated by Copilot, but I did make sure to review and edit all of the code it generated to ensure it worked correctly and 
// fit with the overall structure of my project. I also added ARIA labels to the cells to improve accessibility, which was prompted by issues found in Axe and Wave 
// accessibility checkers.