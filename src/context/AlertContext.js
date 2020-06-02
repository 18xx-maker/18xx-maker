import React, { useContext } from "react";

// Initial context is just a send method that does nothing
const AlertContext = React.createContext(() => {});

export const useAlert = () => {
  return useContext(AlertContext);
}

export default AlertContext;
