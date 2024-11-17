import React from 'react';

const BackgroundPattern: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute w-full h-full opacity-[0.15] dark:opacity-[0.1]"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Abstract Geometric Pattern */}
        <g className="text-gray-900 dark:text-white">
          {/* Main Grid Pattern */}
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={i * 100}
                y1="0"
                x2={i * 100}
                y2="1000"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.2"
              />
              <line
                x1="0"
                y1={i * 100}
                x2="1000"
                y2={i * 100}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.2"
              />
            </g>
          ))}

          {/* Diagonal Lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`diagonal-${i}`}
              x1={i * 200}
              y1="0"
              x2={(i * 200) + 400}
              y2="1000"
              stroke="url(#lineGradient)"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {/* Large Angular Shapes */}
          <path
            d="M100,100 L300,100 L400,300 L200,500 L0,300 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.4"
          />
          <path
            d="M600,200 L800,200 L900,400 L700,600 L500,400 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.4"
          />

          {/* Angular Network Pattern */}
          {Array.from({ length: 15 }).map((_, i) => {
            const x1 = Math.random() * 1000;
            const y1 = Math.random() * 1000;
            const x2 = Math.random() * 1000;
            const y2 = Math.random() * 1000;
            return (
              <g key={`connection-${i}`}>
                <path
                  d={`M${x1},${y1} l-5,-5 l10,10 l-10,-10 l10,0 l-10,0 l0,10 l0,-10`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </g>
            );
          })}

          {/* Angular Decorative Elements */}
          {Array.from({ length: 3 }).map((_, i) => {
            const size = 100 + i * 50;
            const x = 300 + i * 200;
            const y = 500;
            return (
              <path
                key={`diamond-${i}`}
                d={`M${x},${y-size} L${x+size},${y} L${x},${y+size} L${x-size},${y} Z`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })}

          {/* Abstract Angular Pattern */}
          <path
            d="M0,0 L200,100 L400,50 L600,200 L800,100 L1000,150"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.4"
          />

          {/* Additional Angular Elements */}
          <path
            d="M200,800 L300,700 L400,800 L300,900 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.3"
          />
          <path
            d="M700,300 L800,200 L900,300 L800,400 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.3"
          />
        </g>
      </svg>
    </div>
  );
};

export default BackgroundPattern;