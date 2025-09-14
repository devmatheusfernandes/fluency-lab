import React from "react";

interface ErrorAlertProps {
  message: string | null;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, className = "" }) => {
  if (!message) return null;

  return (
    <div className={`flex justify-center items-center h-64 ${className}`}>
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative flex items-center gap-2"
        role="alert"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <strong className="font-bold">Erro! </strong>
          <span className="block sm:inline">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
