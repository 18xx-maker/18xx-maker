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

// The config and edit panels are side panels that exclude each other: opening
// one closes the other (and the config section), closing one leaves the rest
export const togglePanelSearch = (search, panel) => {
  const params = new URLSearchParams(search);

  if (params.has(panel)) {
    params.delete(panel);
    if (panel === "edit") params.delete("editSection");
  } else {
    params.delete(panel === "edit" ? "config" : "edit");
    params.delete("editSection");
    if (panel === "edit") params.delete("section");
    params.set(panel, true);
  }

  return params.toString();
};

// The edit panel on a section: closed it opens on the section, open on
// another section it goes to the section, open on the section it closes
export const openEditSearch = (search, section) => {
  const params = new URLSearchParams(search);
  if (params.has("edit") && params.get("editSection") === section) {
    return togglePanelSearch(search, "edit");
  }

  const next = new URLSearchParams(
    params.has("edit") ? search : togglePanelSearch(search, "edit"),
  );
  next.set("editSection", encodeURIComponent(section));
  return next.toString();
};

export const useTogglePanel = (panel) => {
  const navigate = useNavigate();
  const location = useLocation();
  const open = new URLSearchParams(location.search).has(panel);

  const toggle = useCallback(
    () => navigate({ search: togglePanelSearch(location.search, panel) }),
    [navigate, location.search, panel],
  );

  return [open, toggle];
};
