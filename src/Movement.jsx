import React from "react";
import * as R from "ramda";

const Movement = ({ movement }) => {
  if (!movement) {
    return null;
  }

  return (
    <div className="Movement">
      <div className="Movement__up">
        {R.addIndex(R.map)(
          (i, index) => <div key={`movement-up-${index}`} className="Movement--item">{i}</div>,
          movement.up
        )}
      </div>
      <div className="Movement__down">
        {R.addIndex(R.map)(
          (i, index) => <div key={`movement-down-${index}`} className="Movement--item">{i}</div>,
          movement.down
        )}
      </div>
      <div className="Movement__left">
        {R.addIndex(R.map)(
          (i, index) => <div key={`movement-left-${index}`} className="Movement--item">{i}</div>,
          movement.left
        )}
      </div>
      <div className="Movement__right">
        {R.addIndex(R.map)(
          (i, index) => <div key={`movement-right-${index}`} className="Movement--item">{i}</div>,
          movement.right
        )}
      </div>
      <div className="Movement__center">
        <i className="fal fa-long-arrow-up" />
        <i className="fal fa-long-arrow-down" />
        <i className="fal fa-long-arrow-right" />
        <i className="fal fa-long-arrow-left" />
      </div>
    </div>
  );
};

export default Movement;
