import React, { createContext, useState, useEffect, useContext } from "react";

export const UserContext = createContext(undefined);

const UserContextProvider = ({ children }) => {
  const storedUser = localStorage.getItem("userInfo");
  const [userInfo, setUserInfo] = useState(storedUser ? JSON.parse(storedUser) : null);

  useEffect(() => {
    if (userInfo) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    } else {
      localStorage.removeItem("userInfo");
    }
  }, [userInfo]);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};

export default UserContextProvider;
