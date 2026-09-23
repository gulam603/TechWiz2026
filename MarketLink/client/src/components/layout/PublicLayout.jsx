import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AnnouncementBar from './AnnouncementBar';
import ChatWidget from '../chat/ChatWidget';

export default function PublicLayout({ footer = true }) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {!isAdmin && <AnnouncementBar />}
      <Navbar />
      <main id="main" className="page-enter" key={pathname.split('/')[1]}>
        <Outlet />
      </main>
      {footer && !isAdmin && <Footer />}
      {!isAdmin && <ChatWidget />}
    </>
  );
}
