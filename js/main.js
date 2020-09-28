'use strict'

const MINE = '💣';
const EMPTY = ' ';
const FLAG = '🚩'
const WRONGMARK = '❌'
const SMILY = '😃';
const GAMEOVER = '😵';
const VICTORY = '😎';
const LIVE = '❤';
const OVER = '✖';
const HINT = '❔';
const USEDHINT = '❓';

var gTimer;
var gLivesCount;
var gHintsCount;
var gSafeCount;
var gBoard;
var gGame;
var gLevels = [{ level: 'easy', size: 4, mines: 2 }, { level: 'medium', size: 8, mines: 12 }, { level: 'hard', size: 12, mines: 30 }]
var gLevel = gLevels[0];
var gMinesPlaced;

function init() {
    resetGame();
    gBoard = createMat();
    renderBoard();
    renderMinesToMark();
    renderLives();
    renderHints();
    renderSafes();
    renderPlaceMinesButton();
    renderExistsScore();
}

function resetGame() {
    if (gTimer) clearInterval(gTimer);
    gLivesCount = 3;
    gHintsCount = 3;
    gSafeCount = 3;
    gMinesPlaced = 0;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: gLivesCount,
        hints: gHintsCount,
        safe: gSafeCount,
        isHint: false,
        manualState: {
            isOn: false,
            isCurrentlySetting: false
        }
    }
    var elSmily = document.querySelector('.smily');
    elSmily.innerText = SMILY;
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = '000'
}

function chooseLevel(level) {
    //maybe change and specify acoording to 'easy'/'medium'/'hard';
    gLevel = gLevels[level - 1];
    init();
}

function buildBoard(rowIdx, colIdx) {
    var board = createMat();
    board = setRandomMines(board, rowIdx, colIdx);
    board = setMineNegsCount(board);
    return board;
}

function createMat() {
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


function cellClicked(elCell, rowIdx, colIdx) {
    //if the user is placing mines:
    if (gGame.manualState.isCurrentlySetting) {
        togglePlaceMines(elCell, rowIdx, colIdx);
        return;
    }
    // the game starts only with the first press on the board
    //in manual state - the game is on after mines were placed, time starts after first cell is shown
    if (gGame.shownCount === 0 && !gGame.isHint) {
        // the board will be created only if mines were not placed
        if (!gGame.manualState.isOn) {
            gBoard = buildBoard(rowIdx, colIdx);
            renderBoard();
        }
        gGame.isOn = true;
        startTimer();
        renderPlaceMinesButton();
        renderSafes();
        renderHints();
    }

    var cell = gBoard[rowIdx][colIdx];
    if (cell.isShown) return;
    if (cell.isMarked) return;
    if (!gGame.isOn) return;

    if (gGame.isHint) {
        toggleHint(rowIdx, colIdx);
        setTimeout(function() {
            toggleHint(rowIdx, colIdx)
            gGame.isHint = false;
            gGame.hints--;
            renderHints();
        }, 500);
        return;
    }

    if (cell.isMine) {
        elCell.classList.add('mine-steped');
        elCell.innerText = MINE;
        gGame.lives--;
        renderLives();
        if (gGame.lives > 0) {
            setTimeout(function() {
                elCell.classList.remove('mine-steped')
                elCell.innerText = EMPTY;
            }, 500);
        } else if (gGame.lives === 0) {
            gameOver(elCell);
        }
    } else {
        showCell(rowIdx, colIdx);
        checkVictory();
    }
}

function startTimer() {
    var startTime = Date.now();
    gTimer = setInterval(function() {
        gGame.secsPassed = parseInt((Date.now() - startTime) / 1000);
        var elTime = document.querySelector('.timer');
        elTime.innerText = (gGame.secsPassed);
    }, 1000);
}

function clickHint(elHint) {
    // hint can't be used if the game hasn't stated (first click on the board/manual state)
    if (!gGame.isOn) return;
    elHint.innerText = USEDHINT;
    gGame.isHint = true;
}

function toggleHint(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue;
            var cell = gBoard[i][j];
            var cellSelector = '.' + getClassName(i, j);
            var elCell = document.querySelector(cellSelector);

            if (cell.isShown) continue;
            if (!elCell.classList.contains('show')) {
                elCell.classList.add('show');
                if (cell.isMine) elCell.innerText = MINE;
                else if (cell.minesAroundCount === 0) elCell.innerText = EMPTY;
                else elCell.innerText = cell.minesAroundCount;
            } else {
                elCell.classList.remove('show');
                elCell.innerText = (cell.isMarked) ? FLAG : EMPTY;
            }

        }
    }
}

function checkVictory() {
    if ((gGame.markedCount !== gLevel.mines) || (gGame.shownCount !== ((gLevel.size ** 2) - gLevel.mines))) return;
    var elSmily = document.querySelector('.smily');
    elSmily.innerText = VICTORY;
    clearInterval(gTimer);
    gGame.isOn = false;
    gGame.manualState.isOn = false;
    setTimeout(checkScore, 300);
}

function checkScore() {
    var level = gLevel.level;
    //check if time
    var time = localStorage.getItem(`time${level}`)
    if (time && gGame.secsPassed >= time) return;
    //if not, and the time is smaller than the last record - storage the name and the time
    var name = prompt('well Done! you are the best! anter your name please:');
    localStorage.setItem(`time${level}`, gGame.secsPassed + '');
    localStorage.setItem(`name${level}`, name);
    //dom
    renderScore(level)
}

