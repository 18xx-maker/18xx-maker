import { useHistory, useLocation } from "react-router-dom";

import isNil from "ramda/src/isNil";

export const useIntParam = (key) => {
  const history = useHistory();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const stringValue = searchParams.get(key);
  const value = isNil(stringValue) ? stringValue : parseInt(stringValue);

  const setValue = (num) => {
    if (isNil(num)) {
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
