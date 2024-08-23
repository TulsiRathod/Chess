# Shipmnts-Task
# React Chess Game with Timer and Stalemate Detection

This is a React-based chess game featuring a customizable timer, move history, and comprehensive game logic that includes checkmate and stalemate detection. The game is designed for two players and provides a clean, user-friendly interface for an enjoyable chess experience.

## Features

- **Chess Board & Pieces**: Traditional chess board and pieces representation.
- **Move Validation**: Ensures that all moves adhere to chess rules, including pawn promotion, castling, and en passant.
- **Timer**: Customizable countdown timer with increments for each move.
- **Undo Move**: Allows players to undo their last move.
- **Stalemate Detection**: Identifies when a stalemate occurs, ending the game in a draw if no valid moves are available.
- **Checkmate Detection**: Ends the game when one player captures the opponent's king.
- **Drag & Drop**: Supports drag-and-drop functionality for piece movement.
- **Resignation**: Players can resign, conceding the game to the opponent.
- **Reset Game**: Resets the board and timer to start a new game.

## Getting Started

### Prerequisites

- **Node.js**: Make sure you have Node.js installed on your machine. You can download it from [here](https://nodejs.org/).

### Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/react-chess-game.git
    cd react-chess-game
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Run the application**:
    ```bash
    npm start
    ```

4. **Open the game in your browser**:
    Navigate to `http://localhost:3000` in your web browser.

## Usage

### Starting a Game

- **Set Time**: When the game starts, you'll be prompted to set the time for the game and the increment per move.
- **Play**: Click on a piece to select it, then click on the target square to move it. Alternatively, you can drag and drop pieces.
- **Timer**: The timer for each player starts and stops automatically as turns change.
- **Undo**: Click "Undo" to revert the last move.
- **Reset**: Click "Reset" to start a new game.
- **Resign**: Click "Resign" to concede the game to your opponent.

### Winning the Game

- **Checkmate**: Capture the opponent's king to win the game.
- **Stalemate**: If a player has no legal moves and their king is not in check, the game ends in a draw.
- **Time Out**: If a player's timer reaches zero, they lose the game.

## Code Structure

- **`Board.js`**: Contains the main game logic, including the board state, move validation, and game state management.
- **`TimeSettingsModal.js`**: Handles the timer settings modal, allowing users to set the game duration and increment.
- **`App.js`**: Entry point that renders the chess game.

## Contributing

If you would like to contribute to the project, please fork the repository and submit a pull request.

### Steps to Contribute

1. Fork the project.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Acknowledgments

- Chess piece icons are sourced from [example-source].
- This project was inspired by the classic game of chess and the desire to create a digital version with modern web technologies.
