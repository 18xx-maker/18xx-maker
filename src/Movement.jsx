import React from "react";
import * as R from "ramda";

const Movement = ({ movement }) => {
  if(!movement) {
    return null;
  }

  return (
    <div className="Movement">
      <div className="Movement__up">
        {R.map(i => <div className="Movement--item">{i}</div>, movement.up)}
      </div>
      <div className="Movement__down">
        {R.map(i => <div className="Movement--item">{i}</div>, movement.down)}
      </div>
      <div className="Movement__left">
        {R.map(i => <div className="Movement--item">{i}</div>, movement.left)}
      </div>
      <div className="Movement__right">
        {R.map(i => <div className="Movement--item">{i}</div>, movement.right)}
      </div>
      <div className="Movement__center">
        <i className="fal fa-arrows"/>
      </div>
    </div>
  );
};

export default Movement;
