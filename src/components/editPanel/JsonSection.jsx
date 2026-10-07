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
// Mounts share one component: a new one per mount would suspend every time the
// editor starts over. A retry replaces it, so a failed load does not stay
// failed for every later mount.
let shared = load();

// lens: the part of the game to edit, the whole game without one (JsonEditor)
const JsonSection = ({ game, lens }) => {
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
        <Editor game={game} lens={lens} />
      </Suspense>
    </Boundary>
  );
};

export default JsonSection;
