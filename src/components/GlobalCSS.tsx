import React from 'react';

export const GlobalCSS: React.FC = () => {
  return (
    <style>{`
      @keyframes pulse-ring {
        0% {
          transform: scale(1);
          opacity: 0.8;
        }
        50% {
          transform: scale(1.18);
          opacity: 0.25;
        }
        100% {
          transform: scale(1);
          opacity: 0.8;
        }
      }

      @keyframes pulse-ring-intense {
        0% {
          transform: scale(0.95);
          opacity: 0.9;
        }
        50% {
          transform: scale(1.28);
          opacity: 0.15;
        }
        100% {
          transform: scale(0.95);
          opacity: 0.9;
        }
      }

      @keyframes heartbeat {
        0% {
          transform: scale(1);
        }
        14% {
          transform: scale(1.14);
        }
        28% {
          transform: scale(1);
        }
        42% {
          transform: scale(1.09);
        }
        70% {
          transform: scale(1);
        }
      }

      @keyframes float-up {
        0% {
          opacity: 0;
          transform: translateY(24px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slide-in-right {
        0% {
          opacity: 0;
          transform: translateX(32px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fade-in {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }

      @keyframes wave {
        0%, 100% {
          transform: scaleY(0.3);
        }
        50% {
          transform: scaleY(1);
        }
      }

      @keyframes spin-slow {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }

      .animate-pulse-ring {
        animation: pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      .animate-pulse-ring-fast {
        animation: pulse-ring-intense 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      .animate-heartbeat {
        animation: heartbeat 2s ease-in-out infinite;
      }

      .animate-float-up {
        animation: float-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .animate-slide-in-right {
        animation: slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .animate-fade-in {
        animation: fade-in 0.25s ease-out forwards;
      }

      .animate-spin-slow {
        animation: spin-slow 8s linear infinite;
      }

      .btn-press {
        transition: transform 0.12s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .btn-press:active {
        transform: scale(0.96);
      }

      .card-hover {
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
      }
      @media (hover: hover) {
        .card-hover:hover {
          transform: translateY(-2px);
        }
      }

      /* Custom mobile scrollbar */
      ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(100, 116, 139, 0.25);
        border-radius: 9999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(100, 116, 139, 0.45);
      }
    `}</style>
  );
};
