import { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function MetaMaskLogin() {
  const [address, setAddress] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
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
    <div className="p-4 flex flex-row justify-center items-center">
      {loggedIn ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200"
            aria-expanded={dropdownOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
          <svg
            className="h-5 w-5 ml-1"
            viewBox="0 0 404 420"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M382.254 19.2241L236.771 136.388L267.396 58.7651L382.254 19.2241Z"
              fill="white"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22.3691 19.2241L166.574 137.573L137.229 58.7651L22.3691 19.2241Z"
              fill="white"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M325.85 302.254L283.755 373.403L372.24 400.462L397.12 303.736L325.85 302.254Z"
              fill="white"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.00415 303.736L31.7607 400.462L120.245 373.403L78.1506 302.254L7.00415 303.736Z"
              fill="white"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M115.279 182.198L88.9607 223.521L176.628 227.671L173.663 134.313L115.279 182.198Z"
              fill="white"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M289.346 182.198L230.369 133.128L228.587 227.671L316.131 223.521L289.346 182.198Z"
              fill="white"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M120.245 373.403L171.291 344.492L126.993 304.33L120.245 373.403Z"
              fill="white"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M233.31 344.492L283.755 373.403L277.629 304.33L233.31 344.492Z"
              fill="white"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
