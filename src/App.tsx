import { createSignal, Show } from 'solid-js';
import TicTacToe from './games/TicTacToe/TicTacToe';
import { type Game } from './types/game';
import './App.css';

const games: Game[] = [
  {
    id: 'tictactoe',
    name: 'Tic Tac Toe',
    description: 'Classic 3x3 grid game',
    component: TicTacToe,
  },
  // Add more games here
];

function App() {
  const [selectedGame, setSelectedGame] = createSignal<Game | null>(null);

  const selectGame = (game: Game) => {
    setSelectedGame(game);
  };

  const backToMenu = () => {
    setSelectedGame(null);
  };

  return (
    <div class="app">
      <Show
        when={selectedGame()}
        fallback={
          <div class="menu">
            <h1>GAME ON!</h1>
            <p>Select a game to play:</p>
            <div class="game-list">
              {games.map(game => (
                <div class="game-card" onClick={() => selectGame(game)}>
                  <h3>{game.name}</h3>
                  <p>{game.description}</p>
                </div>
              ))}
            </div>
          </div>
        }
      >
        {selectedGame()!.component({ onBack: backToMenu })}
      </Show>
    </div>
  );
}

export default App;
