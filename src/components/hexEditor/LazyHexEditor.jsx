import { Component, Suspense, lazy, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

// The editor loads when the Hex tab first shows the form, as the JSON editor
// does (see JsonSection). A chunk that fails to load shows a retry instead of
// breaking the panel.
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
      <p>{t("hexEditor.form.loadFailed")}</p>
      <Button type="button" variant="outline" onClick={retry}>
        {t("jsonEditor.retry")}
      </Button>
    </div>
  );
};

const load = () => lazy(() => import("@/components/hexEditor/HexEditor"));
// Mounts share one component, a retry replaces it
let shared = load();

const LazyHexEditor = (props) => {
  const [attempt, setAttempt] = useState(0);
  const [Editor, setEditor] = useState(() => shared);
  const retry = () => {
    shared = load();
    setEditor(() => shared);
    setAttempt((n) => n + 1);
  };

  return (
    <Boundary key={attempt} fallback={<Failed retry={retry} />}>
      <Suspense fallback={null}>
        <Editor {...props} />
      </Suspense>
    </Boundary>
  );
};

export default LazyHexEditor;
