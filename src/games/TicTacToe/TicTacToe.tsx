import { createSignal, For } from 'solid-js';

interface TicTacToeProps {
  onBack: () => void;
}

export default function TicTacToe(props: TicTacToeProps) {
  const [board, setBoard] = createSignal(Array(9).fill(null));
  const [isXNext, setIsXNext] = createSignal(true);
  const [winner, setWinner] = createSignal<string | null>(null);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (board()[i] || winner()) return;
    const newBoard = board().slice();
    newBoard[i] = isXNext() ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext());
    setWinner(calculateWinner(newBoard));
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const status = () => {
    if (winner()) {
      return `Winner: ${winner()}`;
    } else if (board().every(square => square)) {
      return 'Draw!';
    } else {
      return `Next player: ${isXNext() ? 'X' : 'O'}`;
    }
  };

  return (
    <div class="game">
      <h2>Tic Tac Toe</h2>
      <div class="status">{status()}</div>
      <div class="board">
        <For each={board()}>
          {(square, index) => (
            <button class="square" onClick={() => handleClick(index())}>
              {square}
            </button>
          )}
        </For>
      </div>
      <button onClick={resetGame}>Reset Game</button>
      <button onClick={props.onBack}>Back to Menu</button>
    </div>
  );
}