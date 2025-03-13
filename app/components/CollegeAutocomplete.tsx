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
  const [mouseDownOnSuggestion, setMouseDownOnSuggestion] = useState(false);

  // Update suggestions when value changes
  useEffect(() => {
    if (value.length > 0) {
      const filtered = colleges.filter(college =>
        college.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
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
    } else if (e.key === 'Escape') {
      setSuggestions([]);
    } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
      // Focus the first suggestion
      const suggestionElements = suggestionsRef.current?.querySelectorAll('button');
      if (suggestionElements && suggestionElements.length > 0) {
        (suggestionElements[0] as HTMLButtonElement).focus();
      }
    }
  };

  const handleSuggestionKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const suggestionElements = suggestionsRef.current?.querySelectorAll('button');
      if (suggestionElements && index < suggestionElements.length - 1) {
        (suggestionElements[index + 1] as HTMLButtonElement).focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const suggestionElements = suggestionsRef.current?.querySelectorAll('button');
      if (index === 0) {
        inputRef.current?.focus();
      } else if (suggestionElements && index > 0) {
        (suggestionElements[index - 1] as HTMLButtonElement).focus();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSuggestions([]);
      inputRef.current?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const suggestion = suggestions[index];
      handleSuggestionClick(suggestion);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Immediately update the value and close the dropdown
    onChange(suggestion);
    setSuggestions([]);
    
    // Focus the input after selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Submit the answer after a short delay to allow state to update
    setTimeout(() => {
      onSubmit();
    }, 100);
  };

  const handleSuggestionMouseDown = () => {
    // Set flag to prevent blur from closing dropdown before click is processed
    setMouseDownOnSuggestion(true);
  };

  const handleSuggestionMouseUp = () => {
    // Reset flag after click is processed
    setMouseDownOnSuggestion(false);
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
          onFocus={() => {
            setIsFocused(true);
            // Show suggestions if there's text
            if (value.length > 0) {
              const filtered = colleges.filter(college =>
                college.toLowerCase().includes(value.toLowerCase())
              ).slice(0, 5);
              setSuggestions(filtered);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            // Only close suggestions if not clicking on a suggestion
            if (!mouseDownOnSuggestion) {
              setTimeout(() => {
                setSuggestions([]);
              }, 150); // Small delay to allow click to register
            }
          }}
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
              onMouseDown={handleSuggestionMouseDown}
              onMouseUp={handleSuggestionMouseUp}
              onKeyDown={(e) => handleSuggestionKeyDown(e, index)}
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