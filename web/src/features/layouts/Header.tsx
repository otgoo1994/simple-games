import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Menu, X, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLayout } from '~/shared/contexts';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { CommonQuery } from '~/entities/common';
import { timeDistanceWithDays } from '~/shared/utils';

export const Header = () => {
  const [isOpen, setIsOpen] = useState<string | null>(null);
  const [activeLink, setActiveLink] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { loggedUser, setLoggeduser, setUserInfo } = useLayout();

  const { data: userInfo, refetch } = useQuery({
    ...CommonQuery.getLoggedUserInfo(),
    enabled: loggedUser != null,
  });

  useEffect(() => {
    setActiveLink(location.pathname);
    setIsOpen(null);
  }, [location]);

  useEffect(() => {
    if (!userInfo || !userInfo.data) return;
    setUserInfo(userInfo.data);
  }, [userInfo]);

  const showMenu = () => {
    if (!isOpen) {
      setIsOpen('menu');
      return;
    }

    setIsOpen(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('loggedUser');
    queryClient.clear();
    setLoggeduser(null);
    setIsOpen(null);
    navigate('/');
  };

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/list?search=${searchValue}`);
    }
  };

  return (
    <header className="header">
      <div className="header__inner container">
        {/* Logo and Nav */}
        <div className="header__left">
          <div className="header__logo">
            <Link to="/">
              <img src="/images/logo.png" alt="" />
            </Link>
          </div>
        </div>

        <div className="header__middle">
          <nav className="header__nav">
            <Link
              to="/"
              className={`header__nav-link ${activeLink === '/' && 'header__nav-link--active'}`}
            >
              НҮҮР
            </Link>
            <Link
              to="/category"
              className={`header__nav-link ${activeLink === '/category' && 'header__nav-link--active'}`}
            >
              ДААЛГАВАР
            </Link>
            <Link
              to="/calendar"
              className={`header__nav-link ${activeLink === '/calendar' && 'header__nav-link--active'}`}
            >
              МЭДЭЭЛЭЛ
            </Link>
          </nav>
        </div>

        <div className="header__right">
          <div className="header__actions">
            {loggedUser && (
              <div className="profile-container">
                <button
                  title="Profile"
                  className="header__actions-profile no-logged"
                  onClick={showMenu}
                >
                  Hello, {loggedUser.username}
                </button>
                <div className={`profile-menu ${isOpen === 'menu' && 'show'}`}>
                  <ul>
                    <li>
                      Hello, <b>{loggedUser.username}</b>
                    </li>
                    {userInfo && userInfo.data && (
                      <>
                        <li>
                          Багц: <b>{userInfo.data.plan != 1 ? 'VIP' : userInfo.data.plan_name}</b>
                        </li>
                        <li>
                          Үлдсэн хоног: <b>{timeDistanceWithDays(userInfo.data.expires_date)}</b>
                        </li>
                      </>
                    )}

                    <li onClick={() => handleNavigate('/price')}>Эрх сунгах</li>
                    <li onClick={handleLogout}>Logout</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="header__actions__mobile">
            <div className="header__actions-icons">
              <button
                title="Burger"
                className="burger-menu"
                onClick={() => setIsOpen('mobileMenu')}
              >
                <Menu className="icon-v" size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`mobile-menu ${isOpen === 'mobileMenu' && 'show'}`}>
        <div className="mobile-menu-container">
          <div className="dimmed"></div>
          <div className="mobile-menu-body">
            <div className="mobile-menu-body-container">
              <button title="Close" className="mobile-menu-close" onClick={() => setIsOpen(null)}>
                <X className="icon-v" size={20} />
              </button>

              <ul>
                <li>
                  <Link to="/">
                    НҮҮР <ChevronRight className="icon-v" size={20} />
                  </Link>
                </li>
                <li>
                  <Link to="/category">
                    ДААЛГАВАР <ChevronRight className="icon-v" size={20} />
                  </Link>
                </li>
                <li>
                  <Link to="/calendar">
                    МЭДЭЭЛЭЛ <ChevronRight className="icon-v" size={20} />
                  </Link>
                </li>
                <li>
                  <Link to="/price">
                    ПРОФАЙЛ <ChevronRight className="icon-v" size={20} />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
