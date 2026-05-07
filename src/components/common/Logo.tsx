import React from 'react';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const LogoIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="18" fill="none" />
    <circle cx="50" cy="50" r="14.5" stroke="currentColor" strokeWidth="13" fill="none" />
  </svg>
);

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true, ...props }) => {
  const containerSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`} {...props}>
      <div className={`${containerSizes[size]} flex items-center justify-center transform group-hover:rotate-12 transition-transform`}>
        <LogoIcon className="w-full h-full text-smash-orange" />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-black font-display tracking-tighter italic uppercase`}>
          SMASHIFY
        </span>
      )}
    </div>
  );
};

export default Logo;

