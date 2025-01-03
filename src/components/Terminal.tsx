'use client';

import { useState, useEffect } from 'react';
import { Snake } from './games/Snake';
import { Tetris } from './games/Tetris';
import { Pong } from './games/Pong';

type Command = {
  command: string;
  output: string;
};

export function Terminal() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const games = {
    snake: 'Classic snake game. Eat food, grow longer, don\'t hit walls!',
    tetris: 'The original block stacking game',
    pong: 'Classic paddle game against CPU'
  };

  const handleCommand = (input: string) => {
    const cmd = input.toLowerCase().trim();
    let output = '';

    switch (cmd) {
      case 'help':
        output = `Available commands:
list - Show available games
play [game] - Start a game
q - Exit current game
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
      setCommandHistory(prev => [...prev, currentInput]);
      setHistoryIndex(-1);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
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
    console.log('Current game:', currentGame);
    if (!currentGame) return null;

    switch (currentGame) {
      case 'snake':
        console.log('Rendering Snake component');
        return (
          <Snake 
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
          />
        );
      case 'tetris':
        return (
            <Tetris
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
            />
        );
      case 'pong':
        return (
          <Pong
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleQuitKey = (e: KeyboardEvent) => {
      if (e.key === 'q' && currentGame) {
        handleCommand('exit');
      }
    };

    window.addEventListener('keydown', handleQuitKey);
    return () => window.removeEventListener('keydown', handleQuitKey);
  }, [currentGame]);

  return (
    <div className="font-mono text-green-500 p-4 pl-8">
      {!currentGame && (
        <div className="mb-6 text-center">
          <pre className="text-xs sm:text-sm whitespace-pre">
{`
████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗      
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║      
   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║      
   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║      
   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗ 
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝ 
                        ██████╗  █████╗ ███╗   ███╗███████╗███████╗ 
                       ██╔════╝ ██╔══██╗████╗ ████║██╔════╝██╔════╝ 
                       ██║  ███╗███████║██╔████╔██║█████╗  ███████╗ 
                       ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ╚════██║ 
                       ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗███████║ 
                        ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝ 
`}</pre>
          <p className="text-sm mt-4">Type "help" for available commands</p>
          <p className="text-xs opacity-75 mt-1">v1.0.0 | Created by Walt</p>
        </div>
      )}

      {currentGame ? (
        <div>
          <p className="mb-4">Press 'q' to quit the game</p>
          {currentGame === 'tetris' && (
            <div className="relative">
              <div className="absolute left-0 text-green-500 mt-8">
                <p>Controls:</p>
                <p>← → : Move left/right</p>
                <p>↓ : Move down</p>
                <p>↑ or Z : Rotate clockwise</p>
                <p>X : Rotate counter-clockwise</p>
                <p>Clear lines to score points!</p>
              </div>
              <div className="flex justify-center">
                {renderGame()}
              </div>
            </div>
          )}
          {currentGame === 'snake' && (
            <div className="relative">
              <div className="absolute left-0 text-green-500 mt-8">
                <p>Controls:</p>
                <p>← → ↑ ↓ : Move snake</p>
                <p>Collect food to grow and score points!</p>
                <p>Don't hit the walls or yourself!</p>
              </div>
              <div className="flex justify-center min-h-[500px] min-w-[500px]">
                {renderGame()}
              </div>
            </div>
          )}
          {currentGame === 'pong' && (
            <div className="relative">
              <div className="absolute left-0 text-green-500 mt-8">
                <p>Controls:</p>
                <p>↑ ↓ : Move paddle up/down</p>
                <p>Score points against the CPU!</p>
                <p>Ball speeds up with each hit</p>
              </div>
              <div className="flex justify-center min-h-[500px] min-w-[600px]">
                {renderGame()}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
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
        </div>
      )}
    </div>
  );
} 