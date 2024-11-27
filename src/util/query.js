import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";

import { equals, map, split } from "ramda";

export const useRangeParam = (key, initial) => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  let searchValue = [...initial];
  if (searchParams.has(key)) {
    searchValue = map(parseInt, split("_", searchParams.get(key)));
  }

  const setValue = useCallback(
    (state) => {
      if (equals(state, initial)) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, `${state[0]}_${state[1]}`);
      }

      navigate({ search: searchParams.toString() });
    },
    [key, initial, navigate, searchParams],
  );

  return [searchValue, setValue];
};

export const useIntParam = (key, initial) => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const stringValue = searchParams.get(key) || `${initial}`;
  const value = parseInt(stringValue);

  const setValue = useCallback(
    (num = 0) => {
      if (!num || num === initial) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, num.toString());
      }

      navigate({ search: searchParams.toString() });
    },
    [initial, key, navigate, searchParams],
  );

  return [value, setValue];
};

export const useBooleanParam = (key) => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const value = searchParams.has(key);

  const toggle = useCallback(() => {
    if (value) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, true);
    }

    navigate({ search: searchParams.toString() });
  }, [value, key, navigate, searchParams]);

  return [value, toggle];
};

export const useStringParam = (key, initial) => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  let value = initial;
  if (searchParams.has(key)) {
    value = decodeURIComponent(searchParams.get(key));
  }

  const setValue = useCallback(
    (str) => {
      if (!str || str === initial) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, encodeURIComponent(str));
      }

      navigate({ search: searchParams.toString() });
    },
    [initial, key, navigate, searchParams],
  );

  return [value, setValue];
};
