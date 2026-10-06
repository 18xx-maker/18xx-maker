import { Component, Suspense, lazy, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

// The editor and its parser load when the section is first opened. A chunk that
// fails to load shows a retry instead of breaking the panel.
class Boundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const Failed = ({ retry }) => {
  const { t } = useTranslation();
  return (
    <div role="alert" className="flex flex-col items-start gap-2">
      <p>{t("jsonEditor.loadFailed")}</p>
      <Button type="button" variant="outline" onClick={retry}>
        {t("jsonEditor.retry")}
      </Button>
    </div>
  );
};

const load = () => lazy(() => import("@/components/editPanel/JsonEditor"));

const JsonSection = ({ game }) => {
  const [Editor, setEditor] = useState(load);

  return (
    <Boundary key={Editor} fallback={<Failed retry={() => setEditor(load)} />}>
      <Suspense fallback={null}>
        <Editor game={game} />
      </Suspense>
    </Boundary>
  );
};

export default JsonSection;
