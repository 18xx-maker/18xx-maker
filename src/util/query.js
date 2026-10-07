import { useCallback, useMemo } from "react";

import { equals, map, split } from "ramda";

import { useLocation, useNavigate } from "@/router";
import { formatLines, parseLines } from "@/util/lineSpec";

// The search string of params with commas as they are: a comma is legal in a
// query and keeps links such as lines=1-4,15 readable
export const searchString = (params) => params.toString().replace(/%2C/gi, ",");

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

      navigate({ search: searchString(searchParams) });
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

      navigate({ search: searchString(searchParams) });
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

    navigate({ search: searchString(searchParams) });
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
    try {
      value = decodeURIComponent(searchParams.get(key));
    } catch {
      // A malformed link is not a value
    }
  }

  // drop: other params the change makes meaningless
  const setValue = useCallback(
    (str, { replace = false, drop = [] } = {}) => {
      if (!str || str === initial) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, encodeURIComponent(str));
      }
      drop.forEach((name) => searchParams.delete(name));

      navigate({ search: searchString(searchParams) }, { replace });
    },
    [initial, key, navigate, searchParams],
  );

  return [value, setValue];
};

// The config and edit panels are side panels that exclude each other: opening
// one closes the other (and the config section), closing one leaves the rest
export const togglePanelSearch = (search, panel) => {
  const params = new URLSearchParams(search);
  // The selected lines belong to the JSON tab of the edit panel, the
  // selected hex to the map
  params.delete("lines");
  params.delete("hex");

  if (params.has(panel)) {
    params.delete(panel);
    if (panel === "edit") params.delete("editSection");
  } else {
    params.delete(panel === "edit" ? "config" : "edit");
    params.delete("editSection");
    if (panel === "edit") params.delete("section");
    params.set(panel, true);
  }

  return searchString(params);
};

// The config panel on a section (the edit panel closes, it excludes the config)
export const openConfigSearch = (search, section) => {
  const params = new URLSearchParams(search);
  params.delete("lines");
  params.delete("hex");
  params.delete("edit");
  params.delete("editSection");
  params.set("config", true);
  params.set("section", section);
  return searchString(params);
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
  next.delete("lines");
  next.delete("hex");
  next.set("editSection", encodeURIComponent(section));
  return searchString(next);
};

// The hex selected on the map is its group's first coordinate (?hex=C11),
// shown on the Hex tab of the edit panel
export const selectHexSearch = (search, coord) => {
  const params = new URLSearchParams(search);
  params.set("editSection", "hex");
  params.set("hex", coord);
  params.delete("lines");
  return searchString(params);
};

export const clearHexSearch = (search) => {
  const params = new URLSearchParams(search);
  params.delete("hex");
  return searchString(params);
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

// The lines selected in the JSON editor, as sorted ranges. They are written
// with replace: a click on the gutter is not a page of history. The text is
// built by hand (digits, "-" and ",") so it is not encoded twice.
export const useLinesParam = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const lines = useMemo(
    () => parseLines(new URLSearchParams(location.search).get("lines")),
    [location.search],
  );

  const setLines = useCallback(
    (ranges) => {
      const params = new URLSearchParams(location.search);
      params.delete("lines");
      const rest = searchString(params);
      const spec = formatLines(ranges);
      const parts = [rest, spec && `lines=${spec}`].filter(Boolean);
      navigate({ search: parts.join("&") }, { replace: true });
    },
    [location.search, navigate],
  );

  return [lines, setLines];
};
