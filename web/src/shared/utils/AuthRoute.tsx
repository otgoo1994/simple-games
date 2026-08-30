import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface AuthRouteProps {
  children: ReactNode;
}

export const AuthRoute = ({ children }: AuthRouteProps) => {
  const userInfo = localStorage.getItem('loggedUser');
  return userInfo ? <Navigate to="/" /> : children;
};
