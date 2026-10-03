import { useEffect, useState } from "react";

// The highlighter and its languages are a separate chunk, plain text shows
// until it loads
let Highlighted;
export const preloadCode = () =>
  import("@/components/CodeHighlighted").then((module) => {
    Highlighted = module.default;
    return Highlighted;
  });

const Code = ({ children, ...props }) => {
  const [Component, setComponent] = useState(() => Highlighted);

  useEffect(() => {
    if (!Component) {
      let current = true;
      preloadCode().then((loaded) => {
        if (current) setComponent(() => loaded);
      });
      return () => {
        current = false;
      };
    }
  }, [Component]);

  return Component ? (
    <Component {...props}>{children}</Component>
  ) : (
    <pre>
      <code>{children}</code>
    </pre>
  );
};

export default Code;
