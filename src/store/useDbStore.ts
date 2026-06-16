import { useState, useEffect, useRef } from 'react';
import { Database } from 'sql.js';
import { initDatabase, searchDictionary } from '../lib/db';
import { WordEntry } from '../lib/conjugation';

/**
 * Custom hook to debounce a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Main state and interaction hook for the Dictionary Database
 */
export function useDbStore() {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<WordEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<WordEntry | null>(null);

  const debouncedQuery = useDebounce(query, 300);
  const isInitializing = useRef(false);

  // Initialize DB on mount
  useEffect(() => {
    if (db || isInitializing.current) return;
    isInitializing.current = true;

    async function load() {
      try {
        setLoading(true);
        const database = await initDatabase();
        setDb(database);
        
        // Fetch default/initial popular words
        const defaultResults = await searchDictionary(database, '');
        setResults(defaultResults);
        if (defaultResults.length > 0) {
          setSelectedEntry(defaultResults[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Unknown database loading error');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Trigger search on query change
  useEffect(() => {
    if (!db) return;

    let active = true;
    async function performSearch() {
      const searchResults = await searchDictionary(db!, debouncedQuery);
      if (active) {
        setResults(searchResults);
        // If current selected is no longer in results and results have items, select the first one
        if (searchResults.length > 0) {
          const isSelectedStillValid = searchResults.some(r => r.sequence === selectedEntry?.sequence);
          if (!isSelectedStillValid) {
            setSelectedEntry(searchResults[0]);
          }
        } else {
          setSelectedEntry(null);
        }
      }
    }

    performSearch();

    return () => {
      active = false;
    };
  }, [debouncedQuery, db]);

  return {
    db,
    loading,
    error,
    query,
    setQuery,
    results,
    selectedEntry,
    setSelectedEntry,
  };
}
