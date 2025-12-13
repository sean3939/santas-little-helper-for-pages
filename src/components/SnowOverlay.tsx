import React, { useEffect, useState } from 'react';

const SnowOverlay: React.FC = () => {
  const [flakes, setFlakes] = useState<number[]>([]);

  useEffect(() => {
    // Generate static number of flakes
    setFlakes(Array.from({ length: 50 }, (_, i) => i));
  }, []);

  return (
    <div className="snow-container" aria-hidden="true">
      {flakes.map((i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full opacity-80"
          style={{
            width: `${Math.random() * 5 + 2}px`,
            height: `${Math.random() * 5 + 2}px`,
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
            animation: `fall ${Math.random() * 10 + 5}s linear infinite`,
            animationDelay: `-${Math.random() * 10}s`
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) translateX(0px); opacity: 1; }
          100% { transform: translateY(110vh) translateX(20px); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default SnowOverlay;