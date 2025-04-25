import React, { useState } from 'react';
import { Menu, X, TicketCheck, Home, Calendar, UserCircle, Plus, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEventContext } from '../context/EventContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useEventContext();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigation = [
    { name: 'Home', href: '/', icon: <Home size={20} /> },
    { name: 'Events', href: '/events', icon: <Calendar size={20} /> },
    { name: 'Create Event', href: '/create-event', icon: <Plus size={20} /> },
    { name: 'Marketplace', href: '/marketplace', icon: <ShoppingBag size={20} /> },
    { name: 'My Tickets', href: '/dashboard', icon: <TicketCheck size={20} /> },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <TicketCheck className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EventHub</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}

            <div className="ml-4 flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full object-cover border-2 border-purple-200"
                  src={currentUser.avatar}
                  alt={currentUser.name}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">{currentUser.name}</span>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  isActive(item.href)
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}

            <div className="pt-4 pb-3 border-t border-gray-200">
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <img
                  className="h-8 w-8 rounded-full object-cover border-2 border-purple-200 mr-3"
                  src={currentUser.avatar}
                  alt={currentUser.name}
                />
                {currentUser.name}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
