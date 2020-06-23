import React from "react";

import Backdrop from '@material-ui/core/Backdrop';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';

import { makeStyles } from '@material-ui/core/styles';

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
