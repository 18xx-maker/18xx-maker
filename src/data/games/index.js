import game_1800 from "./1800";
import game_1817 from "./1817";
import game_1830 from "./1830";
import game_1832 from "./1832";
import game_1834 from "./1834";
import game_1836jr_30 from "./1836jr-30";
import game_1836jr_56 from "./1836jr-56";
import game_1846 from "./1846";
import game_1848 from "./1848";
import game_1849 from "./1849";
import game_1857 from "./1857";
import game_1860 from "./1860";
import game_1867 from "./1867";
import game_1868 from "./1868";
import game_1870 from "./1870";
import game_1879 from "./1879";
import game_1886 from "./1886";
import game_1889 from "./1889";
import game_1890 from "./1890";
import game_1891 from "./1891";
import game_1899 from "./1899";
import game_18AL from "./18AL";
import game_18CLE from "./18CLE";
import game_18EB from "./18EB";
import game_18EU from "./18EU";
import game_18NK from "./18NK";
import game_18SS from "./18SS";
import game_18SY from "./18SY";
import game_18Chesapeake from "./18Chesapeake";
import game_18Mex from "./18Mex";
import game_FourthAge from "./FourthAge";
import game_Harzbahn from "./Harzbahn";

let all_games = {
  "1800": game_1800,
  "1817": game_1817,
  "1830": game_1830,
  "1832": game_1832,
  "1834": game_1834,
  "1836jr-30": game_1836jr_30,
  "1836jr-56": game_1836jr_56,
  "1846": game_1846,
  "1848": game_1848,
  "1849": game_1849,
  "1857": game_1857,
  "1860": game_1860,
  "1867": game_1867,
  "1868": game_1868,
  "1870": game_1870,
  "1879": game_1879,
  "1886": game_1886,
  "1889": game_1889,
  "1890": game_1890,
  "1891": game_1891,
  "1899": game_1899,
  "18AL": game_18AL,
  "18CLE": game_18CLE,  
  "18EB": game_18EB,
  "18EU": game_18EU,
  "18NK": game_18NK,
  "18SS": game_18SS,
  "18SY": game_18SY,
  "18Chesapeake": game_18Chesapeake,
  "18Mex": game_18Mex,
  FourthAge: game_FourthAge,
  Harzbahn: game_Harzbahn
};

let public_games = {
  "1800": game_1800,
  "1830": game_1830,
  "1836jr-30": game_1836jr_30,
  "1836jr-56": game_1836jr_56,
  "1886": game_1886,
  "1889": game_1889,
  "1890": game_1890,
  "18AL": game_18AL,
  "18EB": game_18EB
};

export default (process.env.REACT_APP_ONLY_PUBLIC_GAMES ? public_games : all_games);
