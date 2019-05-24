import React from "react";
import { Redirect } from "react-router-dom";

const About = ({ match }) => <Redirect to={`/${match.params.game}/map`}/>;

export default About;
