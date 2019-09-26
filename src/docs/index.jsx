import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Redirect, useParams } from "react-router-dom";
import Nav from "./Nav";

import "./docs.scss";

const flatten = (text, child) => {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text)
};

const HeadingRenderer = props => {
  var children = React.Children.toArray(props.children)
  var text = children.reduce(flatten, '')
  var slug = text.toLowerCase().replace(/\W/g, '-')
  return React.createElement('h' + props.level, {id: slug}, props.children)
};

const Docs = () => {
  let params = useParams();
  let id = params.id || "index";

  let doc = null;
  let redirect = false;
  let [source, setSource] = useState(null);

  try {
    doc = require(`./${id}.md`);
  } catch (e) {
    redirect = true;
  }

  useEffect(() => {
    if (doc) fetch(doc).then(result => result.text()).then(setSource);
  }, [doc]);

  if (redirect) return <Redirect to="/docs"/>;

  return (
    <div className="docs">
      <Nav/>
      <ReactMarkdown source={source} renderers={{heading: HeadingRenderer}}/>
    </div>
  );
};

export default Docs;
