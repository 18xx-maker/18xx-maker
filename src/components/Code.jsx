import { Suspense, lazy } from "react";

// The highlighter and its languages are a separate chunk, plain text shows
// until it loads
const CodeHighlighted = lazy(() => import("@/components/CodeHighlighted"));

const Code = ({ children, ...props }) => (
  <Suspense
    fallback={
      <pre>
        <code>{children}</code>
      </pre>
    }
  >
    <CodeHighlighted {...props}>{children}</CodeHighlighted>
  </Suspense>
);

export default Code;
