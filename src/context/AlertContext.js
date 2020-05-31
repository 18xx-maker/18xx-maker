import React from "react";

const noAlert = { open: false };

const AlertContext = React.createContext({ alert: noAlert });

export const useAlert = () => {
  const [alert, setAlert] = React.useState(noAlert);

  return {
    alert,
    sendAlert: (type, message) => setAlert({ open: true,
                                             type,
                                             message }),
    closeAlert: () => setAlert(noAlert)
  };
};

export default AlertContext;
