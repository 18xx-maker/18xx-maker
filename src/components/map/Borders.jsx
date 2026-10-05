import { strokedPaths } from "@/components/map/StrokedPath";

const Borders = ({ data }) => strokedPaths(data.borders, data, "border", true);

export default Borders;
