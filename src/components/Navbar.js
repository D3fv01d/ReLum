import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faBook, 
  faLaptopCode, 
  faShieldAlt, 
  faBell, 
  faUser,
  faCog
} from '@fortawesome/free-solid-svg-icons';

function Navbar() {
  return (
    <nav className="bg-[#222222] shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <NavLink to="/" className="font-['Pacifico'] text-primary text-2xl">ReLum</NavLink>
            <div className="flex space-x-6">
              <NavLink 
                to="/dashboard" 
                className={({isActive}) => 
                  `nav-link ${isActive ? 'active' : ''} text-white hover:text-primary transition-colors duration-200 px-3 py-2`
                }
              >
                <FontAwesomeIcon icon={faChartLine} className="mr-2" />Dashboard
              </NavLink>
              <NavLink 
                to="/knowledge" 
                className={({isActive}) => 
                  `nav-link ${isActive ? 'active' : ''} text-white hover:text-primary transition-colors duration-200 px-3 py-2`
                }
              >
                <FontAwesomeIcon icon={faBook} className="mr-2" />知识
              </NavLink>
              <NavLink 
                to="/practice" 
                className={({isActive}) => 
                  `nav-link ${isActive ? 'active' : ''} text-white hover:text-primary transition-colors duration-200 px-3 py-2`
                }
              >
                <FontAwesomeIcon icon={faLaptopCode} className="mr-2" />练习
              </NavLink>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="!rounded-button bg-primary hover:bg-primary/90 text-white px-4 py-2 whitespace-nowrap transition-colors duration-200">
              <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />开始实验
            </button>
            <div className="flex items-center space-x-3">
              <button className="!rounded-button bg-secondary hover:bg-secondary/90 text-white p-2 whitespace-nowrap transition-colors duration-200">
                <FontAwesomeIcon icon={faBell} />
              </button>
              <Link 
                to="/settings"
                className="!rounded-button bg-secondary hover:bg-secondary/90 text-white p-2 whitespace-nowrap transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faCog} />
              </Link>
              <button className="!rounded-button bg-secondary hover:bg-secondary/90 text-white p-2 whitespace-nowrap transition-colors duration-200">
                <FontAwesomeIcon icon={faUser} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 