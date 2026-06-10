import React, { useEffect, useState } from 'react';

export default function Confetti() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#6C63FF', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#A855F7'];
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${3 + Math.random() * 3}s`,
      size: `${5 + Math.random() * 10}px`,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: `${Math.random() * 360}deg`,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .confetti-particle {
          position: absolute;
          top: -20px;
          animation-name: fall;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-fill-mode: forwards;
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            transform: `rotate(${p.angle})`,
          }}
        />
      ))}
    </div>
  );
}
