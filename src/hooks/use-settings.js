import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { prop } from "ramda";

import { createSetSettings } from "@/state";

export const useSettings = () => {
  const dispatch = useDispatch();
  const settings = useSelector(prop("settings"));
  const setSettings = useCallback(
    (settings) => {
      dispatch(createSetSettings(settings));
    },
    [dispatch],
  );

  return [settings, setSettings];
};
