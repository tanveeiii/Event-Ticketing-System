import { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";

export default function MetaMaskLogin() {
  const [address, setAddress] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load login state from localStorage on mount
  useEffect(() => {
    const storedAddress = localStorage.getItem("wallet-address");
    const isLogged = localStorage.getItem("is-logged-in");
    if (storedAddress && isLogged === "true") {
      setAddress(storedAddress);
      setLoggedIn(true);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loginWithMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    setAddress(userAddress);

    const nonce = `Login to dApp - ${Math.floor(Math.random() * 1e6)}`;
    const signature = await signer.signMessage(nonce);
    const recovered = ethers.verifyMessage(nonce, signature);

    if (recovered.toLowerCase() === userAddress.toLowerCase()) {
      setLoggedIn(true);
      console.log("✅ User authenticated:", userAddress);

      // Save login state to localStorage
      localStorage.setItem("wallet-address", userAddress);
      localStorage.setItem("is-logged-in", "true");
    } else {
      alert("Signature verification failed");
    }
  };

  const logout = () => {
    setAddress("");
    setLoggedIn(false);
    setDropdownOpen(false);
    localStorage.removeItem("wallet-address");
    localStorage.removeItem("is-logged-in");
    localStorage.removeItem("dapp-nonce");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="p-4 px-2 lg:px-4 flex flex-row justify-center items-center">
      {loggedIn ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200"
            aria-expanded={dropdownOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 lg:w-5 lg:h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-800">
                  Account Info
                </p>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-gray-700 font-medium">Wallet ID:</p>
                <p className="text-xs text-gray-500 break-all mt-1">
                  {address}
                </p>
              </div>
              <div className="px-4 py-2 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md transition-colors duration-150"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={loginWithMetaMask}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
        >
          <span className="hidden sm:inline mr-2">Login with MetaMask</span>
          <span className="sm:hidden">Connect</span>
        </button>
      )}
    </div>
  );
}
