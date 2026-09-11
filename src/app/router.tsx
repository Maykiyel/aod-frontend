import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from '@/app/route-table';

const browserRouter = createBrowserRouter(routes);

export function AppRouter() {
  return <RouterProvider router={browserRouter} />;
}
