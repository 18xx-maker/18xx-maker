import game_1800 from "./1800";
import game_1828 from "./1828";
import game_1830 from "./1830";
import game_1834 from "./1834";
import game_1846 from "./1846";
import game_1849 from "./1849";
import game_1857 from "./1857";
import game_1860 from "./1860";
import game_1870 from "./1870";
import game_1873 from "./1873";
import game_1886 from "./1886";
import game_1889 from "./1889";
import game_1890 from "./1890";
import game_1899 from "./1899";
import game_18AL from "./18AL";
import game_18EU from "./18EU";
import game_18Mex from "./18Mex";
import game_FourthAge from "./FourthAge";

let games = {
  "1800": game_1800,
  "1830": game_1830,
  "1834": game_1834,
  "1846": game_1846,
  "1849": game_1849,
  "1857": game_1857,
  "1860": game_1860,
  "1870": game_1870,
  "1873": game_1873,
  "1886": game_1886,
  "1889": game_1889,
  "1890": game_1890,
  "18AL": game_18AL,
  "18EU": game_18EU,
  "18Mex": game_18Mex
};

if(process.env.REACT_APP_ALL_GAMES) {
  games = {
    ...games,
    "1828": game_1828,
    "1899": game_1899,
    "FourthAge": game_FourthAge
  };
}

export default games;
