import React from "react";
import Button from "@material-ui/core/Button";
import DownloadIcon from '@material-ui/icons/GetApp';

import is from "ramda/src/is";

const File = (props) => {
  const mime = props.mime || "application/json";

  let data = props.data;
  if (is(Object, data)) {
    data = JSON.stringify(data, null, 2);
  }
  if (is(String, data)) {
    data = new Buffer(data);
  }
  if (is(Buffer, data)) {
    data = data.toString('base64');
  }

  return <Button download={props.filename}
                 startIcon={<DownloadIcon/>}
                 variant="contained"
                 color="primary"
                 href={`data:${mime};base64,${data}`}
                 {...props}/>
};

export default File;
