// eslint-disable-next-line import/no-extraneous-dependencies
import { useRoutes } from 'react-router-dom';
import { routes } from './routes';

const Routes = () => {
  return useRoutes(routes);
};

export default Routes;
