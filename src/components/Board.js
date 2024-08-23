import React, { useState} from 'react';

export default function Board() {
  const pieces = {
    'r': 'BlackRook.png',
    'n': 'BlackKnight.png',
    'b': 'BlackBishop.png',
    'q': 'BlackQueen.png',
    'k': 'BlackKing.png',
    'p': 'BlackPawn.png',
    'R': 'WhiteRook.png',
    'N': 'WhiteKnight.png',
    'B': 'WhiteBishop.png',
    'Q': 'WhiteQueen.png',
    'K': 'WhiteKing.png',
    'P': 'WhitePawn.png'
  };

  const initialBoard = [
    'rnbqkbnr',
    'pppppppp',
    '        ',
    '        ',
    '        ',
    '        ',
    'PPPPPPPP',
    'RNBQKBNR'
  ];

  const [board, setBoard] = useState(initialBoard);
  const [currentTurn, setCurrentTurn] = useState('white');
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [gameState, setGameState] = useState('stopped'); // 'stopped', 'running', 'paused'
  const [history, setHistory] = useState([]); // Store board states to enable undo

  const handleSquareClick = (rowIndex, colIndex) => {
    if (gameState !== 'running') return;

    if (selectedPiece) {
      const { row: startRow, col: startCol } = selectedPiece;
      const piece = board[startRow][startCol];
      if (isValidMove(piece, startRow, startCol, rowIndex, colIndex)) {
        const newBoard = board.map(row => row.split(''));
        newBoard[startRow][startCol] = ' ';
        newBoard[rowIndex][colIndex] = piece;
        setHistory([...history, board]); // Save board state for undo
        setBoard(newBoard.map(row => row.join('')));
        setCurrentTurn(currentTurn === 'white' ? 'black' : 'white');
        setSelectedPiece(null);
      } else {
        setSelectedPiece(null); // Deselect if move is invalid
      }
    } else {
      const piece = board[rowIndex][colIndex];
      if (piece !== ' ') {
        const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
        if (pieceColor === currentTurn) {
          setSelectedPiece({ row: rowIndex, col: colIndex });
        }
      }
    }
  };

  const handleDragStart = (event, rowIndex, colIndex) => {
    if (gameState !== 'running') return;

    event.dataTransfer.setData('piece', JSON.stringify({ rowIndex, colIndex }));
    setSelectedPiece(null);
  };

  const handleDrop = (event, targetRow, targetCol) => {
    if (gameState !== 'running') return;

    event.preventDefault();
    const data = event.dataTransfer.getData('piece');
    const { rowIndex, colIndex } = JSON.parse(data);

    const piece = board[rowIndex][colIndex];
    if (isValidMove(piece, rowIndex, colIndex, targetRow, targetCol)) {
      const newBoard = board.map(row => row.split(''));
      newBoard[rowIndex][colIndex] = ' ';
      newBoard[targetRow][targetCol] = piece;
      setHistory([...history, board]); // Save board state for undo
      setBoard(newBoard.map(row => row.join('')));
      setCurrentTurn(currentTurn === 'white' ? 'black' : 'white');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const isValidMove = (piece, startRow, startCol, endRow, endCol) => {
    const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
    if (pieceColor !== currentTurn) return false; // It's not this piece's turn

    switch (piece.toLowerCase()) {
      case 'p': // Pawn
        return validatePawnMove(piece, startRow, startCol, endRow, endCol);
      case 'r': // Rook
        return validateRookMove(startRow, startCol, endRow, endCol);
      case 'n': // Knight
        return validateKnightMove(startRow, startCol, endRow, endCol);
      case 'b': // Bishop
        return validateBishopMove(startRow, startCol, endRow, endCol);
      case 'q': // Queen
        return validateQueenMove(startRow, startCol, endRow, endCol);
      case 'k': // King
        return validateKingMove(startRow, startCol, endRow, endCol);
      default:
        return false;
    }
  };

  const validatePawnMove = (piece, startRow, startCol, endRow, endCol) => {
    const direction = piece === 'P' ? -1 : 1; // White pawns move up (-1), black pawns move down (1)
    const startRowIndex = piece === 'P' ? 6 : 1; // White pawns start on row 6, black on row 1

    if (startCol === endCol && board[endRow][endCol] === ' ') {
        if (startRow + direction === endRow) return true;
        if (startRow === startRowIndex && startRow + 2 * direction === endRow && board[startRow + direction][startCol] === ' ') return true;
    }

    if (Math.abs(startCol - endCol) === 1 && startRow + direction === endRow) {
        const targetPiece = board[endRow][endCol];
        if (targetPiece !== ' ' && (piece === 'P' ? targetPiece.toLowerCase() === targetPiece : targetPiece.toUpperCase() === targetPiece)) {
            return true;
        }
    }

    return false;
  };

  const validateRookMove = (startRow, startCol, endRow, endCol) => {
    if (startRow !== endRow && startCol !== endCol) return false; // Must move in a straight line
    return isPathClear(startRow, startCol, endRow, endCol);
  };

  const validateKnightMove = (startRow, startCol, endRow, endCol) => {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  };

  const validateBishopMove = (startRow, startCol, endRow, endCol) => {
    if (Math.abs(startRow - endRow) !== Math.abs(startCol - endCol)) return false; // Must move diagonally
    return isPathClear(startRow, startCol, endRow, endCol);
  };

  const validateQueenMove = (startRow, startCol, endRow, endCol) => {
    return validateRookMove(startRow, startCol, endRow, endCol) || validateBishopMove(startRow, startCol, endRow, endCol);
  };

  const validateKingMove = (startRow, startCol, endRow, endCol) => {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);
    return rowDiff <= 1 && colDiff <= 1;
  };

  const isPathClear = (startRow, startCol, endRow, endCol) => {
    let rowStep = startRow < endRow ? 1 : (startRow > endRow ? -1 : 0);
    let colStep = startCol < endCol ? 1 : (startCol > endCol ? -1 : 0);

    let row = startRow + rowStep;
    let col = startCol + colStep;
    
    while (row !== endRow || col !== endCol) {
      if (board[row][col] !== ' ') return false;
      row += rowStep;
      col += colStep;
    }
    return true;
  };

  // Game control functions
  const handleStart = () => {
    setGameState('running');
    setBoard(initialBoard);
    setHistory([]);
    setCurrentTurn('white');
  };

  const handleStop = () => {
    setGameState('stopped');
    setSelectedPiece(null);
  };

  const handlePause = () => {
    if (gameState === 'running') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('running');
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousBoard = history.pop();
      setBoard(previousBoard);
      setHistory([...history]);
      setCurrentTurn(currentTurn === 'white' ? 'black' : 'white');
    }
  };

  return (
    <div>
      <div className="turn-indicator">
        <h2>{currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}'s Turn</h2>
      </div>
      <div className="controls">
        <button onClick={handleStart} disabled={gameState === 'running'}>Start</button>
        <button onClick={handleStop} className="stop" disabled={gameState === 'stopped'}>Stop</button>
        <button onClick={handlePause} disabled={gameState === 'stopped'}>
            {gameState === 'paused' ? 'Resume' : 'Pause'}
        </button>
        <button onClick={handleUndo} disabled={history.length === 0 || gameState !== 'running'}>Undo</button>
        </div>
      <div className="chessboard">
        {board.map((row, rowIndex) => (
          row.split('').map((piece, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`square ${(rowIndex + colIndex) % 2 === 0 ? 'white' : 'black'} ${selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex ? 'selected' : ''}`}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
              onDrop={(event) => handleDrop(event, rowIndex, colIndex)}
              onDragOver={handleDragOver}
            >
              {piece !== ' ' && (
                <img
                  src={`images/${pieces[piece]}`}
                  alt={piece}
                  draggable={gameState === 'running'}
                  onDragStart={(event) => handleDragStart(event, rowIndex, colIndex)}
                />
              )}
            </div>
          ))
        ))}
      </div>
    </div>
  );
}
