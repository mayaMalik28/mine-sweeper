function setRandomMines(board, rowIdx, colIdx) {
    var locations = createLocations(board);
    locations = shuffle(locations);
    for (var i = 0; i < gLevel.mines; i++) {
        var mineLocation = locations.pop();
        if (mineLocation.i === rowIdx && mineLocation.j === colIdx) {
            i--
            continue;
        }
        board[mineLocation.i][mineLocation.j].isMine = true;
    }
    return board;
}

function showAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];

            if (cell.isShown) continue;
            if ((cell.isMarked && cell.isMine) || (!cell.isMarked && !cell.isMine)) continue;

            var cellSelector = '.' + getClassName(i, j);
            var elCell = document.querySelector(cellSelector);

            if (!elCell.classList.contains('show')) elCell.classList.add('show');
            if (cell.isMine) elCell.innerText = MINE;
            if (cell.isMarked) elCell.innerText = WRONGMARK;
        }
    }
}