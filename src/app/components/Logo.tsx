export function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      
      {/* Background Circle */}
      <circle cx="24" cy="24" r="24" fill="url(#logoGradient)" />
      
      {/* Book Icon */}
      <path
        d="M14 12C14 11.4477 14.4477 11 15 11H22C22.5523 11 23 11.4477 23 12V36C23 36.5523 22.5523 37 22 37H15C14.4477 37 14 36.5523 14 36V12Z"
        fill="white"
        fillOpacity="0.9"
      />
      <path
        d="M25 12C25 11.4477 25.4477 11 26 11H33C33.5523 11 34 11.4477 34 12V36C34 36.5523 33.5523 37 33 37H26C25.4477 37 25 36.5523 25 36V12Z"
        fill="white"
        fillOpacity="0.9"
      />
      
      {/* Bookmark/Accent */}
      <path
        d="M24 11L24 20L27 17.5L24 11Z"
        fill="#FCD34D"
      />
      
      {/* Lines on pages */}
      <line x1="17" y1="16" x2="20" y2="16" stroke="url(#logoGradient)" strokeWidth="1" strokeLinecap="round" />
      <line x1="17" y1="20" x2="20" y2="20" stroke="url(#logoGradient)" strokeWidth="1" strokeLinecap="round" />
      <line x1="17" y1="24" x2="20" y2="24" stroke="url(#logoGradient)" strokeWidth="1" strokeLinecap="round" />
      
      <line x1="28" y1="16" x2="31" y2="16" stroke="url(#logoGradient)" strokeWidth="1" strokeLinecap="round" />
      <line x1="28" y1="20" x2="31" y2="20" stroke="url(#logoGradient)" strokeWidth="1" strokeLinecap="round" />
      <line x1="28" y1="24" x2="31" y2="24" stroke="url(#logoGradient)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
