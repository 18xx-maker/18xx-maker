import { Component } from "react";

import RouteError from "@/components/RouteError";

import { useLocation } from "@/router";

// Shows the error of a page that fails to render in its place. A change of
// resetKey (the location) clears the error, so leaving the page works.
class Boundary extends Component {
  state = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) {
      return { error: null, resetKey: props.resetKey };
    }
    return null;
  }

  render() {
    if (this.state.error) return <RouteError error={this.state.error} />;
    return this.props.children;
  }
}

const RouteErrorBoundary = ({ children }) => {
  const { pathname, search } = useLocation();
  return <Boundary resetKey={`${pathname}${search}`}>{children}</Boundary>;
};

export default RouteErrorBoundary;
