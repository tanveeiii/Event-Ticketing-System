import { ethers, JsonRpcProvider } from 'ethers';
import TicketMarketplaceABI from "../../build/contracts/TicketMarketplace.json";

const TICKETMARKETPLACE_ADDRESS = import.meta.env.VITE_TICKET_MARKETPLACE_ADDRESS
// const INFURA_ID = 'd404f2d478314b50b2498dcfa1652902';

// const marketplaceProvider = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`);
// const marketplaceContract = new ethers.Contract(TICKETMARKETPLACE_ADDRESS, TicketMarketplaceABI.abi, marketplaceProvider);

const provider = new JsonRpcProvider("http://127.0.0.1:7545")
const eventContract = new ethers.Contract(TICKETMARKETPLACE_ADDRESS, TicketMarketplaceABI.abi,provider);

// Connect to wallet and return writeable contract instance
export const getMarketplaceContract = async () => {
  if (window.ethereum == null) throw new Error("MetaMask not installed");
  const web3Provider = new ethers.BrowserProvider(window.ethereum);
  console.log(web3Provider)
  await web3Provider.send("eth_requestAccounts", []);
  const signer = await web3Provider.getSigner();
  console.log(signer)
  return new ethers.Contract(TICKETMARKETPLACE_ADDRESS, TicketMarketplaceABI.abi, signer);
};


// List tickets
export const listTicket = async (tokenId, price) => {
    const contract = await getMarketplaceContract();
    const priceInWei = ethers.parseEther(price)
    console.log(priceInWei)
    const tx = await contract.listTicket(tokenId, priceInWei);
    await tx.wait();
    return tx;
}

// Cancel the ticket listing
export const cancelTicketListing = async (tokenId) => {
    const contract = await getMarketplaceContract();
    const tx = await contract.cancelListing(tokenId);
    await tx.wait();
    return tx;
}

// Buy ticket
export const buyTicket = async (tokenId, priceInWei) => {
    const contract = await getMarketplaceContract();
    const tx = await contract.buyTicket(tokenId);
    await tx.wait();
    return tx;
}

// Fetch all listed tickets
export const getListings = async () => {
    // TODO: Check solidity file and make changes accordingly
}
