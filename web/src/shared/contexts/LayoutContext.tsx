import { createContext, useContext, useState, useEffect } from 'react';
import { LoggedUserType } from '~/entities/common';

type LayoutContextType = {
  loggedUser: LoggedUserType | null;
  setLoggeduser: (user: LoggedUserType | null) => void;
  userInfo: any;
  setUserInfo: (user: any) => void;
};

const LayoutContext = createContext<LayoutContextType>({
  loggedUser: null,
  setLoggeduser: () => {},
  userInfo: null,
  setUserInfo: () => {},
});

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loggedUser, setLoggeduser] = useState<LoggedUserType | null>(() => {
    const stored = localStorage.getItem('loggedUser');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (loggedUser) {
      localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
    } else {
      localStorage.removeItem('loggedUser');
    }
  }, [loggedUser]);

  return (
    <LayoutContext.Provider value={{ loggedUser, setLoggeduser, userInfo, setUserInfo }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);
