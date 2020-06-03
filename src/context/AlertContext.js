import React, { useContext } from "react";

// Initial context is just a send method that does nothing
const AlertContext = React.createContext(null);

export const useAlert = () => {
  const sendAlert = useContext(AlertContext);
  console.log("Context:", sendAlert);
  return sendAlert;
};

export default AlertContext;
