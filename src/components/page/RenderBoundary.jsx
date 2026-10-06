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

// With the edit panel open, a game with a part the pages cannot draw (an edit
// that fits the JSON but not the schema) must not take the panel with it. The
// page is drawn again as soon as the game, the config or the page changes.
// Without the panel, and in render mode, the error goes on to the route error
// page (which offers to reset the config) or fails the export.
class RenderBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error: { value: error } };
  }

  componentDidUpdate(previous) {
    const { game, config, pathname } = this.props;
    if (
      this.state.error &&
      (previous.game !== game ||
        previous.config !== config ||
        previous.pathname !== pathname)
    ) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    if (!this.props.active) throw this.state.error.value;
    return <Notice />;
  }
}

export default RenderBoundary;
