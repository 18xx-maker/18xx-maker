import game_1800 from "./1800";
import game_1817 from "./1817";
import game_1825 from "./1825";
import game_1825U1 from "./1825-U1";
import game_1825U2 from "./1825-U2";
import game_1825U3 from "./1825-U3";
import game_1825K1 from "./1825-K1";
import game_1825K3 from "./1825-K3";
import game_1825K5 from "./1825-K5";
import game_1825K6 from "./1825-K6";
import game_1825R1_1 from "./1825-R1.1";
import game_1825R2 from "./1825-R2";
import game_1825K3_1 from "./1825-R3.1";
import game_1825Met from "./1825-Met";
import game_1925DB1 from "./1825-DB1";
import game_1925DB3 from "./1825-DB3";
import game_1925DB5 from "./1825-DB5";
import game_18Misc from "./18Misc";
import game_1830 from "./1830";
import game_1832 from "./1832";
import game_1834 from "./1834";
import game_1836jr_30 from "./1836jr-30";
import game_1836jr_56 from "./1836jr-56";
import game_1836 from "./1836";
import game_1846 from "./1846";
import game_1848 from "./1848";
import game_1849 from "./1849";
import game_1857 from "./1857";
import game_1859 from "./1859";
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
import game_18Test from "./18Test";
import game_18TE from "./18TE";
import game_FourthAge from "./FourthAge";
import game_Harzbahn from "./Harzbahn";
import game_Powerrails from "./Powerrails";

// These games will be available in the docker image and on local versions of
// the site. The name in the string (on the left) needs to be identical to the
// file name (without the .json) in order for command line printing to work.
let all_games = {
  "1800": game_1800,
  "1817": game_1817,
  "1825": game_1825,
  "1825-U1": game_1825U1,
  "1825-U2": game_1825U2,
  "1825-U3": game_1825U3,
  "1825-K1": game_1825K1,
  "1825-K3": game_1825K3,
  "1825-K5": game_1825K5,
  "1825-K6": game_1825K6,
  "1825-R1.1": game_1825R1_1,
  "1825-R2": game_1825R2,
  "1825-R3.1": game_1825K3_1,
  "1825-Met": game_1825Met,
  "1825-DB1": game_1925DB1,
  "1825-DB3": game_1925DB3,
  "1825-DB5": game_1925DB5,
  "1830": game_1830,
  "1832": game_1832,
  "1834": game_1834,
  "1836jr-30": game_1836jr_30,
  "1836jr-56": game_1836jr_56,
  "1836": game_1836,
  "1846": game_1846,
  "1848": game_1848,
  "1849": game_1849,
  "1857": game_1857,
  "1859": game_1859,
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
  "18Misc": game_18Misc,
  "18NK": game_18NK,
  "18SS": game_18SS,
  "18SY": game_18SY,
  "18Chesapeake": game_18Chesapeake,
  "18Mex": game_18Mex,
  "18TE": game_18TE,
  FourthAge: game_FourthAge,
  Harzbahn: game_Harzbahn,
  Powerrails: game_Powerrails,
  "18Test": game_18Test
};

// These games will be available on the public version of the site. Please keep
// the names (in the string on the left) the same as the version above.
let public_games = {
  "1800": game_1800,
  "1830": game_1830,
  "1836jr-30": game_1836jr_30,
  "1836jr-56": game_1836jr_56,
  "1886": game_1886,
  "1889": game_1889,
  "1890": game_1890,
  "18AL": game_18AL,
  "18EB": game_18EB,
  "18TE": game_18TE,
  "18Test": game_18Test
};

export default (process.env.REACT_APP_ONLY_PUBLIC_GAMES ? public_games : all_games);
