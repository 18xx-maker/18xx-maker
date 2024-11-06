import React from "react";

import Backdrop from '@mui/material/Backdrop';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  progress: {
    height: 40,
    width: 40,
    padding: theme.spacing(2)
  }
}));

const Loading = () => {
  const classes = useStyles();

  return <Backdrop open={true}>
           <Paper className={classes.progress}>
             <CircularProgress color="primary"/>
           </Paper>
         </Backdrop>
};

export default Loading;
