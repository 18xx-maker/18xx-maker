import React from "react";

import Button from "@material-ui/core/Button";
import DownloadIcon from '@material-ui/icons/GetApp';
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import is from "ramda/src/is";
import { isElectron } from "../util";

const File = (props) => {
  const mime = props.mime || "application/json";
  const verb = isElectron ? "Save" : "Download";

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

  if (props.list) {
    return <ListItem button
                     component="a"
                     download={props.filename}
                     href={`data:${mime};base64,${data}`}>
             <ListItemIcon>
               <DownloadIcon/>
             </ListItemIcon>
             <ListItemText primary={verb}
                           secondary={props.filename}/>
           </ListItem>;
  }

  return <Button download={props.filename}
                 startIcon={<DownloadIcon/>}
                 variant="contained"
                 color="primary"
                 href={`data:${mime};base64,${data}`}>
           {verb} {props.filename}
         </Button>
};

export default File;
