import React from "react";

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

const Loading = () => {
  return <Backdrop open={true}>
           <CircularProgress color="primary"/>
         </Backdrop>
};

export default Loading;
