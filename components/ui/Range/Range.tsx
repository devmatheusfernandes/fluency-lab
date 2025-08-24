"use client";
import React, { useState } from "react";

const Range = ({
  min = 0,
  max = 100,
  step = 1,
  value = [50],
  onValueChange = (newValue?: number[]) => {
    // Callback for when value changes
    // newValue is intentionally unused in the default implementation
  },
  className = "",
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (e: { target: { value: string } }) => {
    const value = [parseInt(e.target.value)];
    setInternalValue(value);
    onValueChange(value);
  };

  const currentValue = value || internalValue;
  const percentage = ((currentValue[0] - min) / (max - min)) * 100;

  return (
    <div className={`relative flex w-full items-center ${className}`}>
      {/* Track */}
      <div className="relative h-3 w-full bg-surface-2 rounded-2xl overflow-hidden shadow-inner">
        {/* Range (filled portion) */}
        <div
          className="absolute h-full bg-primary rounded-2xl shadow-sm transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue[0]}
        onChange={handleChange}
        disabled={disabled}
        className="absolute w-full h-3 bg-transparent appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-6
          [&::-webkit-slider-thumb]:w-6
          [&::-webkit-slider-thumb]:rounded-2xl
          [&::-webkit-slider-thumb]:bg-success-light
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-success-light
          [&::-webkit-slider-thumb]:shadow-lg
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-webkit-slider-thumb]:active:scale-95
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:duration-200
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:h-6
          [&::-moz-range-thumb]:w-6
          [&::-moz-range-thumb]:rounded-2xl
          [&::-moz-range-thumb]:bg-success-light
          [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-track]:bg-transparent
          disabled:opacity-50
          disabled:cursor-not-allowed"
      />
    </div>
  );
};

export { Range };
