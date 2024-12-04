import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

import { trackEvent } from "@/util/analytics";
import capability from "@/util/capability";

const File = ({ data, mime, filename, ...pass }) => {
  const { t } = useTranslation();
  const location = useLocation();
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

  const eventHandler = () => trackEvent("download", location);

  return (
    <Button
      disabled={!dataURL}
      onClick={eventHandler}
      variant="outline"
      {...pass}
      asChild
    >
      <a download={filename} href={dataURL}>
        <Download />
        {t(verb)} {filename}
      </a>
    </Button>
  );
};

export default File;
