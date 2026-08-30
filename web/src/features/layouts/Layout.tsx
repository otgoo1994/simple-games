/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-constructed-context-values */
import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Alert } from './Alert';

export const Layout = () => {
  return (
    <div className="">
      <div className="">
        <Outlet />
      </div>
    </div>
  );
};
