import clsx from "clsx";
import { createElement } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router";
import remarkFlexibleContainers from "remark-flexible-containers";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";

import { dissoc, startsWith } from "ramda";

import Code from "@/components/Code";

import capability from "@/util/capability";
import rehypeHeadingIds from "@/util/headingIds";

const clean = dissoc("node");

const ElectronImage = (props) => {
  // Images sit inline and left aligned (Tailwind would make them blocks). A
  // page can float them with its own className (see Home).
  const className = "inline max-w-full";
  if (capability.electron) {
    return (
      <img
        alt={props.title || props.src}
        {...clean(props)}
        src={`.${props.src}`}
        className={className}
      />
    );
  }

  return (
    <img
      className={className}
      alt={props.title || props.src}
      {...clean(props)}
    />
  );
};

const LocalLink = (props) => {
  const pass = {
    ...clean(props),
    className: "text-primary-foreground underline underline-offset-4",
  };
  if (/^\/(?!\/)/.test(props.href) || startsWith("?", props.href)) {
    return <Link to={props.href} {...pass} />;
  }

  return <a target="_blank" rel="noreferrer" {...pass} />;
};

const md = (element, className) => {
  const comp = (props) => {
    return createElement(element, {
      ...clean(props),
      className: clsx(props.className, className),
    });
  };
  comp.displayName = element;
  return comp;
};

// A heading has an id (see rehypeHeadingIds) and a # link that shows on hover
// or keyboard focus and points at it.
const heading = (element, className) => {
  const comp = (props) => {
    const { children, id, ...rest } = clean(props);
    return createElement(
      element,
      { ...rest, id, className: clsx(className, "group relative") },
      id && (
        <Link
          to={{ hash: id }}
          aria-label={`#${id}`}
          className="absolute -left-6 text-muted-foreground no-underline opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        >
          #
        </Link>
      ),
      children,
    );
  };
  comp.displayName = element;
  return comp;
};

const components = {
  h1: heading(
    "h1",
    "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl not-first:mt-6",
  ),
  h2: heading(
    "h2",
    "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 not-first:mt-6",
  ),
  h3: heading(
    "h3",
    "scroll-m-20 text-2xl font-semibold tracking-tight not-first:mt-6",
  ),
  h4: heading(
    "h4",
    "scroll-m-20 text-xl font-semibold tracking-tight not-first:mt-6",
  ),
  h5: heading(
    "h5",
    "scroll-m-20 text-lg font-semibold tracking-tight not-first:mt-6",
  ),
  h6: heading(
    "h6",
    "scroll-m-20 text-md font-semibold tracking-tight not-first:mt-6",
  ),
  div: md("div", "leading-7 not-first:mt-6"),
  p: md("p", "leading-7 not-first:mt-6"),
  ul: md("ul", "my-6 ml-6 list-disc [&>li]:mt-2"),
  a: LocalLink,
  img: ElectronImage,
  table: md("table", "w-full"),
  tr: md("tr", "m-0 border-t p-0 even:bg-muted"),
  th: md(
    "th",
    "border px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right",
  ),
  td: md(
    "td",
    "border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right",
  ),
  pre: md("pre", ""),
  code: (props) => {
    const { children, className, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");

    if (match) {
      return (
        <Code
          {...clean(rest)}
          PreTag="div"
          language={match[1]}
          className="rounded-lg"
        >
          {String(children).replace(/\n$/, "")}
        </Code>
      );
    }

    const classes = clsx(className, "rounded-md p-1 bg-accent");
    return (
      <code {...clean(rest)} className={classes}>
        {children}
      </code>
    );
  },
};

const Markdown = ({ className, ...pass }) => {
  return (
    <div
      className={clsx(
        "p-4 max-w-prose bg-background text-foreground",
        className,
      )}
    >
      <ReactMarkdown
        components={components}
        rehypePlugins={[rehypeHeadingIds]}
        remarkPlugins={[
          [
            remarkFlexibleContainers,
            {
              containerClassName: (type) => {
                switch (type) {
                  case "siteonly":
                    return ["electron:hidden"];
                  default:
                    return [];
                }
              },
            },
          ],
          remarkGfm,
          remarkAlert,
          remarkGemoji,
        ]}
        {...pass}
      />
    </div>
  );
};

export default Markdown;
