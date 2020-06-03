import React from 'react';
import ReactDOM from 'react-dom';

import './i18n';
import App from './App';
import { StaticRouter } from "react-router";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<StaticRouter location="/"><App/></StaticRouter>, div);
  ReactDOM.unmountComponentAtNode(div);
});
