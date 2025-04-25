import { ethers, JsonRpcProvider } from 'ethers';
import EventTicketABI from "../../build/contracts/EventTicket.json";
import TicketMarketplaceABI from "../../build/contracts/TicketMarketplace.json"

const EVENT_TICKET_ADDRESS = '0x0af4278FB0fac4400771533Ea9664d323607fE75';
const TICKETMARKETPLACE_ADDRESS = '0x4C96C48bAD034c4FDC09ED5E4c1665382A34556E'
const INFURA_ID = 'd404f2d478314b50b2498dcfa1652902';

// Create a provider and contract instance
const readProvider = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`);
const readContract = new ethers.Contract(EVENT_TICKET_ADDRESS, EventTicketABI.abi, readProvider);

// Connect to wwallet and return writeable contract instance
export const getTicketContract = async () => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    await web3Provider.send("eth_requestAccounts", []);
    const signer = web3Provider.getSigner();
    return new ethers.Contract(EVENT_TICKET_ADDRESS, EventTicketABI.abi, signer);
};

export const getMarketplaceContract = async () => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    await web3Provider.send("eth_requestAccounts", []);
    const signer = web3Provider.getSigner();
    return new ethers.Contract(TICKETMARKETPLACE_ADDRESS, TicketMarketplaceABI.abi, signer);
};

// Create event
export const createEvent = async (eventName, eventDate, eventPrice, totalTickets) => {
    const contract = await getWriteableContract();
    const tx = await contract.createEvent(eventName, eventDate, eventPrice, totalTickets);
    await tx.wait();
    return tx;
}

// Buy Ticket
export const buyTicket = async (eventId, ticketURI , priceInWei) => {
    const contract = await getWriteableContract();
    const tx = await contract.buyTicket(eventId, ticketURI, { value: priceInWei });
    await tx.wait();
    return tx;
}

// Fetch events
export const getEvent = async(eventId) => {
    return await readContract.events(eventId);
}

// Check ticket availability
export const isTicketAvailable = async (tokenId) => {
    return await readContract.isTicketValid(tokenId);
}

// Resell ticket
export const resellTicket = async (buyer, tokenId) => {
    const contract = await getWriteableContract();
    const tx = await contract.resellTicket(buyer, tokenId);
    await tx.wait();
    return tx;
}

// Invalidate ticket (Owner Only)
export const invalidateTicket = async (tokenId) => {
    const contract = await getWriteableContract();
    const tx = await contract.invalidateTicket(tokenId);
    await tx.wait();
    return tx;
};

