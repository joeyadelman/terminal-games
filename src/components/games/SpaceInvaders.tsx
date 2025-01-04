import { useState, useEffect, useCallback } from 'react';
import spaceAlien from '@/assets/space-alien.png';

type Position = { x: number; y: number };
type Alien = Position & { alive: boolean };
type Bullet = Position & { active: boolean };

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 20;
const ALIEN_SIZE = 30;
const BULLET_SIZE = 5;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ALIEN_STEP = 20; // Horizontal step size for aliens
const ALIEN_DROP = ALIEN_SIZE; // Distance to drop when hitting wall
const ALIENS_PER_ROW = 8;
const ALIEN_ROWS = 4;
const MOVE_INTERVAL = 30; // Frames between alien movements
const ALIEN_SHOOTING_INTERVAL = 800; // Aliens shoot every 500ms
const ALIEN_SHOOTING_CHANCE = 0.05;   // 5% chance for each alien to shoot
const MIN_SHOOT_DELAY = 1000;  // Minimum 1 second between shots
const MAX_SHOOT_DELAY = 3000;  // Maximum 3 seconds between shots
const ALIEN_SHOOT_INTERVAL = 500; // Half second

export function SpaceInvaders({ 
  onGameOver,
  onScoreUpdate 
}: { 
  onGameOver: (stats: { score: number; highScore: number }) => void;
  onScoreUpdate: (score: number) => void;
}) {
  const [player, setPlayer] = useState<Position>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 40 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [alienBullets, setAlienBullets] = useState<Bullet[]>([]);
  const [aliens, setAliens] = useState<Alien[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('invadersHighScore') || '0');
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [alienDirection, setAlienDirection] = useState(1);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);
  const [canShoot, setCanShoot] = useState(true);
  const [moveFrame, setMoveFrame] = useState(0);

  // Initialize aliens
  const initializeAliens = useCallback(() => {
    const newAliens: Alien[] = [];
    for (let row = 0; row < ALIEN_ROWS; row++) {
      for (let col = 0; col < ALIENS_PER_ROW; col++) {
        newAliens.push({
          x: col * (ALIEN_SIZE + 20) + 50,
          y: row * (ALIEN_SIZE + 20) + 50,
          alive: true
        });
      }
    }
    setAliens(newAliens);
  }, []);

  // Player shooting
  const shoot = useCallback(() => {
    if (!canShoot || !isPlaying) return;
    
    setBullets(prev => [...prev, { 
      x: player.x + PLAYER_WIDTH / 2, 
      y: player.y, 
      active: true 
    }]);
    
    setCanShoot(false);
    setTimeout(() => setCanShoot(true), 250);
  }, [player, canShoot, isPlaying]);

  // Collision detection
  const checkCollision = useCallback((bullet: Position, target: Position, targetWidth: number, targetHeight: number) => {
    return bullet.x >= target.x && 
           bullet.x <= target.x + targetWidth &&
           bullet.y >= target.y && 
           bullet.y <= target.y + targetHeight;
  }, []);

  // Game over handling
  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    const newHighScore = Math.max(score, highScore);
    setHighScore(newHighScore);
    localStorage.setItem('invadersHighScore', newHighScore.toString());
    onGameOver({ score, highScore: newHighScore });
  }, [score, highScore, onGameOver]);

  // Win handling
  const handleWin = useCallback(() => {
    setIsPlaying(false);
    const finalScore = score + 100; // Bonus for winning
    const newHighScore = Math.max(finalScore, highScore);
    setHighScore(newHighScore);
    localStorage.setItem('invadersHighScore', newHighScore.toString());
    onGameOver({ score: finalScore, highScore: newHighScore });
  }, [score, highScore, onGameOver]);

  // Game update logic
  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    // Update player position
    setPlayer(prev => {
      let newX = prev.x;
      if (moveLeft) newX = Math.max(0, prev.x - PLAYER_SPEED);
      if (moveRight) newX = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, prev.x + PLAYER_SPEED);
      return { ...prev, x: newX };
    });

    // Update aliens with frame-based movement
    setMoveFrame(prev => (prev + 1) % MOVE_INTERVAL);
    
    if (moveFrame === 0) {
      setAliens(prev => {
        let shouldChangeDirection = false;
        
        // First check if any alien would hit a wall
        prev.forEach(alien => {
          if (!alien.alive) return;
          const nextX = alien.x + ALIEN_STEP * alienDirection;
          if (nextX <= 0 || nextX >= CANVAS_WIDTH - ALIEN_SIZE) {
            shouldChangeDirection = true;
          }
        });

        if (shouldChangeDirection) {
          // Change direction and move down
          setAlienDirection(d => -d);
          return prev.map(alien => ({
            ...alien,
            y: alien.y + ALIEN_DROP
          }));
        } else {
          // Just move horizontally
          return prev.map(alien => ({
            ...alien,
            x: alien.x + ALIEN_STEP * alienDirection
          }));
        }
      });
    }

    // Update bullets with single-hit detection
    setBullets(prev => {
      const activeBullets = [...prev];
      const updatedBullets = activeBullets
        .map(bullet => ({
          ...bullet,
          y: bullet.y - BULLET_SPEED,
          active: bullet.y > 0
        }))
        .filter(bullet => bullet.active);
      
      // Check collisions for each bullet
      updatedBullets.forEach(bullet => {
        if (!bullet.active) return; // Skip already used bullets
        
        // Find first collision with an alien
        const hitAlienIndex = aliens.findIndex(alien => 
          alien.alive && checkCollision(bullet, alien, ALIEN_SIZE, ALIEN_SIZE)
        );

        if (hitAlienIndex !== -1) {
          // Deactivate the bullet
          bullet.active = false;
          // Update alien state
          setAliens(prev => prev.map((a, i) => 
            i === hitAlienIndex ? { ...a, alive: false } : a
          ));
          // Update score
          setScore(prev => {
            const newScore = prev + 10;
            onScoreUpdate(newScore);
            return newScore;
          });
        }
      });

      return updatedBullets.filter(bullet => bullet.active);
    });

    // Update alien bullets
    setAlienBullets(prev => prev
      .map(bullet => ({
        ...bullet,
        y: bullet.y + BULLET_SPEED * 0.5,
        active: bullet.y < CANVAS_HEIGHT
      }))
      .filter(bullet => bullet.active)
    );

    // Check collisions with player
    alienBullets.forEach(bullet => {
      if (checkCollision(bullet, player, PLAYER_WIDTH, PLAYER_HEIGHT)) {
        handleGameOver();
      }
    });

    // Check if aliens reached player
    if (aliens.some(alien => alien.alive && alien.y + ALIEN_SIZE >= player.y)) {
      handleGameOver();
    }

    // Check win condition
    if (aliens.every(alien => !alien.alive)) {
      handleWin();
    }
  }, [
    isPlaying, moveLeft, moveRight, alienDirection,
    aliens, moveFrame,
    checkCollision, handleGameOver, handleWin, onScoreUpdate
  ]);

  // Game initialization
  useEffect(() => {
    initializeAliens();
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [initializeAliens]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          setMoveLeft(true);
          break;
        case 'ArrowRight':
          setMoveRight(true);
          break;
        case ' ':
          e.preventDefault();
          shoot();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          setMoveLeft(false);
          break;
        case 'ArrowRight':
          setMoveRight(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shoot]);

  // Alien shooting
  useEffect(() => {
    if (!isPlaying) return;

    const shootInterval = setInterval(() => {
      // Get all living aliens
      const livingAliens = aliens.filter(alien => alien.alive);
      
      if (livingAliens.length > 0) {
        // Pick a random alien
        const randomAlien = livingAliens[Math.floor(Math.random() * livingAliens.length)];
        
        // Make it shoot
        setAlienBullets(prev => [...prev, {
          x: randomAlien.x + ALIEN_SIZE / 2,
          y: randomAlien.y + ALIEN_SIZE,
          active: true
        }]);
      }
    }, ALIEN_SHOOT_INTERVAL);

    return () => clearInterval(shootInterval);
  }, [isPlaying, aliens]);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(updateGame, 1000 / 60);
    return () => clearInterval(gameLoop);
  }, [isPlaying, updateGame]);

  // Add this function to get a random delay
  const getRandomDelay = () => {
    return Math.random() * (MAX_SHOOT_DELAY - MIN_SHOOT_DELAY) + MIN_SHOOT_DELAY;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-4">
        <div>Score: {score}</div>
        <div>High Score: {highScore}</div>
      </div>
      <div 
        className="border border-green-500 bg-black relative"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
        {countdown > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl text-green-500">{countdown}</span>
          </div>
        ) : (
          <>
            {/* Player */}
            <div
              className="absolute bg-green-500"
              style={{
                left: player.x,
                bottom: 20,
                width: PLAYER_WIDTH,
                height: PLAYER_HEIGHT
              }}
            />
            
            {/* Player Bullets */}
            {bullets.map((bullet, index) => (
              <div
                key={`player-bullet-${index}`}
                className="absolute bg-green-500"
                style={{
                  left: bullet.x,
                  top: bullet.y,
                  width: BULLET_SIZE,
                  height: BULLET_SIZE
                }}
              />
            ))}

            {/* Alien Bullets */}
            {alienBullets.map((bullet, index) => (
              <div
                key={`alien-bullet-${index}`}
                className="absolute bg-red-500"
                style={{
                  left: bullet.x,
                  top: bullet.y,
                  width: BULLET_SIZE,
                  height: BULLET_SIZE * 2
                }}
              />
            ))}

            {/* Aliens */}
            {aliens.map((alien, index) => (
              alien.alive && (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    left: alien.x,
                    top: alien.y,
                    width: ALIEN_SIZE,
                    height: ALIEN_SIZE,
                    backgroundImage: `url(${spaceAlien.src})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                />
              )
            ))}
          </>
        )}
      </div>
    </div>
  );
} 