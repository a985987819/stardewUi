import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Home from '../pages/Home'
import Guide from '../pages/Guide'
import Components from '../pages/Components'
import ButtonDemo from '../pages/ButtonDemo'
import CardDemo from '../pages/CardDemo'
import DialogDemo from '../pages/DialogDemo'
import TypewriterDemo from '../pages/TypewriterDemo'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'guide', element: <Guide /> },
      { path: 'components', element: <Components /> },
      { path: 'components/button', element: <ButtonDemo /> },
      { path: 'components/card', element: <CardDemo /> },
      { path: 'components/dialog', element: <DialogDemo /> },
      { path: 'components/typewriter', element: <TypewriterDemo /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
