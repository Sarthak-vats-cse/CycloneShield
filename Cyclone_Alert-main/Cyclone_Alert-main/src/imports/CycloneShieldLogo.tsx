import React from 'react';

interface LogoProps {
  size?: number;
  glow?: boolean;
}

export const CycloneShieldLogo: React.FC<LogoProps> = ({ size = 38, glow = false }) => {
  return (
    <div className={`flex items-center justify-center ${glow ? 'drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]' : ''}`}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2C20 2 9.5 5.5 5 11.5C5 23.5 12.5 33 20 38C27.5 33 35 23.5 35 11.5C30.5 5.5 20 2 20 2Z" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 12V26" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M14 16L20 10L26 16" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
};
