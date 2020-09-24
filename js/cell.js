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
    if (cell.isShown) return; //not sure if I need - check later
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