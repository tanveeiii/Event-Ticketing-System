import { ethers, JsonRpcProvider } from "ethers";
import EventTicketABI from "../../build/contracts/EventTicket.json";
// import dotenv from 'dotenv';
// dotenv.config();
const EVENT_TICKET_ADDRESS = import.meta.env.VITE_EVENT_TICKET_ADDRESS;
const provider = new JsonRpcProvider("http://127.0.0.1:7545");
const eventContract = new ethers.Contract(
  EVENT_TICKET_ADDRESS,
  EventTicketABI.abi,
  provider
);

// Connect to wallet and return writeable contract instance
export const getWriteableContract = async () => {
  if (window.ethereum == null) throw new Error("MetaMask not installed");
  const web3Provider = new ethers.BrowserProvider(window.ethereum);
  console.log(web3Provider);
  await web3Provider.send("eth_requestAccounts", []);
  const signer = await web3Provider.getSigner();
  console.log(signer);
  return new ethers.Contract(EVENT_TICKET_ADDRESS, EventTicketABI.abi, signer);
};

// Create event with max tickets per buyer parameter
export const createEvent = async (
  eventName,
  eventDate,
  eventPrice,
  totalTickets,
  location,
  description,
  imageUrl,
  category,
  maxTicketsPerBuyer = 5 // Default to 5 if not specified
) => {
  const contract = await getWriteableContract();
  const tx = await contract.createEvent(
    eventName,
    eventDate,
    eventPrice,
    totalTickets,
    location,
    description,
    imageUrl,
    category,
    maxTicketsPerBuyer
  );
  return tx;
};

// Buy a single ticket (unchanged for backward compatibility)
export const buyTicket = async (eventId, ticketURI, price) => {
  const contract = await getWriteableContract();
  console.log(contract, " ", ticketURI);
  const tx = await contract.buyTicket(eventId, ticketURI, {
    value: ethers.parseEther(price),
  });
  console.log(tx, " ", price);
  const receipt = await tx.wait();
  console.log(receipt);
  return tx;
};

// Buy multiple tickets at once (new function)
export const buyMultipleTickets = async (
  eventId,
  tokenURIs,
  quantity,
  price
) => {
  const contract = await getWriteableContract();

  // Calculate total price for all tickets
  const totalPrice = (parseFloat(price) * quantity).toString();

  console.log(`Buying ${quantity} tickets for total price: ${totalPrice} ETH`);

  // Call the contract method with the array of token URIs
  const tx = await contract.buyMultipleTickets(eventId, tokenURIs, quantity, {
    value: ethers.parseEther(totalPrice),
  });

  const receipt = await tx.wait();
  console.log("Transaction receipt:", receipt);
  return tx;
};

// Get user's ticket count for a specific event (new function)
export const getUserTicketCount = async (userAddress, eventId) => {
  return await eventContract.getUserTicketCount(userAddress, eventId);
};

// Get the maximum tickets per buyer for an event (new function)
export const getMaxTicketsPerBuyer = async (eventId) => {
  const eventData = await eventContract.events(eventId);
  return eventData.maxTicketsPerBuyer;
};

// Update maximum tickets per buyer (new function for organizers)
export const updateMaxTicketsPerBuyer = async (eventId, newMaxTickets) => {
  const contract = await getWriteableContract();
  const tx = await contract.updateMaxTicketsPerBuyer(eventId, newMaxTickets);
  await tx.wait();
  return tx;
};

// Fetch events
export const getEvent = async (eventId) => {
  return await eventContract.events(eventId);
};

// Check ticket availability
export const isTicketAvailable = async (tokenId) => {
  return await eventContract.isTicketValid(tokenId);
};

// Invalidate ticket (Owner Only)
export const invalidateTicket = async (tokenId) => {
  const contract = await getWriteableContract();
  const tx = await contract.invalidateTicket(tokenId);
  await tx.wait();
  return tx;
};

export const ticketsOfUsers = async (address) => {
  console.log("Address of User: ", address);
  const ticketIds = await eventContract.getTicketsOfUser(address);
  const tickets = await Promise.all(
    ticketIds.map(async (tokenId) => {
      const eventId = await eventContract.ticketToEvent(tokenId);
      const eventDetails = await eventContract.events(eventId);
      const tokenURI = await eventContract.tokenURI(tokenId);

      return {
        tokenId: tokenId.toString(),
        eventId: eventId.toString(),
        eventDetails: {
          name: eventDetails.name,
          date: eventDetails.date.toString(),
          location: eventDetails.location,
          description: eventDetails.description,
          imageUrl: eventDetails.imageUrl,
          price: eventDetails.price.toString(),
          totalTickets: eventDetails.totalTickets.toString(),
          ticketsSold: eventDetails.ticketsSold.toString(),
          organizer: eventDetails.organizer,
          category: eventDetails.category,
          maxTicketsPerBuyer:
            eventDetails.maxTicketsPerBuyer?.toString() || "5",
        },
        tokenURI: tokenURI, // if needed
      };
    })
  );

  console.log(tickets);
  return tickets;
};

export const eventsOfUsers = async (userAddress) => {
  const eventIdCounter = await eventContract.eventIdCounter();
  const events = [];
  for (let i = 0; i < eventIdCounter; i++) {
    const eventData = await eventContract.events(i);
    const eventObj = {
      id: i,
      name: eventData.name,
      date: Number(eventData.date),
      price: eventData.price,
      totalTickets: Number(eventData.totalTickets),
      ticketsSold: Number(eventData.ticketsSold),
      organizer: eventData.organizer,
      location: eventData.location,
      description: eventData.description,
      imageUrl: eventData.imageUrl,
      category: eventData.category,
      maxTicketsPerBuyer: Number(eventData.maxTicketsPerBuyer || 5),
    };
    if (eventObj.organizer == userAddress) {
      events.push(eventObj);
    }
  }
  return events;
};

export async function getAvailableEvents() {
  const contract = await getWriteableContract();
  const eventCount = await contract.eventIdCounter();
  const currentTime = Math.floor(Date.now() / 1000);
  const availableEvents = [];

  for (let i = 0; i < eventCount; i++) {
    const eventData = await contract.events(i);
    const eventObj = {
      id: i,
      name: eventData.name,
      date: Number(eventData.date),
      price: eventData.price,
      totalTickets: Number(eventData.totalTickets),
      ticketsSold: Number(eventData.ticketsSold),
      organizer: eventData.organizer,
      location: eventData.location,
      description: eventData.description,
      imageUrl: eventData.imageUrl,
      category: eventData.category,
      maxTicketsPerBuyer: Number(eventData.maxTicketsPerBuyer || 5),
    };

    if (
      eventObj.date > currentTime &&
      eventObj.ticketsSold < eventObj.totalTickets
    ) {
      availableEvents.push(eventObj);
    }
  }

  return availableEvents;
}

// Get user's remaining available tickets for purchase (new function)
export const getRemainingTicketsForUser = async (userAddress, eventId) => {
  const eventData = await eventContract.events(eventId);
  const userTickets = await eventContract.getUserTicketCount(
    userAddress,
    eventId
  );
  const maxTickets = eventData.maxTicketsPerBuyer || 5;

  return maxTickets - userTickets;
};

export const getEventFromToken = async (tokenId) => {
  return await eventContract.getEventFromToken(tokenId);
};

export const addTickets = async (eventId, additionalTickets) => {
  const contract = await getWriteableContract();

  try {
    const tx = await contract.addTickets(eventId, additionalTickets);
    await tx.wait();
    console.log("Tickets added successfully");
  } catch (error) {
    console.log("Error adding tickets: ", error);
  }
};
