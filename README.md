# Terminal Games Hub

A retro-style terminal-based gaming platform built with Next.js and TypeScript. Experience classic games through a nostalgic command-line interface.

## 🎮 Features

- Terminal-style interface with classic green-on-black theme
- Command-line game navigation
- Multiple classic games:
  - 🐍 Snake: Classic snake game with progressive difficulty
  - 🧱 Tetris: Block stacking puzzle game
  - 🏓 Pong: Classic paddle game against CPU
  - 👾 Space Invaders: Defend Earth from alien invasion
- Global leaderboards with top 10 scores
- High score tracking
- Responsive design
- Keyboard controls

## 🎯 Available Commands

- `help` - Show available commands
- `ls` - List available games
- `play [game]` - Start a game (e.g., `play snake`)
- `q` - Exit current game
- `clear` - Clear terminal
- `name` - Change your display name
- `whoami` - Display current user
- `pwd` - Print working directory
- `date` - Show current date and time

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/your-username/terminal-games-hub.git
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 How to Play

### Snake
- Use arrow keys to control the snake
- Eat red food to grow and increase score
- Avoid hitting walls and yourself
- Snake speeds up as score increases

### Tetris
- ← → : Move left/right
- ↓ : Move down
- ↑ or Z : Rotate clockwise
- X : Rotate counter-clockwise
- Clear lines to score points

### Pong
- Use ↑↓ arrow keys to move paddle
- Score points by getting the ball past CPU paddle
- Ball speed increases over time

### Space Invaders
- ← → : Move ship left/right
- Spacebar : Shoot
- Avoid alien bullets and prevent invasion
- Destroy all aliens to win bonus points

## 🛠️ Built With

- Next.js 15
- TypeScript
- Tailwind CSS
- React 19
- Supabase for global leaderboards
- Local Storage for score persistence

## 🎨 Design Choices

- Retro terminal aesthetic with phosphor green text
- Monospace font for authentic terminal feel
- Minimalist UI focusing on gameplay
- Progressive difficulty in games
- Command-line interface for nostalgia
- Global leaderboards showing top 10 scores per game

## 🔜 Upcoming Features

- Game settings customization
- Mobile touch controls
- Sound effects
- Achievement system
- Daily challenges
- Easter eggs hidden in commands
- Mini programming puzzles
- Terminal shortcuts tutorial

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Inspired by classic terminal games
- Built for retro gaming enthusiasts