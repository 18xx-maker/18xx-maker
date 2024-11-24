import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { equals, map, split } from "ramda";

export const useRangeParam = (key, initial) => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  let searchValue = [...initial];
  if (searchParams.has(key)) {
    searchValue = map(parseInt, split("_", searchParams.get(key)));
  }

  const [state, setValue] = useState(searchValue);

  const blur = () => {
    if (equals(state, initial)) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, `${state[0]}_${state[1]}`);
    }

    navigate({ search: searchParams.toString() });
  };

  return [state, setValue, blur];
};

export const useIntParam = (key, initial) => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const stringValue = searchParams.get(key) || `${initial}`;
  const value = parseInt(stringValue);

  const setValue = (num = 0) => {
    if (!num || num === initial) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, num.toString());
    }

    navigate({ search: searchParams.toString() });
  };

  return [value, setValue];
};

export const useBooleanParam = (key) => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const value = searchParams.has(key);

  const toggle = () => {
    if (value) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, true);
    }

    navigate({ search: searchParams.toString() });
  };

  return [value, toggle];
};

export const useStringParam = (key, initial) => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  let value = initial;
  if (searchParams.has(key)) {
    value = decodeURIComponent(searchParams.get(key));
  }

  const setValue = (str) => {
    if (!str || str === initial) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, encodeURIComponent(str));
    }

    navigate({ search: searchParams.toString() });
  };

  return [value, setValue];
};
