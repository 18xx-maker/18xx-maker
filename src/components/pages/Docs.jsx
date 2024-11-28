import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation } from "react-router";

import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";

import { dissoc, isEmpty, startsWith } from "ramda";

import Markdown from "@/components/Markdown";
import { SyntaxHighlighter, style } from "@/components/SyntaxHighlighter";
import capability from "@/util/capability";

const removeNode = dissoc("node");

const useStyles = makeStyles((theme) => ({
  page: {
    overflow: "auto",
    margin: theme.spacing(2, 0),
    padding: theme.spacing(2, 2, 0, 2),

    "& p": {
      marginBottom: theme.spacing(2),
    },

    "& p a": {
      textDecoration: "underline",
    },
    "& p a:visited": {
      color: theme.palette.primary.main,
    },

    "& code": {
      padding: theme.spacing(0.4, 0.8, 0.3, 0.8),

      borderRadius: theme.shape.borderRadius,
      whiteSpace: "pre",
      background: "rgb(245, 242, 240)",
      textShadow: "white 0px 1px",
      fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
      color: "black",
      fontSize: "1em",
      fontWeight: "bold",
    },

    "& pre": {
      whiteSpace: "pre",

      "& div": {
        borderRadius: theme.shape.borderRadius,
      },

      "& code": {
        padding: 0,
      },

      "& > code": {
        display: "block",
        margin: "0.5em 0px",
        overflow: "auto",
        padding: "1em",
        textAlign: "left",
        wordSpacing: "normal",
        wordBreak: "normal",
        overflowWrap: "normal",
        lineHeight: 1.5,
        tabSize: 4,
        hyphens: "none",
      },
    },

    "& table": {
      marginBottom: theme.spacing(3),
      "& th": {
        fontWeight: "bold",
      },
      "& td, & th": {
        textAlign: "left",
      },
    },
  },
}));

const Heading = (props) => {
  switch (props.level) {
    case 1:
      return <Typography variant="h4" gutterBottom {...removeNode(props)} />;
    case 2:
      return <Typography variant="h5" gutterBottom {...removeNode(props)} />;
    case 3:
      return <Typography variant="h6" gutterBottom {...removeNode(props)} />;
    case 4:
      return (
        <Typography variant="subtitle1" gutterBottom {...removeNode(props)} />
      );
    default:
      return (
        <Typography
          variant="caption"
          gutterBottom
          paragraph
          {...removeNode(props)}
        />
      );
  }
};

const ElectronImage = (props) => {
  if (capability.electron) {
    return (
      <img
        alt={props.title || props.src}
        {...removeNode(props)}
        src={`.${props.src}`}
      />
    );
  }

  return <img alt={props.title || props.src} {...removeNode(props)} />;
};

const LocalLink = (props) => {
  if (startsWith("/", props.href) || startsWith("?", props.href)) {
    return (
      <Link
        component={RouterLink}
        to={props.href}
        {...removeNode(props)}
        underline="hover"
      />
    );
  }

  return (
    <Link
      target="_blank"
      rel="noreferrer"
      {...removeNode(props)}
      underline="hover"
    />
  );
};

const prepareForMD = (Component, extraProps = {}) => {
  const wrapper = (props) => (
    <Component {...{ ...extraProps, ...removeNode(props) }} />
  );
  return wrapper;
};

const components = {
  h1: (props) => Heading({ level: 1, ...removeNode(props) }),
  h2: (props) => Heading({ level: 2, ...removeNode(props) }),
  h3: (props) => Heading({ level: 3, ...removeNode(props) }),
  h4: (props) => Heading({ level: 4, ...removeNode(props) }),
  h5: (props) => Heading({ level: 5, ...removeNode(props) }),
  h6: (props) => Heading({ level: 6, ...removeNode(props) }),
  p: (props) => <Typography variant="body1" {...removeNode(props)} />,
  li: (props) => (
    <li>
      <Typography component="span">{props.children}</Typography>
    </li>
  ),
  a: LocalLink,
  img: ElectronImage,
  table: prepareForMD(Table, { size: "small" }),
  thead: prepareForMD(TableHead),
  tbody: prepareForMD(TableBody),
  th: prepareForMD(TableCell),
  tr: prepareForMD(TableRow),
  td: prepareForMD(TableCell),
  code: (props) => {
    const { children, className, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <SyntaxHighlighter
        {...removeNode(rest)}
        PreTag="div"
        style={style}
        language={match[1]}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code {...removeNode(rest)} className={className}>
        {children}
      </code>
    );
  },
};

const mds = import.meta.glob("../../docs/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const Docs = () => {
  const { i18n } = useTranslation();
  const classes = useStyles();
  const location = useLocation();

  const language = i18n.languages[0];

  const pathname = location.pathname.replace(/\/docs\/?/, "");
  const file = isEmpty(pathname) ? "index" : pathname;
  const source = mds[`../../docs/${file}.${language}.md`];

  return (
    <Container maxWidth="md">
      <Paper data-testid="docs" elevation={5} className={classes.page}>
        <Markdown components={components}>{source}</Markdown>
      </Paper>
    </Container>
  );
};

export default Docs;
