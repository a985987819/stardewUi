import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Home from '../pages/Home'
import Guide from '../pages/Guide'
import Components from '../pages/Components'
import ButtonDemo from '../pages/ButtonDemo'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'guide', element: <Guide /> },
      { path: 'components', element: <Components /> },
      { path: 'components/button', element: <ButtonDemo /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
