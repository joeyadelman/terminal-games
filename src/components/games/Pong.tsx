import { useEffect, useState, useCallback } from 'react';

type Position = {
  x: number;
  y: number;
};

type Paddle = {
  y: number;
  score: number;
};

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_HEIGHT = 60;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 8;
const PADDLE_SPEED = 8;
const INITIAL_BALL_SPEED = 5;
const SPEED_INCREASE = 0.2;

export function Pong({ 
  onGameOver,
  onScoreUpdate 
}: { 
  onGameOver: (stats: { score: number; highScore: number }) => void;
  onScoreUpdate: (score: number) => void;
}) {
  const [countdown, setCountdown] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [leftPaddle, setLeftPaddle] = useState<Paddle>({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 });
  const [rightPaddle, setRightPaddle] = useState<Paddle>({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 });
  const [ball, setBall] = useState<Position>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const [ballVelocity, setBallVelocity] = useState({ x: INITIAL_BALL_SPEED, y: INITIAL_BALL_SPEED });
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('pongHighScore') || '0');
    }
    return 0;
  });

  const resetBall = useCallback((direction?: 'left' | 'right') => {
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
    const xDir = direction ? (direction === 'left' ? -1 : 1) : (Math.random() > 0.5 ? 1 : -1);
    setBallVelocity({ 
      x: INITIAL_BALL_SPEED * xDir,
      y: INITIAL_BALL_SPEED * (Math.random() * 1.5 - 0.75) // More controlled vertical angle
    });
  }, []);

  const checkPaddleCollision = useCallback((ballPos: Position, paddleY: number, isLeftPaddle: boolean) => {
    const paddleX = isLeftPaddle ? PADDLE_WIDTH : CANVAS_WIDTH - PADDLE_WIDTH;
    const ballInXRange = isLeftPaddle 
      ? ballPos.x <= paddleX + BALL_SIZE
      : ballPos.x >= paddleX - BALL_SIZE;
    
    const ballInYRange = ballPos.y >= paddleY && 
                        ballPos.y <= paddleY + PADDLE_HEIGHT;

    if (ballInXRange && ballInYRange) {
      // Calculate relative impact point (-0.5 to 0.5)
      const relativeIntersectY = (paddleY + (PADDLE_HEIGHT / 2) - ballPos.y) / (PADDLE_HEIGHT / 2);
      // Convert to angle (-45 to 45 degrees)
      const bounceAngle = relativeIntersectY * 0.785398; // 0.785398 = 45 degrees in radians
      
      const speed = Math.sqrt(ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y);
      const newSpeed = speed * (1 + SPEED_INCREASE);
      
      return {
        x: isLeftPaddle ? Math.abs(newSpeed * Math.cos(bounceAngle)) : -Math.abs(newSpeed * Math.cos(bounceAngle)),
        y: -newSpeed * Math.sin(bounceAngle)
      };
    }
    return null;
  }, [ballVelocity]);

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    setBall(prevBall => {
      const newBall = {
        x: prevBall.x + ballVelocity.x,
        y: prevBall.y + ballVelocity.y
      };

      // Wall collisions (top and bottom)
      if (newBall.y <= BALL_SIZE / 2) {
        setBallVelocity(prev => ({ ...prev, y: Math.abs(prev.y) }));
        newBall.y = BALL_SIZE / 2;
      } else if (newBall.y >= CANVAS_HEIGHT - BALL_SIZE / 2) {
        setBallVelocity(prev => ({ ...prev, y: -Math.abs(prev.y) }));
        newBall.y = CANVAS_HEIGHT - BALL_SIZE / 2;
      }

      // Paddle collisions
      const leftCollision = checkPaddleCollision(newBall, leftPaddle.y, true);
      const rightCollision = checkPaddleCollision(newBall, rightPaddle.y, false);

      if (leftCollision) {
        setBallVelocity(leftCollision);
        newBall.x = PADDLE_WIDTH + BALL_SIZE;
      } else if (rightCollision) {
        setBallVelocity(rightCollision);
        newBall.x = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE;
      }

      // Scoring
      if (newBall.x <= 0) {
        setRightPaddle(prev => ({ ...prev, score: prev.score + 1 }));
        resetBall('left');
        return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
      } else if (newBall.x >= CANVAS_WIDTH) {
        setLeftPaddle(prev => ({ ...prev, score: prev.score + 1 }));
        resetBall('right');
        return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
      }

      return newBall;
    });

    // AI paddle movement
    setRightPaddle(prev => {
      const targetY = ball.y - PADDLE_HEIGHT / 2;
      const moveAmount = (targetY - prev.y) * 0.1; // Smooth following
      return {
        ...prev,
        y: Math.min(Math.max(prev.y + moveAmount, 0), CANVAS_HEIGHT - PADDLE_HEIGHT)
      };
    });
  }, [ball, ballVelocity, leftPaddle.y, rightPaddle.y, isPlaying, checkPaddleCollision, resetBall]);

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
    const gameLoop = setInterval(updateGame, 16);
    return () => clearInterval(gameLoop);
  }, [updateGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      switch (e.key) {
        case 'ArrowUp':
          setLeftPaddle(prev => ({
            ...prev,
            y: Math.max(prev.y - PADDLE_SPEED, 0)
          }));
          break;
        case 'ArrowDown':
          setLeftPaddle(prev => ({
            ...prev,
            y: Math.min(prev.y + PADDLE_SPEED, CANVAS_HEIGHT - PADDLE_HEIGHT)
          }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-8 text-green-500">
        <div>Player: {leftPaddle.score}</div>
        <div>CPU: {rightPaddle.score}</div>
      </div>
      <div 
        className="border border-green-500 bg-black relative"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
        {!isPlaying ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl text-green-500">
              {countdown > 0 ? countdown : 'GO!'}
            </span>
          </div>
        ) : (
          <>
            {/* Left Paddle */}
            <div
              className="absolute bg-green-500"
              style={{
                left: 0,
                top: leftPaddle.y,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT
              }}
            />
            {/* Right Paddle */}
            <div
              className="absolute bg-green-500"
              style={{
                right: 0,
                top: rightPaddle.y,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT
              }}
            />
            {/* Ball */}
            <div
              className="absolute bg-green-500"
              style={{
                left: ball.x - BALL_SIZE / 2,
                top: ball.y - BALL_SIZE / 2,
                width: BALL_SIZE,
                height: BALL_SIZE
              }}
            />
            {/* Center Line */}
            <div 
              className="absolute left-1/2 top-0 bottom-0 border-dashed border-l border-green-500 opacity-50"
            />
          </>
        )}
      </div>
    </div>
  );
} 