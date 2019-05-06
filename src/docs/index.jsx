import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Redirect } from "react-router-dom";
import Nav from "./Nav";

import "./docs.scss";

const Docs = ({match}) => {
  let id = match.params.id || "index";

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
  }, [match]);

  if (redirect) return <Redirect to="/docs"/>;

  return <div className="docs"><Nav/><ReactMarkdown source={source}/></div>;
};

export default Docs;
