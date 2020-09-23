'use strict'

const MINE = '💣';
const EMPTY = ' ';
const FLAG = '🚩'
const WRONGMARK = '❌'

var gTimer;
var gBoard;
var gLevels = [{ size: 4, mines: 2 }, { size: 8, mines: 12 }, { size: 12, mines: 30 }]
var gLevel = gLevels[0];
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
}

function init() {
    gGame.isOn = true
    gBoard = buildBoard();
    console.log('board:', gBoard);
    setRandomMines();
    setMineNegsCount();
    renderBoard();
    renderMinesToMark();
    var elSmily = document.querySelector('.smily');
    elSmily.innerText = '😃'
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = createCell();
        }
    }
    return board;
}

function createCell() {
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
    }
    return cell;
}

function setRandomMines() {
    var locations = createLocations();
    locations = shuffle(locations);
    for (var i = 0; i < gLevel.mines; i++) {
        var mineLocation = locations.pop();
        //model
        gBoard[mineLocation.i][mineLocation.j].isMine = true;
        //dom - no need - renders when I press on the cell
    }
}

function createLocations() {
    var nums = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            nums.push({ i: i, j: j });
        }
    }
    return nums
}

function setMineNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            cell.minesAroundCount = negsCount(gBoard, i, j);
        }
    }
}


function cellClicked(elCell, rowIdx, colIdx) {

    var cell = gBoard[rowIdx][colIdx];

    if (cell.isShown) return;
    if (cell.isMarked) return;
    if (!gGame.isOn) return;
    //not sure if I need it

    if (gGame.shownCount === 0) startTimer();
    if (cell.isMine) {
        elCell.classList.add('mine-steped');
        gameOver(elCell);
    } else {
        showCell(rowIdx, colIdx);
    }


    checkVictory();
}

function showCell(rowIdx, colIdx) {

    var cell = gBoard[rowIdx][colIdx];

    if (cell.isShown) return; //not sure if I need - check later
    gGame.shownCount++;

    //model
    cell.isShown = true;

    //dom
    var cellSelector = '.' + getClassName(rowIdx, colIdx);
    var elCell = document.querySelector(cellSelector);

    if (!elCell.classList.contains('show')) elCell.classList.add('show');
    if (cell.minesAroundCount === 0) {
        renderCell(elCell, EMPTY);
        showNegsCells(rowIdx, colIdx);
    } else renderCell(elCell, cell.minesAroundCount);
}



function checkVictory() {
    console.log('markcont', gGame.markedCount);
    if (!(gGame.markedCount === gLevel.mines)) return;
    if (!(gGame.shownCount === (gLevel.size ** 2) - gLevel.mines)) return;
    var elSmily = document.querySelector('.smily');
    elSmily.innerText = '😎'
    clearInterval(gTimer);
    gGame.isOn = false;
    //maybe add more
}

function gameOver() {
    console.log('game over');
    clearInterval(gTimer);
    gGame.isOn = false;
    var elSmily = document.querySelector('.smily');
    elSmily.innerText = '😵'
    showAllMines();
}

function showAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            console.log('show mines');

            if (cell.isShown) continue;
            if ((cell.isMarked && cell.isMine) || (!cell.isMarked && !cell.isMine)) continue;

            var cellSelector = '.' + getClassName(i, j);
            var elCell = document.querySelector(cellSelector);
            if (!elCell.classList.contains('show')) elCell.classList.add('show');
            if (cell.isMine) renderCell(elCell, MINE);
            if (cell.isMarked) renderCell(elCell, WRONGMARK);
        }
    }
}

function showNegsCells(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx ||
                (j < 0 || j > gBoard.length - 1)) continue;
            var cell = gBoard[i][j];
            if (cell.isMine) continue;

            showCell(i, j);
        }
    }
}

function markFlag(elCell, rowIdx, colIdx) {
    dissableRightClickMenu();
    var cell = gBoard[rowIdx][colIdx];
    if (cell.isShown) return;
    //model
    if (cell.isMarked) {
        renderCell(elCell, EMPTY);
        gGame.markedCount--;
    } else {
        renderCell(elCell, FLAG);
        gGame.markedCount++;
    }
    cell.isMarked = !cell.isMarked;
    renderMinesToMark();
}

function renderMinesToMark() {
    var elMark = document.querySelector('.count-mark ');
    console.log(elMark);
    elMark.innerText = gLevel.mines - gGame.markedCount;
}

function renderCell(elCell, value) {
    elCell.innerText = value;
}

function renderBoard() {
    var elBoard = document.querySelector('.board');
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            var cellClass = getClassName(i, j);
            if (currCell.isMine) cellClass += ' mine';
            else cellClass += ' not-mine';
            strHTML += `\t<td class="cell ${cellClass}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="markFlag(this, ${i}, ${j})">\n`;
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    elBoard.innerHTML = strHTML;
}

function chooseLevel(level) {
    //maybe change and specify acoording to 'easy'/'medium'/'hard';
    gLevel = gLevels[level - 1];
    init();
}

function startTimer() {
    var startTime = Date.now();
    gTimer = setInterval(function() {
        var currTime = (Date.now() - startTime) / 1000;
        var elTime = document.querySelector('.timer');
        // console.log(elTime);
        elTime.innerText = parseInt(currTime);
    }, 1000);
}

function getClassName(i, j) {
    var cellClass = `cell-${i}-${j}`;
    return cellClass;
}

// function showCell(rowIdx, colIdx) {

//     if (cell.isShown) return;
//     if (cell.isMarked) return;
//     if (!gGame.isOn) return;
//     if (gGame.shownCount === 1) startTimer();
//     gGame.shownCount++;

//     var cellSelector = '.' + getClassName(rowIdx, colIdx);
//     var elCell = document.querySelector(cellSelector)
//     var cell = gBoard[rowIdx][colIdx];

//     //model
//     cell.isShown = true;
//     //dom
//     if (!elCell.classList.contains('show')) elCell.classList.add('show');
//     if (cell.isMine) {
//         renderCell(elCell, MINE);
//         gameOver(elCell);
//     } else if (cell.minesAroundCount === 0) {
//         renderCell(elCell, EMPTY);
//         showNegsCells(rowIdx, colIdx);
//     } else renderCell(elCell, cell.minesAroundCount);

//     checkVictory();
// }