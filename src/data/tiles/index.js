import brown from "@/data/tiles/brown.json" with { type: "json" };
import gray from "@/data/tiles/gray.json" with { type: "json" };
import green from "@/data/tiles/green.json" with { type: "json" };
import other from "@/data/tiles/other.json" with { type: "json" };
import yellow from "@/data/tiles/yellow.json" with { type: "json" };
import { compileTiles } from "@/util/tiles";

export default compileTiles(yellow, green, brown, gray, other);
