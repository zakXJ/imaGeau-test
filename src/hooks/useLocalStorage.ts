import { useState, useEffect } from 'react';

type SetValueFunction<T> = (prevValue: T) => T;

function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state with the value from localStorage or the initial value
  const [localStorageValue, setLocalStorageValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : initialValue;
  });

  // Update localStorage whenever localStorageValue changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(localStorageValue));
  }, [key, localStorageValue]);

  const setLocalStorageStateValue = (valueOrFn: T | SetValueFunction<T>) => {
    let newValue: T;
    if (typeof valueOrFn === 'function') {
      const fn = valueOrFn as SetValueFunction<T>;
      newValue = fn(localStorageValue);
    } else {
      newValue = valueOrFn;
    }
    localStorage.setItem(key, JSON.stringify(newValue));
    setLocalStorageValue(newValue);
  };

  return [localStorageValue, setLocalStorageStateValue] as const;
}

export default useLocalStorage;