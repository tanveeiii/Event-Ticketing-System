import React, { useState } from "react";
import {
  Menu,
  X,
  TicketCheck,
  Home,
  Calendar,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import MetaMaskLogin from "../components/MMLogin";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigation = [
    { name: "Home", href: "/", icon: <Home size={20} /> },
    { name: "Events", href: "/events", icon: <Calendar size={20} /> },
    { name: "Create Event", href: "/create-event", icon: <Plus size={20} /> },
    {
      name: "Marketplace",
      href: "/marketplace",
      icon: <ShoppingBag size={20} />,
    },
    { name: "My Tickets", href: "/dashboard", icon: <TicketCheck size={20} /> },
    {
      name: "Created Events",
      href: "/created-events",
      icon: <TicketCheck size={20} />,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <TicketCheck className="h-8 w-8 text-purple-600" />
              <span className="ml-3 text-xl font-bold text-gray-900">
                EventHub
              </span>
            </Link>
          </div>
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-0 lg:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`lg:px-3 px-2 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
                  isActive(item.href)
                    ? "text-purple-600 bg-purple-50"
                    : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}

            <div className="ml-4 flex items-center">
              <MetaMaskLogin />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex">
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            <div className="md:hidden flex border-t border-gray-200">
              <MetaMaskLogin />
            </div>
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
                className={`px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  isActive(item.href)
                    ? "text-purple-600 bg-purple-50"
                    : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}

            {/* <div className="pt-4 pb-3 border-t border-gray-200">
              <MetaMaskLogin />
            </div> */}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
