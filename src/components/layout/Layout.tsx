import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import './Layout.css'

function Layout() {
  return (
    <div className="doc-layout">
      <Header />
      <Sidebar />
      <main className="doc-main">
        <div className="doc-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
