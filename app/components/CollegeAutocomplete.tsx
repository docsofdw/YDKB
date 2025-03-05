import { useState, useEffect, useRef } from 'react';
import { Input } from "@/app/components/ui/input";
import { searchColleges } from '@/app/lib/supabase-client';

interface CollegeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  className?: string;
}

export function CollegeAutocomplete({ value, onChange, onSubmit, className = '' }: CollegeAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length >= 2) {
        const colleges = await searchColleges(value);
        setSuggestions(colleges);
        setIsOpen(colleges.length > 0);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    };

    fetchSuggestions();
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      if (selectedIndex > -1) {
        onChange(suggestions[selectedIndex]);
        setIsOpen(false);
      } else {
        onSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setIsOpen(false);
    setSuggestions([]);
    onChange(suggestion);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setSelectedIndex(-1);
          if (suggestions.includes(e.target.value)) {
            setIsOpen(false);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Enter college name"
        className={`text-center text-black dark:text-white ${className}`}
        autoFocus
      />
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`px-4 py-2 cursor-pointer text-black dark:text-white ${
                index === selectedIndex ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 