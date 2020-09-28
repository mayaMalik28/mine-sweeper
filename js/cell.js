function setMineNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            cell.minesAroundCount = negsCount(board, i, j);
        }
    }
    return board;
}

function negsCount(board, rowIdx, colIdx) {
    var count = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx ||
                (j < 0 || j > board.length - 1)) continue;
            var cell = board[i][j];
            if (cell.isMine) count++;
        }
    }
    return count
}

function showCell(rowIdx, colIdx) {
    var cell = gBoard[rowIdx][colIdx];
    if (cell.isShown) return;
    //model
    gGame.shownCount++;
    cell.isShown = true;
    //dom
    var cellSelector = '.' + getClassName(rowIdx, colIdx);
    var elCell = document.querySelector(cellSelector);
    if (!elCell.classList.contains('show')) elCell.classList.add('show');
    if (cell.minesAroundCount === 0) {
        elCell.innerText = EMPTY;
        showNegsCells(rowIdx, colIdx);
    } else elCell.innerText = cell.minesAroundCount;
}

function showNegsCells(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx ||
                (j < 0 || j > gBoard.length - 1)) continue;
            var cell = gBoard[i][j];
            if (cell.isMine || cell.isMarked) continue;

            showCell(i, j);
        }
    }
}

function clickSafe() {
    // safe can't be used if the game hasn't stated (first click on the board/manual state)
    if (gGame.safe === 0 || !gGame.isOn) return;
    var safeCells = findSafeCells();
    var randIdx = getRandomInt(0, safeCells.length - 1);
    var rowIdx = safeCells[randIdx].i;
    var colIdx = safeCells[randIdx].j;

    var cellSelector = '.' + getClassName(rowIdx, colIdx);
    var elCell = document.querySelector(cellSelector);
    elCell.classList.add('safe');
    setTimeout(function() {
        elCell.classList.remove('safe')
    }, 2000);
    gGame.safe--;
    renderSafes();
}

function findSafeCells() {
    var safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            console.log(`gBoard[${i}][${j}].isShown`, gBoard[i][j].isShown);
            console.log(`gBoard[${i}][${j}].isMine`, gBoard[i][j].isMine);
            if (gBoard[i][j].isMine || gBoard[i][j].isShown) continue;
            console.log(gBoard[i][j]);
            safeCells.push({ i: i, j: j, });
        }
    }
    return safeCells;
}