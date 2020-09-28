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

function clickPlaceMines() {
    // if ((gGame.shownCount > 0 || gGame.hints < gHintsCount) || (gGame.manualState.isOn && !gGame.manualState.isCurrentlySetting)) return;
    if (gGame.isOn) return;
    gGame.manualState.isOn = true;
    if (gGame.manualState.isCurrentlySetting) {
        if (gMinesPlaced !== gLevel.mines) return; //add some note that they need to fell all the mines
        gGame.isOn = true;
        gGame.manualState.isCurrentlySetting = false;
        gBoard = setMineNegsCount(gBoard);
        renderBoard();
    } else {
        gGame.manualState.isCurrentlySetting = true;
        gBoard = createMat();
        renderBoard();
    }
    renderPlaceMinesButton();
}

function togglePlaceMines(elCell, rowIdx, colIdx) {
    console.log('gMinesPlaced', gMinesPlaced);
    if (gBoard[rowIdx][colIdx].isMine) {
        gBoard[rowIdx][colIdx].isMine = false;
        gMinesPlaced--
        elCell.innerText = EMPTY;
    } else {
        if (gMinesPlaced === gLevel.mines) return;
        gBoard[rowIdx][colIdx].isMine = true;
        gMinesPlaced++
        elCell.innerText = MINE;
    }
    renderPlaceMinesButton();
    //the game won't start yet
    return;
}