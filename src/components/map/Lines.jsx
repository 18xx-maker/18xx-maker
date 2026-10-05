import { strokedPaths } from "@/components/map/StrokedPath";

const Lines = ({ data }) => strokedPaths(data.lines, data, "line", false);

export default Lines;
