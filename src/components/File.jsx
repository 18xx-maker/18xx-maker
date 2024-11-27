import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import DownloadIcon from "@mui/icons-material/GetApp";
import Button from "@mui/material/Button";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import capability from "@/util/capability";

const File = ({ data, mime, list, filename }) => {
  const { t } = useTranslation();
  const [dataURL, setDataURL] = useState(null);

  const verb = capability.electron ? "save" : "download";
  const type = mime || "application/json";

  useEffect(() => {
    const encoder = new TextEncoder();

    const json = JSON.stringify(data, null, 2);
    const bytes = encoder.encode(json);
    const reader = new FileReader();
    reader.onload = () => setDataURL(reader.result);
    reader.onerror = () => console.error(reader.error);
    reader.readAsDataURL(new window.File([bytes], "", { type }));
  }, [data, type]);

  if (!dataURL) {
    return null;
  }

  if (list) {
    return (
      <ListItemButton component="a" download={filename} href={dataURL}>
        <ListItemIcon>
          <DownloadIcon color="primary" />
        </ListItemIcon>
        <ListItemText primary={t(verb)} secondary={filename} />
      </ListItemButton>
    );
  }

  return (
    <Button
      download={filename}
      startIcon={<DownloadIcon />}
      variant="contained"
      color="primary"
      href={dataURL}
    >
      {t(verb)} {filename}
    </Button>
  );
};

export default File;
