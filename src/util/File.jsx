import React from "react";
import { useTranslation } from 'react-i18next';

import Button from "@mui/material/Button";
import DownloadIcon from '@mui/icons-material/GetApp';
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import is from "ramda/src/is";
import { isElectron } from "../util";

const File = (props) => {
  const { t } = useTranslation();

  const mime = props.mime || "application/json";
  const verb = isElectron ? "save" : "download";

  let data = props.data;
  if (is(Object, data)) {
    data = JSON.stringify(data, null, 2);
  }
  if (is(String, data)) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);
    data = btoa(String.fromCharCode(...bytes));
  }

  if (props.list) {
    return <ListItemButton component="a"
                           download={props.filename}
                           href={`data:${mime};base64,${data}`}>
             <ListItemIcon>
               <DownloadIcon color="primary"/>
             </ListItemIcon>
             <ListItemText primary={t(verb)}
                           secondary={props.filename}/>
           </ListItemButton>;
  }

  return <Button download={props.filename}
                 startIcon={<DownloadIcon/>}
                 variant="contained"
                 color="primary"
                 href={`data:${mime};base64,${data}`}>
           {t(verb)} {props.filename}
         </Button>
};

export default File;
