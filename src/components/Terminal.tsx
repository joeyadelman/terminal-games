'use client';

import { useState, useEffect } from 'react';
import { Snake } from './games/Snake';
import { Tetris } from './games/Tetris';
import { Pong } from './games/Pong';
import { SpaceInvaders } from './games/SpaceInvaders';
import { Leaderboard } from './Leaderboard';

type Command = {
  command: string;
  output: string;
};

export function Terminal() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [playerName, setPlayerName] = useState('player');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const availableCommands = {
    'help': 'Show available commands',
    'ls': 'List directory contents',
    'clear': 'Clear terminal screen',
    'pwd': 'Print working directory',
    'whoami': 'Display current user',
    'date': 'Show current date and time',
    'name': 'Change your display name',
    '[game]': 'Play [game]',
  };

  const games = {
    'snake': '- Classic snake game. Eat food, grow longer, don\'t hit walls!',
    'tetris': '- The original block stacking game.',
    'pong': '- Classic paddle game against CPU.',
    'invaders': '- Classic space shooter. Defend Earth from alien invasion!'
  };

  const handleCommand = (input: string) => {
    const [cmd, ...args] = input.toLowerCase().trim().split(' ');
    let output = '';
  
    switch (cmd) {
      case 'help':
        output = 'Available commands:\n' + Object.entries(availableCommands)
          .map(([name, desc]) => `${name} - ${desc}`)
          .join('\n');
        break;
  
      case 'name':
        if (args.length === 0) {
          output = 'Usage: name <new-name>\nCurrent name: ' + playerName;
        } else {
          const newName = args.join(' ');
          if (newName.length < 2 || newName.length > 20) {
            output = 'Name must be between 2 and 20 characters';
          } else {
            setPlayerName(newName);
            localStorage.setItem('terminalPlayerName', newName);
            setCommands([]);
            output = `Welcome, ${newName}!`;
          }
        }
        break;
  
      case 'ls':
        output = Object.entries(games)
          .map(([name, desc]) => `${name}\t${desc}`)
          .join('\n');
        break;

      case 'pwd':
        output = '/home/user/terminal-quest';
        break;

      case 'whoami':
        output = playerName;
        break;

      case 'date':
        output = new Date().toString();
        break;

      case 'clear':
        setCommands([]);
        return;

      default:
        if (Object.keys(games).includes(cmd)) {
          output = `Starting ${cmd}...\nPress 'q' to quit the game.`;
          setCurrentGame(cmd);
        } else if (cmd.startsWith('./') || cmd.endsWith('.sh')) {
          output = `Note: You can now just type the game name (e.g., 'snake' instead of './snake.sh')`;
        } else if (cmd === 'exit') {
          if (currentGame) {
            output = `Terminating ${currentGame}...`;
            setCurrentGame(null);
          } else {
            output = 'bash: exit: no active process';
          }
        } else {
          output = `bash: ${cmd}: command not found\nType 'help' to see available commands`;
        }
    }

    setCommands(prev => [...prev, { command: input, output }]);
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
    if (!currentGame) return null;

    switch (currentGame) {
      case 'snake':
        return (
          <Snake 
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
            playerName={playerName}
          />
        );
      case 'tetris':
        return (
          <Tetris
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
            playerName={playerName}
          />
        );
      case 'pong':
        return (
          <Pong
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
          />
        );
      case 'invaders':
        return (
          <SpaceInvaders
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
            playerName={playerName}
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

  useEffect(() => {
    const savedName = localStorage.getItem('terminalPlayerName');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

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
                         ██████╗ ██╗   ██╗███████╗███████╗████████╗
                        ██╔═══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝
                        ██║   ██║██║   ██║█████╗  ███████╗   ██║   
                        ██║▄▄ ██║██║   ██║██╔══╝  ╚════██║   ██║   
                        ╚██████╔╝╚██████╔╝███████╗███████║   ██║   
                         ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝   ╚═╝   
`}</pre>
          <p className="text-sm mt-4">Type "help" for commands or "ls" for games</p>
          <p className="text-xs opacity-75 mt-1">v1.0.0 | Created by Walt</p>
        </div>
      )}

      {currentGame ? (
        <div className="relative">
          <div>
            <p className="mb-4">Press 'q' to quit the game</p>
            {currentGame && currentGame !== 'pong' && (
              <div className="absolute right-4 top-0 w-64">
                <Leaderboard game={currentGame} />
              </div>
            )}
            
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
            {currentGame === 'invaders' && (
              <div className="relative">
                <div className="absolute left-0 text-green-500 mt-8">
                  <p>Controls:</p>
                  <p>← → : Move left/right</p>
                  <p>SPACE : Shoot</p>
                  <p>Destroy all aliens to win!</p>
                  <p>Don't get hit by alien bullets!</p>
                </div>
                <div className="flex justify-center min-h-[500px] min-w-[600px]">
                  {renderGame()}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {commands.map((cmd, i) => (
            <div key={i} className="mb-2">
              <div>
                <span className="text-green-500">{playerName}@terminal-quest:~$ </span>
                {cmd.command}
              </div>
              <div className="whitespace-pre-line">{cmd.output}</div>
            </div>
          ))}

          <div className="flex">
            <span className="text-green-500">{playerName}@terminal-quest:~$ </span>
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