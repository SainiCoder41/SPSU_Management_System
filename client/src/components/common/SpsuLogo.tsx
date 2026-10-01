import React from 'react';

interface SpsuLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

export const SpsuLogo: React.FC<SpsuLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-14',
  };

  const isWhite = variant === 'white';

  return (
    <div className={`flex items-center gap-3 ${sizeClasses[size]} ${className}`}>
      {/* Official SPSU Crest Icon Representation */}
      <div className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#0057B8] to-[#0076CE] text-white shadow-md border border-white/20">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          {/* Crest / Temple / Book Icon */}
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M12 6l-3 4h6l-3-4z" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-extrabold tracking-tight text-base ${
              isWhite ? 'text-white' : 'text-[#0B2545]'
            }`}
          >
            SPSU<span className="text-[#0057B8] font-bold">.AC.IN</span>
          </span>
          <span
            className={`text-[10px] uppercase font-semibold tracking-wider ${
              isWhite ? 'text-blue-100' : 'text-[#64748B]'
            }`}
          >
            Sir Padampat Singhania University
          </span>
          <span
            className={`text-[9px] font-medium tracking-normal ${
              isWhite ? 'text-blue-200/80' : 'text-[#0076CE]'
            }`}
          >
            JK Cement Initiative • Udaipur
          </span>
        </div>
      )}
    </div>
  );
};
