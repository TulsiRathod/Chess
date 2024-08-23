import React, { useState } from 'react';

function TimeSettingsModal({ show, onClose, onSave }) {
  const [timeInMinutes, setTimeInMinutes] = useState('5');
  const [incrementInSeconds, setIncrementInSeconds] = useState('1');

  const handleSubmit = () => {
    if (timeInMinutes && incrementInSeconds) {
      onSave(parseInt(timeInMinutes, 10), parseInt(incrementInSeconds, 10));
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Set Game Time</h2>
        <div>
          <label>Total Time (minutes): </label>
          <input
            type="number"
            value={timeInMinutes}
            onChange={(e) => setTimeInMinutes(e.target.value)}
          />
        </div>
        <div>
          <label>Increment per Move (seconds): </label>
          <input
            type="number"
            value={incrementInSeconds}
            onChange={(e) => setIncrementInSeconds(e.target.value)}
          />
        </div>
        <button onClick={handleSubmit}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default function Board() {
  const pieces = {
    r: 'BlackRook.png',
    n: 'BlackKnight.png',
    b: 'BlackBishop.png',
    q: 'BlackQueen.png',
    k: 'BlackKing.png',
    p: 'BlackPawn.png',
    R: 'WhiteRook.png',
    N: 'WhiteKnight.png',
    B: 'WhiteBishop.png',
    Q: 'WhiteQueen.png',
    K: 'WhiteKing.png',
    P: 'WhitePawn.png',
  };

  const initialBoard = [
    'rnbqkbnr',
    'pppppppp',
    '        ',
    '        ',
    '        ',
    '        ',
    'PPPPPPPP',
    'RNBQKBNR',
  ];

  const [board, setBoard] = useState(initialBoard);
  const [currentTurn, setCurrentTurn] = useState('white');
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [gameState, setGameState] = useState('stopped');
  const [history, setHistory] = useState([]);
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const [timeIncrement, setTimeIncrement] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [winner, setWinner] = useState(null);

  const startTimer = (turn) => {
    if (intervalId) clearInterval(intervalId);

    const id = setInterval(() => {
      if (turn === 'white') {
        setWhiteTime((prevTime) => {
          const newTime = Math.max(prevTime - 1, 0);
          if (newTime === 0) {
            clearInterval(id);
            setWinner('black');
            setGameState('stopped');
          }
          return newTime;
        });
      } else {
        setBlackTime((prevTime) => {
          const newTime = Math.max(prevTime - 1, 0);
          if (newTime === 0) {
            clearInterval(id);
            setWinner('white');
            setGameState('stopped');
          }
          return newTime;
        });
      }
    }, 1000);

    setIntervalId(id);
  };

  const stopTimer = () => {
    if (intervalId) clearInterval(intervalId);
  };

  const handleSaveTimeSettings = (timeInMinutes, incrementInSeconds) => {
    const timeInSeconds = timeInMinutes * 60;
    setWhiteTime(timeInSeconds);
    setBlackTime(timeInSeconds);
    setTimeIncrement(incrementInSeconds);
    setGameState('running');
    setShowModal(false);
    startTimer('white');
  };

  const handleSquareClick = (rowIndex, colIndex) => {
    if (gameState !== 'running' || winner) return;
  
    if (selectedPiece) {
      const { row: startRow, col: startCol } = selectedPiece;
      const piece = board[startRow][startCol];
      if (isValidMove(piece, startRow, startCol, rowIndex, colIndex)) {
        const newBoard = board.map((row) => row.split(''));
        newBoard[startRow][startCol] = ' ';
        newBoard[rowIndex][colIndex] = piece;
        setHistory([...history, board]);
        setBoard(newBoard.map((row) => row.join('')));
        
        checkForCheckmateOrWin(newBoard);
        
        setCurrentTurn((prevTurn) => {
          stopTimer();
          if (prevTurn === 'white') {
            setWhiteTime((prevTime) => prevTime + timeIncrement);
            startTimer('black');
            return 'black';
          } else {
            setBlackTime((prevTime) => prevTime + timeIncrement);
            startTimer('white');
            return 'white';
          }
        });
        setSelectedPiece(null);
      } else {
        setSelectedPiece(null);
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
    if (gameState !== 'running' || winner) return;

    event.dataTransfer.setData('piece', JSON.stringify({ rowIndex, colIndex }));
    setSelectedPiece(null);
  };

  const handleDrop = (event, targetRow, targetCol) => {
    if (gameState !== 'running' || winner) return;

    event.preventDefault();
    const data = event.dataTransfer.getData('piece');
    const { rowIndex, colIndex } = JSON.parse(data);

    const piece = board[rowIndex][colIndex];
    if (isValidMove(piece, rowIndex, colIndex, targetRow, targetCol)) {
      const newBoard = board.map((row) => row.split(''));
      newBoard[rowIndex][colIndex] = ' ';
      newBoard[targetRow][targetCol] = piece;
      setHistory([...history, board]);
      setBoard(newBoard.map((row) => row.join('')));
      checkForCheckmateOrWin(newBoard);
      setCurrentTurn((prevTurn) => {
        if (prevTurn === 'white') {
          stopTimer();
          setWhiteTime((prevTime) => prevTime + timeIncrement);
          startTimer('black');
          return 'black';
        } else {
          stopTimer();
          setBlackTime((prevTime) => prevTime + timeIncrement);
          startTimer('white');
          return 'white';
        }
      });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const isValidMove = (piece, startRow, startCol, endRow, endCol) => {
    const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
    
    const targetPiece = board[endRow][endCol];
    if (targetPiece !== ' ') {
      const targetPieceColor = targetPiece === targetPiece.toUpperCase() ? 'white' : 'black';
      if (pieceColor === targetPieceColor) {
        return false; 
      }
    }
  
    switch (piece.toLowerCase()) {
      case 'p':
        return validatePawnMove(piece, startRow, startCol, endRow, endCol);
      case 'r':
        return validateRookMove(startRow, startCol, endRow, endCol);
      case 'n':
        return validateKnightMove(startRow, startCol, endRow, endCol);
      case 'b':
        return validateBishopMove(startRow, startCol, endRow, endCol);
      case 'q':
        return validateQueenMove(startRow, startCol, endRow, endCol);
      case 'k':
        return validateKingMove(startRow, startCol, endRow, endCol);
      default:
        return false;
    }
  };
  

  const validatePawnMove = (piece, startRow, startCol, endRow, endCol) => {
    const direction = piece === 'P' ? -1 : 1;
    const startRowIndex = piece === 'P' ? 6 : 1;

    if (startCol === endCol && board[endRow][endCol] === ' ') {
      if (startRow + direction === endRow) return true;
      if (
        startRow === startRowIndex &&
        startRow + 2 * direction === endRow &&
        board[startRow + direction][startCol] === ' '
      )
        return true;
    }

    if (
      Math.abs(startCol - endCol) === 1 &&
      startRow + direction === endRow &&
      board[endRow][endCol] !== ' '
    ) {
      return true;
    }

    return false;
  };

  const validateRookMove = (startRow, startCol, endRow, endCol) => {
    if (startRow === endRow) {
      const step = startCol < endCol ? 1 : -1;
      for (let i = startCol + step; i !== endCol; i += step) {
        if (board[startRow][i] !== ' ') return false;
      }
      return true;
    }
    if (startCol === endCol) {
      const step = startRow < endRow ? 1 : -1;
      for (let i = startRow + step; i !== endRow; i += step) {
        if (board[i][startCol] !== ' ') return false;
      }
      return true;
    }
    return false;
  };

  const validateKnightMove = (startRow, startCol, endRow, endCol) => {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);
    return (
      (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
    );
  };

  const validateBishopMove = (startRow, startCol, endRow, endCol) => {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);
    if (rowDiff !== colDiff) return false;

    const rowStep = startRow < endRow ? 1 : -1;
    const colStep = startCol < endCol ? 1 : -1;
    for (
      let i = startRow + rowStep, j = startCol + colStep;
      i !== endRow;
      i += rowStep, j += colStep
    ) {
      if (board[i][j] !== ' ') return false;
    }
    return true;
  };

  const validateQueenMove = (startRow, startCol, endRow, endCol) => {
    return (
      validateRookMove(startRow, startCol, endRow, endCol) ||
      validateBishopMove(startRow, startCol, endRow, endCol)
    );
  };

  const validateKingMove = (startRow, startCol, endRow, endCol) => {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);
    return rowDiff <= 1 && colDiff <= 1;
  };

  const checkForCheckmateOrWin = (newBoard) => {
    let whiteKingExists = false;
    let blackKingExists = false;
  
    for (let row of newBoard) {
      for (let square of row) {
        if (square === 'K') whiteKingExists = true;
        if (square === 'k') blackKingExists = true;
      }
    }
  
    if (!whiteKingExists) {
      setWinner('black');
      setGameState('stopped');
      stopTimer();
      alert('Black wins! The white king has been captured.');
      handleReset();
    } else if (!blackKingExists) {
      setWinner('white');
      setGameState('stopped');
      stopTimer();
      alert('White wins! The black king has been captured.');
      handleReset();
    } else {
      const currentPlayer = currentTurn === 'white' ? 'white' : 'black';
      if (isStalemate(newBoard, currentPlayer)) {
        setWinner('draw');
        setGameState('stopped');
        stopTimer();
        alert('Stalemate! The game is a draw.');
        handleReset();
      }
    }
  };
  
  const isStalemate = (board, player) => {
    const isPlayerWhite = player === 'white';
  
    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
      for (let colIndex = 0; colIndex < 8; colIndex++) {
        const piece = board[rowIndex][colIndex];
        const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
  
        if (piece !== ' ' && pieceColor === player) {
          for (let targetRow = 0; targetRow < 8; targetRow++) {
            for (let targetCol = 0; targetCol < 8; targetCol++) {
              if (isValidMove(piece, rowIndex, colIndex, targetRow, targetCol)) {
                return false; // Found a valid move, so not stalemate
              }
            }
          }
        }
      }
    }
  
    return true; // No valid moves found, so stalemate
  };
  
  

  const handleUndo = () => {
    if (history.length > 0) {
      const previousBoard = history[history.length - 1];
      setBoard(previousBoard);
      setHistory(history.slice(0, -1));
      setCurrentTurn((prevTurn) => (prevTurn === 'white' ? 'black' : 'white'));
    }
  };

  const handleReset = () => {
    setBoard(initialBoard);
    setCurrentTurn('white');
    setSelectedPiece(null);
    setGameState('stopped');
    setHistory([]);
    setWhiteTime(0);
    setBlackTime(0);
    setWinner(null);
    stopTimer();
    setShowModal(true);
  };
  

  const handleResign = () => {
    setWinner(currentTurn === 'white' ? 'black' : 'white');
    setGameState('stopped');
    stopTimer();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="chess-container">
      <h1 className="chess-title">Chess Game</h1>
      
      <div className="timer-container">
        <div className="timer white-timer">White : {formatTime(whiteTime)}</div>
        <div className="turn-indicator">
          {winner ? `Winner: ${winner}` : `${currentTurn}'s Turn`}
        </div>
        <div className="timer black-timer">Black : {formatTime(blackTime)}</div>
      </div>

      <div className="board-container">
        <div className="chess-board">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="chess-row">
              {row.split('').map((piece, colIndex) => (
                <div
                  key={colIndex}
                  className={`chess-square ${
                    (rowIndex + colIndex) % 2 === 0 ? 'white' : 'black'
                  }`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                >
                  {piece !== ' ' && (
                    <img
                      src={`images/${pieces[piece]}`}
                      alt={piece}
                      draggable
                      onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                      className="chess-piece"
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="controls-container">
        <button onClick={handleUndo} disabled={history.length === 0}>
          Undo
        </button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleResign}>Resign</button>
      </div>

      <TimeSettingsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveTimeSettings}
      />
    </div>
  );
}
