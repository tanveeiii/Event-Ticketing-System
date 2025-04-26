import { ethers, JsonRpcProvider } from "ethers";
import TicketMarketplaceABI from "../../build/contracts/TicketMarketplace.json";
import EventTicketABI from "../../build/contracts/EventTicket.json";

const TICKETMARKETPLACE_ADDRESS = import.meta.env
  .VITE_TICKET_MARKETPLACE_ADDRESS;
const EVENT_TICKET_ADDRESS = import.meta.env.VITE_EVENT_TICKET_ADDRESS;
// const INFURA_ID = 'd404f2d478314b50b2498dcfa1652902';

// const marketplaceProvider = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`);
// const marketplaceContract = new ethers.Contract(TICKETMARKETPLACE_ADDRESS, TicketMarketplaceABI.abi, marketplaceProvider);

const provider = new JsonRpcProvider("http://127.0.0.1:7545");
const eventContract = new ethers.Contract(
  TICKETMARKETPLACE_ADDRESS,
  TicketMarketplaceABI.abi,
  provider
);

// Connect to wallet and return writeable contract instance
export const getMarketplaceContract = async () => {
  if (window.ethereum == null) throw new Error("MetaMask not installed");
  const web3Provider = new ethers.BrowserProvider(window.ethereum);
  console.log(web3Provider);
  await web3Provider.send("eth_requestAccounts", []);
  const signer = await web3Provider.getSigner();
  console.log(signer);
  return new ethers.Contract(
    TICKETMARKETPLACE_ADDRESS,
    TicketMarketplaceABI.abi,
    signer
  );
};

export const getTicketContract = async () => {
  if (window.ethereum == null) throw new Error("MetaMask not installed");
  const web3Provider = new ethers.BrowserProvider(window.ethereum);
  await web3Provider.send("eth_requestAccounts", []);
  const signer = await web3Provider.getSigner();
  return new ethers.Contract(EVENT_TICKET_ADDRESS, EventTicketABI.abi, signer);
};

// List tickets
export const listTicket = async (tokenId, price) => {
  const marketplace = await getMarketplaceContract();
  const ticket = await getTicketContract(); // Ticket NFT contract
  const priceInWei = ethers.parseEther(price);

  // 1. Check if already approved
  const approvedAddress = await ticket.getApproved(tokenId);
  const marketplaceAddress = await marketplace.getAddress(); // if your getMarketplaceContract() returns Contract, else hardcode address

  if (approvedAddress !== marketplaceAddress) {
    // 2. Approve marketplace to transfer the token
    const approveTx = await ticket.approve(marketplaceAddress, tokenId);
    await approveTx.wait();
    console.log(`Approved tokenId ${tokenId} to Marketplace`);
  }

  // 3. Now list it
  const tx = await marketplace.listTicket(tokenId, priceInWei);
  await tx.wait();
  return tx;
};

// Cancel the ticket listing
export const cancelTicketListing = async (tokenId) => {
  const contract = await getMarketplaceContract();
  const tx = await contract.cancelListing(tokenId);
  await tx.wait();
  return tx;
};

// Buy ticket
export const buyTicket = async (tokenId, priceInWei) => {
  const contract = await getMarketplaceContract();
  const tx = await contract.buyTicket(tokenId);
  await tx.wait();
  return tx;
};

// Fetch all listed tickets
export const getListings = async () => {
  const contract = await getMarketplaceContract();
  const tx = await contract.getAllListings();
  console.log(tx);
  const [allListings, listedTokenIds] = await contract.getAllListings();
  console.log(allListings, "AL", listedTokenIds);
  const listings = listedTokenIds.map((tokenId, index) => {
    console.log("HALAHI");
    console.log("TOkenI: ", tokenId);
    const listing = allListings[index];
    return {
      tokenId: tokenId.toString(),
      seller: listing.seller,
      price: listing.price,
    };
  });

  console.log("LISTING: ", listings);
  return listings;
};

export const isTicketListed = async (tokenId) => {
  const contract = await getMarketplaceContract();
  try {
    const listing = await contract.getListing(tokenId);
    const price = listing[1];
    return price > 0;
  } catch (error) {
    console.error("Error checking ticket listing:", error);
    return false;
  }
};

export const buyResaleTicket = async (tokenId) => {
  const contract = await getMarketplaceContract();
  const listing = await contract.getListing(tokenId);
  const price = listing[1]; // Get the price from the listing
  const tx = await contract.buyTicket(tokenId, { value: price });
  await tx.wait();
  return tx;
};

export const cancelListing = async (tokenId) => {
  const contract = await getMarketplaceContract();
  const tx = await contract.cancelListing(tokenId);
  console.log(tx);
  await tx.wait();
  return tx;
};
