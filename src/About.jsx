import React from "react";
import { Redirect, useParams } from "react-router-dom";

const About = () => {
    let params = useParams();
    return (
        <Redirect to={`/${params.game}/map`}/>
    );
};


export default About;
