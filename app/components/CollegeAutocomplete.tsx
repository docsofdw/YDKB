import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { colleges } from '../lib/colleges';

interface CollegeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  className?: string;
}

export function CollegeAutocomplete({ value, onChange, onSubmit, className = '' }: CollegeAutocompleteProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    onChange(input);

    if (input.length > 0) {
      const filtered = colleges.filter(college =>
        college.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit();
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`
        relative group
        transition-all duration-300
        ${isFocused ? 'ring-2 ring-primary-green/30 ring-offset-2 ring-offset-background/10' : ''}
      `}>
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>

        {/* Main Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type a college name..."
          className={`
            w-full h-12
            pl-11 pr-4
            text-base text-gray-100
            bg-surface/40 backdrop-blur-md
            border border-gray-700/50
            rounded-xl
            placeholder:text-gray-500
            transition-all duration-300
            focus:outline-none
            focus:border-primary-green/50
            focus:bg-surface/60
            hover:bg-surface/50
            hover:border-gray-600/50
          `}
          spellCheck={false}
          autoComplete="off"
        />

        {/* Focus/Hover Effects */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-green/5 to-secondary-green/5 blur-sm" />
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="
            absolute z-50 w-full mt-2
            bg-surface/90 backdrop-blur-md
            border border-gray-700/50
            rounded-xl
            shadow-xl shadow-black/20
            overflow-hidden
          "
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`
                w-full px-4 py-3
                text-left text-base text-gray-100
                transition-all duration-200
                hover:bg-primary-green/10
                hover:text-primary-green
                focus:outline-none
                focus:bg-primary-green/10
                focus:text-primary-green
                ${index !== suggestions.length - 1 ? 'border-b border-gray-700/50' : ''}
              `}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 