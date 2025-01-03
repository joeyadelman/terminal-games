import { useEffect, useState, useCallback } from 'react';

type Position = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

type GameStats = {
  score: number;
  highScore: number;
};

export function Snake({ 
  onGameOver,
  onScoreUpdate 
}: { 
  onGameOver: (stats: GameStats) => void;
  onScoreUpdate: (score: number) => void;
}) {
  const GRID_SIZE = 20;
  const CELL_SIZE = 20;
  const INITIAL_SPEED = 100;
  const SPEED_INCREASE = 1;

  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('snakeHighScore') || '0');
    }
    return 0;
  });
  const [countdown, setCountdown] = useState<number>(2);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const generateFood = useCallback(() => {
    const availableSpaces: Position[] = [];
    
    // Generate all possible positions
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        // Check if this position is occupied by the snake
        const isOccupied = snake.some(segment => segment.x === x && segment.y === y);
        if (!isOccupied) {
          availableSpaces.push({ x, y });
        }
      }
    }

    // Randomly select one of the available spaces
    const randomIndex = Math.floor(Math.random() * availableSpaces.length);
    const newFood = availableSpaces[randomIndex];
    
    setFood(newFood);
  }, [snake, GRID_SIZE]);

  const checkCollision = (pos: Position) => {
    if (
      pos.x < 0 || pos.x >= GRID_SIZE ||
      pos.y < 0 || pos.y >= GRID_SIZE
    ) {
      return true;
    }
    
    for (let segment of snake.slice(1)) {
      if (pos.x === segment.x && pos.y === segment.y) {
        return true;
      }
    }
    return false;
  };

  const moveSnake = useCallback(() => {
    if (isGameOver) return;

    const head = { ...snake[0] };
    
    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    if (checkCollision(head)) {
      setIsGameOver(true);
      const newHighScore = Math.max(score, highScore);
      setHighScore(newHighScore);
      localStorage.setItem('snakeHighScore', newHighScore.toString());
      onGameOver({ score, highScore: newHighScore });
      return;
    }

    const newSnake = [head];
    const ateFood = head.x === food.x && head.y === food.y;

    if (ateFood) {
      const newScore = score + 1;
      setScore(newScore);
      onScoreUpdate(newScore);
      generateFood();
      newSnake.push(...snake);
    } else {
      newSnake.push(...snake.slice(0, -1));
    }

    setSnake(newSnake);
  }, [snake, direction, food, isGameOver, generateFood, onGameOver, score, highScore, onScoreUpdate]);

  const getCurrentSpeed = useCallback(() => {
    return Math.max(50, INITIAL_SPEED - (score * SPEED_INCREASE));
  }, [score]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(true);
    }
  }, [countdown]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const gameLoop = setInterval(moveSnake, getCurrentSpeed());
    return () => clearInterval(gameLoop);
  }, [moveSnake, getCurrentSpeed, isPlaying]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-4">
        <div>Score: {score}</div>
        <div>High Score: {highScore}</div>
      </div>
      <div 
        className="border border-green-500"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          position: 'relative'
        }}
      >
        {!isPlaying ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl text-green-500">
              {countdown > 0 ? countdown : 'GO!'}
            </span>
          </div>
        ) : (
          <>
            {snake.map((segment, i) => (
              <div
                key={i}
                className="bg-green-500 absolute"
                style={{
                  width: CELL_SIZE - 1,
                  height: CELL_SIZE - 1,
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                }}
              />
            ))}
            <div
              className="bg-red-500 absolute"
              style={{
                width: CELL_SIZE - 1,
                height: CELL_SIZE - 1,
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
} 