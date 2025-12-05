"use client";

import { useState, useEffect, useRef } from "react";

type AutocompleteOption = {
  value: string;
  label: string;
};

type AutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchType: "make" | "model";
  make?: string; /*model search*/
};

/*autocomplete input dropdown suggestions from api as user types*/
export default function Autocomplete({
  value,
  onChange,
  placeholder,
  searchType,
  make,
}: AutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /*fetch suggestions when user types*/
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 1) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      try {
        let url = `/api/autoguessr/search?type=${searchType}&query=${encodeURIComponent(value)}`;
        if (searchType === "model" && make) {
          url += `&make=${encodeURIComponent(make)}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        setSuggestions(data.results || []);
        setIsOpen(data.results && data.results.length > 0);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setIsOpen(false);
      }
    };

    /*debounce fetch to limit rate*/
    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [value, searchType, make]);

  /*close dropdown when clicking outside*/
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* keyboard nav*/
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex].value);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelect(suggestion.value)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                index === selectedIndex
                  ? "bg-emerald-500 text-white"
                  : "text-slate-100 hover:bg-slate-600"
              }`}
            >
              {suggestion.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
