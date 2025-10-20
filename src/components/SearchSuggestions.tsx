// src/components/SearchSuggestions.tsx
import React from 'react';
// Link is no longer needed here for navigation
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils'; // Assuming you have this utility

interface Suggestion {
  id: string; // Combined source-id
  title: string;
}

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  isLoading: boolean;
  // Renamed prop for clarity: passes the selected title back
  onSuggestionSelect: (title: string) => void;
  className?: string;
}

const suggestionVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  isLoading,
  onSuggestionSelect, // Use the renamed prop
  className,
}) => {
  return (
    <AnimatePresence>
      {(isLoading || suggestions.length > 0) && (
        <motion.div
          variants={suggestionVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute top-full left-0 right-0 mt-2 w-full bg-popover border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto",
            className
          )}
          role="listbox" // Accessibility: identify as listbox
        >
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Loading suggestions...</div>
          ) : (
            <ul className="divide-y divide-border">
              {suggestions.map((suggestion, index) => ( // Add index for potential aria roles later
                <li key={suggestion.id} role="option" aria-selected="false"> {/* Accessibility */}
                  {/* Changed Link to button */}
                  <button
                    type="button" // Important for forms
                    onClick={() => onSuggestionSelect(suggestion.title)} // Call handler with title
                    className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors truncate"
                  >
                    {suggestion.title}
                  </button>
                </li>
              ))}
              {/* Optional: Add a "No results found" message if needed */}
              {!isLoading && suggestions.length === 0 && (
                <li className="p-4 text-center text-muted-foreground text-sm" aria-live="polite">
                    No suggestions found.
                </li>
              )}
            </ul>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchSuggestions;