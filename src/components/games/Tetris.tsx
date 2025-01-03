import { useEffect, useState, useCallback } from 'react';

type Position = { x: number; y: number };
type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
type Grid = string[][];

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CELL_SIZE = 25;
const INITIAL_SPEED = 800;
const SPEED_INCREASE = 50;
const POINTS_PER_LINE = 100;

const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: 'cyan',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'yellow',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'purple',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: 'green',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: 'red',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'blue',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'orange',
  },
};

const rotateMatrix = (matrix: number[][]): number[][] => {
  const N = matrix.length;
  const rotated = Array(N).fill(0).map(() => Array(N).fill(0));
  
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      rotated[x][N - 1 - y] = matrix[y][x];
    }
  }
  
  return rotated;
};

const WALL_KICKS = [
  { x: 0, y: 0 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: -1 },
  { x: 1, y: -1 },
];

export function Tetris({ 
  onGameOver,
  onScoreUpdate 
}: { 
  onGameOver: (stats: { score: number; highScore: number }) => void;
  onScoreUpdate: (score: number) => void;
}) {
  const [grid, setGrid] = useState<Grid>(() => 
    Array(GRID_HEIGHT).fill(null).map(() => 
      Array(GRID_WIDTH).fill('')
    )
  );
  const [currentPiece, setCurrentPiece] = useState<{
    type: TetrominoType;
    position: Position;
    rotation: number;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('tetrisHighScore') || '0');
    }
    return 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [pieceStats, setPieceStats] = useState<Record<TetrominoType, number>>({
    I: 0, O: 0, T: 0, S: 0, Z: 0, J: 0, L: 0
  });
  const [nextPiece, setNextPiece] = useState<TetrominoType | null>(null);

  const createNewPiece = useCallback(() => {
    const types = Object.keys(TETROMINOES) as TetrominoType[];
    const type = nextPiece || types[Math.floor(Math.random() * types.length)];
    const newNextPiece = types[Math.floor(Math.random() * types.length)];
    
    setPieceStats(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
    
    setNextPiece(newNextPiece);
    return {
      type,
      position: { x: Math.floor(GRID_WIDTH / 2) - 1, y: 0 },
      rotation: 0
    };
  }, [nextPiece]);

  const checkCollision = useCallback((piece: typeof currentPiece, grid: Grid) => {
    if (!piece) return false;
    
    let shape = TETROMINOES[piece.type].shape;
    // Apply rotations
    for (let i = 0; i < piece.rotation; i++) {
      shape = rotateMatrix(shape);
    }

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = piece.position.x + x;
          const newY = piece.position.y + y;
          
          // Check boundaries and collisions with existing pieces
          if (
            newX < 0 || 
            newX >= GRID_WIDTH || 
            newY >= GRID_HEIGHT ||
            (newY >= 0 && grid[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const mergePieceToGrid = useCallback((piece: typeof currentPiece, grid: Grid) => {
    if (!piece) return grid;
    const newGrid = grid.map(row => [...row]);
    let shape = TETROMINOES[piece.type].shape;
    
    // Apply rotations
    for (let i = 0; i < piece.rotation; i++) {
      shape = rotateMatrix(shape);
    }
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] && piece.position.y + y >= 0) {
          newGrid[piece.position.y + y][piece.position.x + x] = TETROMINOES[piece.type].color;
        }
      }
    }
    return newGrid;
  }, []);

  const clearLines = useCallback((grid: Grid) => {
    let linesCleared = 0;
    const newGrid = grid.filter(row => {
      const isComplete = row.every(cell => cell !== '');
      if (isComplete) linesCleared++;
      return !isComplete;
    });

    while (newGrid.length < GRID_HEIGHT) {
      newGrid.unshift(Array(GRID_WIDTH).fill(''));
    }

    return { newGrid, linesCleared };
  }, []);

  const moveDown = useCallback(() => {
    if (gameOver || !currentPiece) return;

    const newPiece = {
      ...currentPiece,
      position: { ...currentPiece.position, y: currentPiece.position.y + 1 }
    };

    if (checkCollision(newPiece, grid)) {
      const newGrid = mergePieceToGrid(currentPiece, grid);
      const { newGrid: clearedGrid, linesCleared } = clearLines(newGrid);
      
      const newScore = score + (linesCleared * POINTS_PER_LINE);
      setScore(newScore);
      onScoreUpdate(newScore);
      setGrid(clearedGrid);

      const nextPiece = createNewPiece();
      if (checkCollision(nextPiece, clearedGrid)) {
        setGameOver(true);
        const newHighScore = Math.max(newScore, highScore);
        setHighScore(newHighScore);
        localStorage.setItem('tetrisHighScore', newHighScore.toString());
        onGameOver({ score: newScore, highScore: newHighScore });
      } else {
        setCurrentPiece(nextPiece);
      }
    } else {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, grid, gameOver, score, highScore]);

  const moveHorizontal = useCallback((direction: -1 | 1) => {
    if (gameOver || !currentPiece) return;

    const newPiece = {
      ...currentPiece,
      position: { 
        ...currentPiece.position, 
        x: currentPiece.position.x + direction 
      }
    };

    if (!checkCollision(newPiece, grid)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, grid, gameOver]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver) return;

    const newRotation = (currentPiece.rotation + 1) % 4;
    
    for (const kick of WALL_KICKS) {
      const newPiece = {
        ...currentPiece,
        position: {
          x: currentPiece.position.x + kick.x,
          y: currentPiece.position.y + kick.y,
        },
        rotation: newRotation
      };

      if (!checkCollision(newPiece, grid)) {
        setCurrentPiece(newPiece);
        return;
      }
    }
  }, [currentPiece, grid, gameOver, checkCollision]);

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      setCurrentPiece(createNewPiece());
    }
  }, [currentPiece, gameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          moveHorizontal(-1);
          break;
        case 'ArrowRight':
          moveHorizontal(1);
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
        case 'z':
          rotatePiece();
          break;
        case 'x':
          rotatePiece();
          rotatePiece();
          rotatePiece();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveHorizontal, moveDown, rotatePiece]);

  useEffect(() => {
    const gameLoop = setInterval(
      moveDown, 
      Math.max(100, INITIAL_SPEED - (score * SPEED_INCREASE))
    );
    return () => clearInterval(gameLoop);
  }, [moveDown, score]);

  const displayGrid = currentPiece 
    ? mergePieceToGrid(currentPiece, grid) 
    : grid;

  const StatisticsDisplay = () => (
    <div className="border border-green-500 p-2">
      <div className="text-green-500 mb-2">Statistics:</div>
      {Object.entries(pieceStats).map(([piece, count]) => (
        <div key={piece} className="flex items-center gap-2 text-green-500 mb-2">
          <div className="w-24 h-6 relative">
            {TETROMINOES[piece as TetrominoType].shape.map((row, y) => 
              row.map((cell, x) => (
                cell ? (
                  <div
                    key={`${x}-${y}`}
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: TETROMINOES[piece as TetrominoType].color,
                      position: 'absolute',
                      left: x * 12,
                      top: y * 12
                    }}
                  />
                ) : null
              ))
            )}
          </div>
          <div>{String(count).padStart(3, '0')}</div>
        </div>
      ))}
    </div>
  );

  const NextPieceDisplay = () => {
    if (!nextPiece) return null;
    const shape = TETROMINOES[nextPiece].shape;
    return (
      <div className="border border-green-500 p-2">
        <div className="text-green-500 mb-2">Next:</div>
        <div className="w-24 h-12 relative">
          {shape.map((row, y) => 
            row.map((cell, x) => (
              cell ? (
                <div
                  key={`${x}-${y}`}
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: TETROMINOES[nextPiece].color,
                    position: 'absolute',
                    left: x * 12,
                    top: y * 12
                  }}
                />
              ) : null
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="mb-4 flex gap-4 text-green-500">
          <div>Score: {score}</div>
          <div>High Score: {highScore}</div>
        </div>
        <div 
          className="border border-green-500"
          style={{
            width: GRID_WIDTH * CELL_SIZE,
            height: GRID_HEIGHT * CELL_SIZE,
            position: 'relative',
            backgroundColor: 'black',
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
            gap: '1px',
            padding: '1px'
          }}
        >
          {displayGrid.map((row, y) => 
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: cell || 'black',
                  border: '1px solid rgb(34, 197, 94)'
                }}
              />
            ))
          )}
        </div>
        {gameOver && (
          <div className="mt-4 text-red-500">Game Over!</div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <StatisticsDisplay />
        <NextPieceDisplay />
      </div>
    </div>
  );
} 