import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import light from "react-syntax-highlighter/dist/esm/styles/prism/coldark-cold";
import dark from "react-syntax-highlighter/dist/esm/styles/prism/coldark-dark";
import prism from "react-syntax-highlighter/dist/esm/styles/prism/prism";

import { useTheme } from "@/context/ThemeProvider";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("bash", bash);

export { SyntaxHighlighter, prism as style };

const Code = (props) => {
  const theme = useTheme();
  const style = theme === "light" ? light : dark;

  return (
    <SyntaxHighlighter
      customStyle={{ margin: "auto" }}
      style={style}
      {...props}
    />
  );
};

export default Code;
