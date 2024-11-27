import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";

const Markdown = (props) => {
  return <ReactMarkdown remarkPlugins={[remarkGfm, remarkAlert]} {...props} />;
};

export default Markdown;
