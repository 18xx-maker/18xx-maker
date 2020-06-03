import { useState } from "react";

const useSessionState = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

export default useSessionState;
