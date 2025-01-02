'use client';

import { useState } from 'react';
import { Snake } from './games/Snake';

type Command = {
  command: string;
  output: string;
};

export function Terminal() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState(0);

  const games = {
    snake: 'Classic snake game. Eat food, grow longer, don\'t hit walls!',
    tetris: 'The original block stacking game',
    pong: 'Two player paddle game'
  };

  const handleCommand = (input: string) => {
    const cmd = input.toLowerCase().trim();
    let output = '';

    switch (cmd) {
      case 'help':
        output = `Available commands:
list - Show available games
play [game] - Start a game
exit - Exit current game
clear - Clear terminal
help - Show this help message`;
        break;

      case 'list':
        output = 'Available games:\n' + Object.entries(games)
          .map(([name, desc]) => `${name} - ${desc}`)
          .join('\n');
        break;

      case 'clear':
        setCommands([]);
        return;

      default:
        if (cmd.startsWith('play ')) {
          const gameName = cmd.split(' ')[1];
          if (games[gameName as keyof typeof games]) {
            output = `Loading ${gameName}...`;
            setCurrentGame(gameName);
          } else {
            output = `Game "${gameName}" not found. Type "list" to see available games.`;
          }
        } else if (cmd === 'exit') {
          if (currentGame) {
            output = `Exiting ${currentGame}...`;
            setCurrentGame(null);
          } else {
            output = 'No game is currently running.';
          }
        } else {
          output = `Command not found: ${cmd}. Type "help" for available commands.`;
        }
    }

    setCommands([...commands, { command: input, output }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
      setCurrentInput('');
    }
  };

  const handleGameOver = ({ score, highScore }: { score: number; highScore: number }) => {
    setCommands(prev => [...prev, {
      command: 'Game Over',
      output: `Final Score: ${score}\nHigh Score: ${highScore}`
    }]);
    setCurrentGame(null);
  };

  const handleScoreUpdate = (score: number) => {
    setCurrentScore(score);
  };

  const renderGame = () => {
    if (!currentGame) return null;

    switch (currentGame) {
      case 'snake':
        return (
          <Snake 
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="font-mono text-green-500 p-4">
      <h1 className="mb-2">Welcome to Terminal Games Hub</h1>
      <p className="mb-4">Type "help" for commands</p>
      
      {currentGame ? (
        <div className="mb-4">
          {renderGame()}
          <p className="mt-2">Type "exit" to quit the game</p>
        </div>
      ) : (
        <>
          {commands.map((cmd, i) => (
            <div key={i} className="mb-2">
              <div>
                <span className="text-green-500">&gt; </span>
                {cmd.command}
              </div>
              <div className="whitespace-pre-line">{cmd.output}</div>
            </div>
          ))}

          <div className="flex">
            <span className="text-green-500">&gt; </span>
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-green-500 ml-2"
              autoFocus
            />
          </div>
        </>
      )}
    </div>
  );
} 