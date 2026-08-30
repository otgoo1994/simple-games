import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import { PrivateRoute, AuthRoute } from "~/shared/utils";

const HomePage = lazy(() =>
  import("~/pages/home").then((module) => ({ default: module.HomePage })),
);

const Layout = lazy(() =>
  import("~/features/layouts").then((module) => ({ default: module.Layout })),
);

type CustomChildRouteObject = RouteObject & {
  title?: string;
  auth?: boolean;
};

type CustomRouteObject = RouteObject & {
  title?: string;
  auth?: boolean;
  children?: CustomChildRouteObject[];
};

export const routes: CustomRouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        title: "Home",
        element: <HomePage />,
      },
    ],
  },
];
