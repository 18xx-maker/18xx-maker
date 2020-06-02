import { useHistory, useLocation } from "react-router-dom";

export const useIntParam = (key) => {
  const history = useHistory();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const stringValue = searchParams.get(key) || "0";
  const value = parseInt(stringValue);

  const setValue = (num = 0) => {
    if (!num) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, num.toString());
    }

    history.push({search: searchParams.toString()});
  }

  return [value, setValue];
};

export const useBooleanParam = (key) => {
  const history = useHistory();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const value = searchParams.has(key);

  const toggle = () => {
    if (value) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, true);
    }

    history.push({search: searchParams.toString()});
  }

  return [value, toggle];
};
