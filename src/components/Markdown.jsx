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

const clean = dissoc("node");

const ElectronImage = (props) => {
  const className = "float-right pl-2 pb-3";
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
  if (startsWith("/", props.href) || startsWith("?", props.href)) {
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

const components = {
  h1: md(
    "h1",
    "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl [&:not(:first-child)]:mt-6",
  ),
  h2: md(
    "h2",
    "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 [&:not(:first-child)]:mt-6",
  ),
  h3: md(
    "h3",
    "scroll-m-20 text-2xl font-semibold tracking-tight [&:not(:first-child)]:mt-6",
  ),
  h4: md(
    "h4",
    "scroll-m-20 text-xl font-semibold tracking-tight [&:not(:first-child)]:mt-6",
  ),
  h5: md(
    "h5",
    "scroll-m-20 text-lg font-semibold tracking-tight [&:not(:first-child)]:mt-6",
  ),
  h6: md(
    "h6",
    "scroll-m-20 text-md font-semibold tracking-tight [&:not(:first-child)]:mt-6",
  ),
  div: md("div", "leading-7 [&:not(:first-child)]:mt-6"),
  p: md("p", "leading-7 [&:not(:first-child)]:mt-6"),
  ul: md("ul", "my-6 ml-6 list-disc [&>li]:mt-2"),
  a: LocalLink,
  img: ElectronImage,
  table: md("table", "w-full"),
  tr: md("tr", "m-0 border-t p-0 even:bg-muted"),
  th: md(
    "th",
    "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
  ),
  td: md(
    "td",
    "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
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
