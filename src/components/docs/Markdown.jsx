import clsx from "clsx";
import { Children, createElement } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router";
import remarkFlexibleContainers from "remark-flexible-containers";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";

import { dissoc, startsWith } from "ramda";

import Shortcuts from "@/components/Shortcuts";
import Code from "@/components/docs/Code";

import capability from "@/util/capability";
import { cn } from "@/util/cn";
import rehypeHeadingIds from "@/util/headingIds";

const clean = dissoc("node");

// Images sit inline and left aligned (Tailwind would make them blocks). A page
// can float them with its own className (see Home). An image with a title
// becomes a figure: the title is its caption and the alt text stays the alt.
// A screenshot of the UI named `<name>-light.png` has a `<name>-dark.png`
// twin, and the one matching the current theme is shown.
const DocImage = (props) => {
  const { title, alt, src, ...rest } = clean(props);
  const path = (file) => (capability.electron ? `.${file}` : file);
  const image = (file, extra) => (
    <img
      alt={alt}
      {...rest}
      src={path(file)}
      className={cn(
        "max-w-full",
        title ? "rounded-lg border bg-white" : "inline",
        extra,
      )}
    />
  );
  const themed = src.endsWith("-light.png");
  const img = themed ? (
    <>
      {image(src, "dark:hidden")}
      {image(src.replace(/-light\.png$/, "-dark.png"), "hidden dark:inline")}
    </>
  ) : (
    image(src)
  );

  if (!title) return img;

  return (
    <figure className="m-0 inline-block max-w-full align-top">
      {img}
      <figcaption className="mt-2 max-w-prose text-sm text-muted-foreground">
        {title}
      </figcaption>
    </figure>
  );
};

// The title of an alert (> [!TIP]) is its icon and the type, shown translated
// as "Tip" instead of the library's uppercase English text.
const ALERT_TYPES = ["note", "tip", "important", "warning", "caution"];

const AlertTitle = ({ type, props }) => {
  const { t } = useTranslation();
  const label = {
    note: t("docs.alert.note"),
    tip: t("docs.alert.tip"),
    important: t("docs.alert.important"),
    warning: t("docs.alert.warning"),
    caution: t("docs.alert.caution"),
  }[type];
  return createElement(
    "p",
    clean(props),
    Children.toArray(props.children)[0],
    label,
  );
};

// A figure is not allowed inside a paragraph
const Paragraph = ({ node, ...props }) => {
  const alert = []
    .concat(node?.properties?.className ?? [])
    .includes("markdown-alert-title");
  const type = node?.children
    ?.find((child) => child.type === "text")
    ?.value?.toLowerCase();
  if (alert && ALERT_TYPES.includes(type)) {
    return <AlertTitle type={type} props={props} />;
  }
  const figure = node?.children?.some(
    (child) => child.tagName === "img" && child.properties?.title,
  );
  return createElement(figure ? "div" : "p", {
    ...clean(props),
    className: clsx(
      props.className,
      "leading-7 not-first:mt-6",
      figure && "flex flex-wrap items-start gap-4",
    ),
  });
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
          data-anchor
          aria-label={`#${id}`}
          className="absolute right-full pr-2 text-base font-normal text-muted-foreground no-underline opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
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
  p: Paragraph,
  ul: md("ul", "my-6 ml-6 list-disc [&>li]:mt-2"),
  a: LocalLink,
  img: DocImage,
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
  pre: (props) =>
    props.children?.props?.className === "language-keybindings"
      ? props.children
      : createElement("pre", clean(props)),
  code: (props) => {
    const { children, className, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");

    // The keybindings come from the same list as the ? dialog
    if (match?.[1] === "keybindings") return <Shortcuts />;

    if (match) {
      return (
        <Code
          {...clean(rest)}
          language={match[1]}
          className="rounded-lg border"
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
      className={cn(
        "p-4 pl-10 max-w-prose bg-background text-foreground",
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
