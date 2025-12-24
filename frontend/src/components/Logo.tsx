import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = false }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-current"
            >
                {/* Main Circle - Gradient Stroke */}
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="opacity-20"
                />

                {/* Active Path - 3/4 Circle */}
                <path
                    d="M90 50A40 40 0 1 1 50 10"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="opacity-100"
                />

                {/* Arrow Head */}
                <path
                    d="M50 2V18L60 10L50 2Z"
                    fill="currentColor"
                    className="transform rotate-[-10deg] origin-center"
                />

                {/* Inner Dots/Nodes */}
                <circle cx="35" cy="50" r="4" fill="currentColor" className="opacity-60" />
                <circle cx="50" cy="65" r="4" fill="currentColor" className="opacity-80" />
                <circle cx="65" cy="50" r="4" fill="currentColor" />
            </svg>

            {showText && (
                <span className="font-bold tracking-tight text-inherit">
                    Career<span className="opacity-80">Path</span>
                </span>
            )}
        </div>
    );
};

export default Logo;
