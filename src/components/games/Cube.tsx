import { useEffect } from 'react';

export function Cube({ onExit }: { onExit: () => void }) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'q') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onExit]);

  return (
    <div className="flex flex-col items-center text-green-500 font-mono">
      <pre className="text-green-500">
{`
    +------------+
   /            /|
  /            / |
 /            /  |
+------------+   |
|            |   |
|            |   +
|            |  /
|            | /
|            |/
+------------+
`}
      </pre>
    </div>
  );
} 