import React, { useState, useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import startsWith from "ramda/src/startsWith";

import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import ReactMarkdown from "react-markdown";
import isEmpty from "ramda/src/isEmpty";

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

const LocalLink = (props) => {
  if (startsWith('?', props.href)) {
    return <Link component={RouterLink} to={props.href} {...props}/>;
  }

  return <Link {...props}/>;
}

const renderers = {
  heading: Heading,
  paragraph: (props) => <Typography variant="body1" {...props}/>,
  listItem: (props) => <li><Typography component="span" children={props.children}/></li>,
  link: LocalLink
};

const Docs = () => {
  const classes = useStyles();
  const location = useLocation();
  const [source, setSource] = useState(null);

  const pathname = location.pathname.replace(/\/docs\/?/, '');
  const file = isEmpty(pathname) ? "index" : pathname;

  useEffect(() => {
    import("./docs/" + file + ".md")
      .then(x => x.default)
      .then(fetch)
      .then(result => result.text())
      .then(setSource)
      .catch(err => console.log(file, err))
  }, [file])

  return (
    <Container maxWidth="md">
      <Paper elevation={5} className={classes.page}>
        <ReactMarkdown source={source} renderers={renderers}/>
      </Paper>
    </Container>
  );
};

export default Docs;
