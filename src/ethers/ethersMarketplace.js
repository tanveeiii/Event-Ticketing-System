import { ethers, JsonRpcProvider } from 'ethers';
import TicketMarketplaceABI from "../../build/contracts/TicketMarketplace.json";

const TICKETMARKETPLACE_ADDRESS = '0x4C96C48bAD034c4FDC09ED5E4c1665382A34556E';
const INFURA_ID = 'd404f2d478314b50b2498dcfa1652902';

const marketplaceProvider = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`);
const marketplaceContract = new ethers.Contract(TICKETMARKETPLACE_ADDRESS, TicketMarketplaceABI.abi, marketplaceProvider);

export const getMarketplaceContract = async () => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    await web3Provider.send("eth_requestAccounts", []);
    const signer = web3Provider.getSigner();
    return new ethers.Contract(TICKETMARKETPLACE_ADDRESS, TicketMarketplaceABI.abi, signer);
};

// List tickets
export const listTicket = async (tokenId, priceInWei) => {
    const contract = await getMarketplaceContract();
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
