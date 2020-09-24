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