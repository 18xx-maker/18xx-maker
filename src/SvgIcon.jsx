import React from "react";

import { ReactComponent as certLimit } from "./images/icons/certificate.svg";
import { ReactComponent as bank } from "./images/icons/university.svg";
import { ReactComponent as number } from "./images/icons/user-friends.svg";
import { ReactComponent as capital } from "./images/icons/coins.svg";

import { ReactComponent as exclamation } from "./images/icons/exclamation.svg";
import { ReactComponent as info } from "./images/icons/info.svg";
import { ReactComponent as minus } from "./images/icons/minus.svg";
import { ReactComponent as moneyBillWave } from "./images/icons/money-bill-wave.svg";
import { ReactComponent as percentage } from "./images/icons/percentage.svg";
import { ReactComponent as plus } from "./images/icons/plus.svg";
import { ReactComponent as stop } from "./images/icons/stop.svg";
import { ReactComponent as times } from "./images/icons/times.svg";

const icons = {
  certificate: certLimit,
  certLimit,
  university: bank,
  bank,
  "user-friends": number,
  number,
  coins: capital,
  capital,
  exclamation,
  info,
  minus,
  "money-bill-wave": moneyBillWave,
  percentage,
  plus,
  stop,
  times
};

const SvgIcon = ({name, size, x, y, scale, fill, stroke, style}) => {
  let Tag = icons[name];
  return <Tag width={size || 15}
         height={size || 15}
         x={((x || 0) + 7.5) * (scale || 1)}
         y={((y || 0) + 7.5) * (scale || 1)}
         {...{fill, stroke, style}}
    />
};

export default SvgIcon;
