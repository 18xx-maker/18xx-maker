import React, { useState, useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import startsWith from "ramda/src/startsWith";

import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import ReactMarkdown from "react-markdown";
import isEmpty from "ramda/src/isEmpty";

import { isElectron } from "../util";

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  page: {
    overflow: 'auto',
    margin: theme.spacing(4, 0),
    padding: theme.spacing(2, 2, 0, 2),

    '& p': {
      marginBottom: theme.spacing(2)
    },

    '& code': {
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(0.5, 1),
      backgroundColor: theme.palette.grey[300],
      whiteSpace: 'pre',
      fontFamily: 'monospace'
    },

    '& pre': {
      whiteSpace: 'pre',

      '& > code': {
        display: 'block',
        padding: theme.spacing(1, 2),
        marginBottom: theme.spacing(2)
      }
    }
  }
}));

const Heading = (props) => {
  switch(props.level) {
    case 1:
      return <Typography variant="h4" gutterBottom {...props}/>;
    case 2:
      return <Typography variant="h5" gutterBottom {...props}/>;
    case 3:
      return <Typography variant="h6" gutterBottom {...props}/>;
    case 4:
      return <Typography variant="subtitle1" gutterBottom {...props}/>;
    default:
      return <Typography variant="caption" gutterBottom paragraph {...props}/>;
  }
};

const ElectronImage = (props) => {
  if (isElectron) {
    return <img alt={props.title || props.src} {...props} src={`.${props.src}`}/>;
  }

  return <img alt={props.title || props.src} {...props}/>;
};

const LocalLink = (props) => {
  if (startsWith('?', props.href)) {
    return <Link component={RouterLink} to={props.href} {...props}/>;
  }

  if (startsWith('http', props.href) && isElectron) {
    let handler = (e) => {
      e.preventDefault();
      const { shell } = window.require('electron');
      shell.openExternal(props.href);
    };
    return <Link onClick={handler} {...props}/>;
  }

  return <Link target="_blank" rel="noreferrer" {...props} />;
}

const components = {
  h1: (props) => Heading({ level: 1, ...props }),
  h2: (props) => Heading({ level: 2, ...props }),
  h3: (props) => Heading({ level: 3, ...props }),
  h4: (props) => Heading({ level: 4, ...props }),
  h5: (props) => Heading({ level: 5, ...props }),
  h6: (props) => Heading({ level: 6, ...props }),
  p: (props) => <Typography variant="body1" {...props}/>,
  li: (props) => <li><Typography component="span" children={props.children}/></li>,
  a: LocalLink,
  img: ElectronImage
};

const mds = import.meta.glob('./docs/**/*.md', { eager: true, import: 'default', query: '?raw' });

const Docs = () => {
  const { i18n } = useTranslation();
  const classes = useStyles();
  const location = useLocation();

  const language = i18n.languages[0];

  const pathname = location.pathname.replace(/\/docs\/?/, '');
  const file = isEmpty(pathname) ? "index" : pathname;
  const source = mds[`./docs/${file}.${language}.md`];

  return (
    <Container maxWidth="md">
      <Paper elevation={5} className={classes.page}>
        <ReactMarkdown components={components}>{source}</ReactMarkdown>
      </Paper>
    </Container>
  );
};

export default Docs;
