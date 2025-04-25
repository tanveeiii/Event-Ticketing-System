import { useEffect, useState } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function MetaMaskLogin() {
  const [address, setAddress] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState(false);

  // Load login state from localStorage on mount
  useEffect(() => {
    const storedAddress = localStorage.getItem("wallet-address");
    const isLogged = localStorage.getItem("is-logged-in");
    if (storedAddress && isLogged === "true") {
      setAddress(storedAddress);
      setLoggedIn(true);
    }
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
    localStorage.removeItem("wallet-address");
    localStorage.removeItem("is-logged-in");
    localStorage.removeItem("dapp-nonce");
  };

  return (
    <div className="p-4 flex flex-row justify-center gap-4 items-center space-y-4">
      {loggedIn ? (
        <>
          <p className="text-lg font-semibold text-gray-700">
            Logged in as:{" "}
            <span className="text-purple-600 cursor-pointer" title={address}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </p>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={loginWithMetaMask}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200"
        >
          Login with MetaMask
        </button>
      )}
    </div>
  );
}
