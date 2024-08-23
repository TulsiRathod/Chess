import React, { useState, useEffect } from 'react';

function TimeSettingsModal({ show, onClose, onSave }) {
  const [timeInMinutes, setTimeInMinutes] = useState('');
  const [incrementInSeconds, setIncrementInSeconds] = useState('');

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
        setWhiteTime(prevTime => {
          const newTime = Math.max(prevTime - 1, 0);
          if (newTime === 0) {
            clearInterval(id);
            setWinner('black');
            setGameState('stopped');
          }
          return newTime;
        });
      } else {
        setBlackTime(prevTime => {
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
        const newBoard = board.map(row => row.split(''));
        newBoard[startRow][startCol] = ' ';
        newBoard[rowIndex][colIndex] = piece;
        setHistory([...history, board]);
        setBoard(newBoard.map(row => row.join('')));
        checkForCheckmateOrWin(newBoard);
        setCurrentTurn(prevTurn => {
          stopTimer();
          if (prevTurn === 'white') {
            setWhiteTime(prevTime => prevTime + timeIncrement);
            startTimer('black');
            return 'black';
          } else {
            setBlackTime(prevTime => prevTime + timeIncrement);
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
      const newBoard = board.map(row => row.split(''));
      newBoard[rowIndex][colIndex] = ' ';
      newBoard[targetRow][targetCol] = piece;
      setHistory([...history, board]);
      setBoard(newBoard.map(row => row.join('')));
      checkForCheckmateOrWin(newBoard);
      setCurrentTurn(prevTurn => {
        if (prevTurn === 'white') {
          stopTimer();
          setWhiteTime(prevTime => prevTime + timeIncrement);
          startTimer('black');
          return 'black';
        } else {
          stopTimer();
          setBlackTime(prevTime => prevTime + timeIncrement);
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
    if (pieceColor !== currentTurn) return false;

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
    if (startRow !== endRow && startCol !== endCol) return false;
    return isPathClear(startRow, startCol, endRow, endCol);
  };

  const validateKnightMove = (startRow, startCol, endRow, endCol) => {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  };

  const validateBishopMove = (startRow, startCol, endRow, endCol) => {
    if (Math.abs(startRow - endRow) !== Math.abs(startCol - endCol)) return false;
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

  const checkForCheckmateOrWin = (board) => {
    let whiteKing = false;
    let blackKing = false;

    board.forEach(row => {
      if (row.includes('K')) whiteKing = true;
      if (row.includes('k')) blackKing = true;
    });

    if (!whiteKing) {
      setWinner('black');
      setGameState('stopped');
      stopTimer();
    } else if (!blackKing) {
      setWinner('white');
      setGameState('stopped');
      stopTimer();
    }
  };

  const handleRestart = () => {
    setGameState('stopped');
    setSelectedPiece(null);
    stopTimer();
    setShowModal(true);
    setWinner(null);
  };

  const handleStopResume = () => {
    if (gameState === 'running') {
      setGameState('paused');
      stopTimer();
    } else if (gameState === 'paused') {
      setGameState('running');
      startTimer(currentTurn);
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
      <TimeSettingsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveTimeSettings}
      />

      <div className="black-timer">
        <p>Black: {blackTime}s</p>
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

      <div className="white-timer">
        <p>White: {whiteTime}s</p>
      </div>

      <div className="controls">
        {winner && <p>{winner.charAt(0).toUpperCase() + winner.slice(1)} wins!</p>}
        <button onClick={handleRestart}>Restart</button>
        <button onClick={handleStopResume}>{gameState === 'paused' ? 'Resume' : 'Stop'}</button>
        <button onClick={handleUndo} disabled={history.length === 0 || gameState !== 'running'}>Undo</button>
      </div>
    </div>
  );
}
