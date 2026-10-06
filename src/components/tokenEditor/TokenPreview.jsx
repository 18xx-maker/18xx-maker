import { Component } from "react";

import CompanyToken from "@/components/tokens/CompanyToken";
import Token from "@/components/tokens/Token";

import ColorContext from "@/context/ColorContext";

// A key that changes when the value does, so a boundary tries again
const keyOf = (value) => {
  try {
    return JSON.stringify(value) ?? "";
  } catch {
    return String(Math.random());
  }
};

// A token the Token component cannot draw (an edit that fits the JSON but not
// the schema) shows nothing rather than taking the panel down. It tries again
// once the value it was given changes.
class TokenBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous) {
    if (
      this.state.failed &&
      keyOf(previous.value) !== keyOf(this.props.value)
    ) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// How each place that has a token draws it, so the colors of the theme resolve
// as they do in print: a company through CompanyToken (the colors of the
// companies, the abbreviation as label), a private as Private.jsx does (the
// colors of the companies, a small token with an outline) and a token of the
// game as it is.
const SOURCES = {
  company: {
    viewBox: "-26 -26 52 52",
    draw: ({ token, company }) => (
      <CompanyToken company={{ ...company, token }} />
    ),
  },
  private: {
    viewBox: "-15 -15 30 30",
    draw: ({ token }) => (
      <ColorContext.Provider value="companies">
        <Token {...token} width={15} outlineWidth={token.outlineWidth || 2} />
      </ColorContext.Provider>
    ),
  },
  game: {
    viewBox: "-26 -26 52 52",
    draw: ({ token }) => <Token {...token} />,
  },
};

// The token as an svg of the given source ("company", "private" or "game").
// company is the company of a company token (its abbreviation, color and logo).
const TokenPreview = ({
  source = "game",
  token,
  company,
  className,
  ...props
}) => {
  const { viewBox, draw } = SOURCES[source];
  return (
    <TokenBoundary value={{ token, company }}>
      <svg viewBox={viewBox} className={className} {...props}>
        {draw({ token: token ?? {}, company })}
      </svg>
    </TokenBoundary>
  );
};

export default TokenPreview;
