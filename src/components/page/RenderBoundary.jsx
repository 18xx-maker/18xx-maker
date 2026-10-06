import { Component } from "react";
import { useTranslation } from "react-i18next";

const Notice = () => {
  const { t } = useTranslation();
  return (
    <p
      role="alert"
      data-testid="render-error"
      className="print:hidden m-4 rounded-md border border-destructive bg-background p-4 text-destructive"
    >
      {t("jsonEditor.renderError")}
    </p>
  );
};

// A game with a part the pages cannot draw (an edit that fits the JSON but not
// the schema) must not take the edit panel with it. The page is drawn again
// as soon as the game changes.
class RenderBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous) {
    if (this.state.failed && previous.game !== this.props.game) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? <Notice /> : this.props.children;
  }
}

export default RenderBoundary;