function gameOver() {
    clearInterval(gTimer);
    gGame.isOn = false;
    gGame.manualState.isOn = false;
    var elSmily = document.querySelector('.smily');
    elSmily.innerText = GAMEOVER
    showAllMines();
}

function markCell(elCell, rowIdx, colIdx) {
    dissableRightClickMenu();
    if (!gGame.isOn) return;
    // can't start with marking - only with manual mine place
    var cell = gBoard[rowIdx][colIdx];
    if (cell.isShown) return;
    //model
    if (cell.isMarked) {
        elCell.innerText = EMPTY;
        gGame.markedCount--;
    } else {
        elCell.innerText = FLAG;
        gGame.markedCount++;
    }
    cell.isMarked = !cell.isMarked;
    renderMinesToMark();
    checkVictory();
}

function renderMinesToMark() {
    var elMark = document.querySelector('.count-mark ');
    elMark.innerText = gLevel.mines - gGame.markedCount;
}

function renderBoard() {
    //is it OK that it works directly on gBoard? (yes - but it would help wuth the undo to out the board as a parameter)
    var elBoard = document.querySelector('.board');
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            var cellClass = getClassName(i, j);
            if (gGame.manualState.isCurrentlySetting) {
                strHTML += `\t<td class="cell ${cellClass} show" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="markCell(this, ${i}, ${j})">\n`;
                strHTML += '\t</td>\n';
                continue;
            }
            if (currCell.isMine) cellClass += ' mine';
            else cellClass += ' not-mine';
            strHTML += `\t<td class="cell ${cellClass}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="markCell(this, ${i}, ${j})">\n`;
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    elBoard.innerHTML = strHTML;
}

function renderExistsScore() {
    for (var i = 0; i < gLevels.length; i++) {
        var level = gLevels[i].level;
        var time = localStorage.getItem(`time${level}`);
        if (!time) return;
        renderScore(level)
    }
}

function renderScore(level) {
    var strHTML = `Level: ${level} | `
    strHTML += `Name: ${localStorage.getItem(`name${level}`)} | `
    strHTML += `Time: ${localStorage.getItem(`time${level}`)}`
    var elLevel = document.querySelector('.' + level);
    elLevel.innerHTML = strHTML;
}

function renderLives() {
    var elLives = document.querySelector('.lives');
    var strHTML = ''
    if (!gGame.isOn){
        if (elLives.classList.contains('over')) elLives.classList.remove('over');
    }
    for (var i = 0; i < gGame.lives; i++) {
        strHTML += LIVE + ' ';
    }
    for (var i = 0; i < gLivesCount - gGame.lives; i++) {
        strHTML += OVER + ' ';
    }
    if (gGame.lives === 0) elLives.classList.add('over');
    elLives.innerText = strHTML
}

function renderHints() {
    var elHint = document.querySelector('.hints');
    var strHTML = ''
    if (!gGame.isOn){
        if (elHint.classList.contains('over')) elHint.classList.remove('over');
    }
    for (var i = 0; i < gGame.hints - 1; i++) {
        strHTML += `<div class="hint">${HINT} </div>`
    }
    if (gGame.hints !== 0){
        if (!gGame.isOn){
            strHTML += `<div class="hint" onclick="clickHint(this,${i})">${HINT} </div>`
        }
        else{
            strHTML += `<div class="hint hint-to-press" onclick="clickHint(this,${i})">${HINT} </div>`
        }
    } 
    for (var i = 0; i < gHintsCount - gGame.hints; i++) {
        strHTML += `<div class="hint">${OVER} </div>`;
    }
    if (gGame.hints === 0) elHint.classList.add('over');
    elHint.innerHTML = strHTML
}

function renderSafes(){
    var elsafe = document.querySelector('.safe-click');
    var strHTML = `safe clicks: ${gGame.safe}`
    elsafe.innerText = strHTML
    if (elsafe.classList.contains('over')) elsafe.classList.remove('over');
    if (gGame.safe === 0 || !gGame.isOn) elsafe.classList.add('over');
}

function renderPlaceMinesButton(){
    var elPlaceMines = document.querySelector('.place-mines');

    if (!gGame.manualState.isOn){
        if (gGame.isOn){
            elPlaceMines.classList.add('over');
            elPlaceMines.innerText = 'Place Mines Manually';
            return
        }else{
            if (elPlaceMines.classList.contains('over')) elPlaceMines.classList.remove('over');
            if (elPlaceMines.classList.contains('manually-game')) elPlaceMines.classList.remove('manually-game');
            return;
        }
    }
    if (gGame.manualState.isCurrentlySetting){
        elPlaceMines.innerText = (gLevel.mines === gMinesPlaced) ? `Press to start game` : `Mine to place: ${gLevel.mines - gMinesPlaced}`;
    } else{
        elPlaceMines.innerText = 'Mines were placed Manually';
        elPlaceMines.classList.add('manually-game');
        renderHints();
        renderSafes();
    }

}

function getClassName(i, j) {
    var cellClass = `cell-${i}-${j}`;
    return cellClass;
}