import { Component, Suspense, lazy, useMemo, useState } from "react";
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
// The first attempt shares one component: a new one per mount would suspend
// every time the editor starts over. A retry gets its own, a failed one stays
// failed.
const first = load();

// lens: the part of the game to edit, the whole game without one (JsonEditor)
const JsonSection = ({ game, lens }) => {
  const [attempt, setAttempt] = useState(0);
  // A new lazy component per attempt: the failed one stays failed
  const Editor = useMemo(() => (attempt === 0 ? first : load()), [attempt]);

  return (
    <Boundary
      key={attempt}
      fallback={<Failed retry={() => setAttempt((n) => n + 1)} />}
    >
      <Suspense fallback={null}>
        <Editor game={game} lens={lens} />
      </Suspense>
    </Boundary>
  );
};

export default JsonSection;
