import { ethers, JsonRpcProvider } from 'ethers';
import EventTicketABI from "../../build/contracts/EventTicket.json";

const EVENT_TICKET_ADDRESS = '0x1dB1F6443eaAd898dA65463df291E5C9b48fFf03';
// const INFURA_ID = 'd404f2d478314b50b2498dcfa1652902';

// Create a provider and contract instance
// const eventProvider = new JsonRpcProvider("http://localhost:7545");
// const eventContract = new ethers.Contract(EVENT_TICKET_ADDRESS, EventTicketABI.abi, eventProvider);

// Connect to wallet and return writeable contract instance
export const getWriteableContract = async () => {
    if (window.ethereum == null) throw new Error("MetaMask not installed");
    // const { ethereum } = window
    const web3Provider = new ethers.BrowserProvider(window.ethereum);
    console.log(web3Provider)
    await web3Provider.send("eth_requestAccounts", []);
    const signer = await web3Provider.getSigner();
    return new ethers.Contract(EVENT_TICKET_ADDRESS, EventTicketABI.abi, signer);
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
    return await eventContract.events(eventId);
}

// Check ticket availability
export const isTicketAvailable = async (tokenId) => {
    return await eventContract.isTicketValid(tokenId);
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

export async function getAvailableEvents() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(EVENT_TICKET_ADDRESS, EventTicketABI, provider);
  
    const eventCount = await contract.eventIdCounter();
    const currentTime = Math.floor(Date.now() / 1000);
    const availableEvents = [];
  
    for (let i = 0; i < eventCount; i++) {
      const eventData = await contract.events(i);
      const eventObj = {
        id: i,
        name: eventData.name,
        date: Number(eventData.date),
        price: Number(eventData.price),
        totalTickets: Number(eventData.totalTickets),
        ticketsSold: Number(eventData.ticketsSold),
        organizer: eventData.organizer
      };

      if (eventObj.date > currentTime && eventObj.ticketsSold < eventObj.totalTickets) {
        availableEvents.push(eventObj);
      }
    }
  
    return availableEvents;
  }

  // function to get the user ticket data
  export const getUserTicketData = async () => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
  
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    const owner = await contract.ownerOf(tokenId);
    const contract = new ethers.Contract(EVENT_TICKET_ADDRESS, EventTicketABI.abi, provider);
    const nextTokenId = await contract.nextTokenId();
    const tickets = [];
  
    for (let tokenId = 0; tokenId < nextTokenId; tokenId++) {
      try {
        const owner = await contract.ownerOf(tokenId);
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          const eventId = await contract.ticketToEvent(tokenId);
          const isValid = await contract.isTicketValid(tokenId);
          const tokenURI = await contract.tokenURI(tokenId);
  
          tickets.push({
            tokenId,
            ownerAddress,
            eventId: Number(eventId),
            valid: isValid,
            tokenURI,
          });
        }
      } catch (err) {
        console.log("Error while geting user ticket data: ", err)
        continue;
      }
    }
  
    return tickets;
  };