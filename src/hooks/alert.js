import { useSelector } from "react-redux";
import { prop } from "ramda";

export const useAlert = () => useSelector(prop("alert"));
