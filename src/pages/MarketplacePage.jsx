import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import TicketCard from "../components/TicketCard";
import { getListings } from "../ethers/ethersMarketplace";
import { getEventFromToken } from "../ethers/ethersEvents";

// Constants
const EVENT_TYPES = ["Music", "Sports", "Theater", "Conference", "Workshop"];

const MarketplacePage = () => {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [resaleTickets, setResaleTickets] = useState([]);
  const [resaleEvents, setResaleEvents] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch ticket listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const data = await getListings();
        setResaleTickets(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, []);

  // Fetch event details for tickets
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (resaleTickets.length === 0) return;

      try {
        const eventPromises = resaleTickets.map((ticket) =>
          getEventFromToken(ticket.tokenId)
        );
        const events = await Promise.all(eventPromises);
        console.log(events, "Events");
        setResaleEvents(events);
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    // {0: 'test-event-1', 1: 1746144000n, 2: 'sandipani seminar hall', 3: 'testing-1', 4: 'https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_640.jpg', 5: 700000000000000000n, 6: 300n, 7: 2n, 8: '0xe698Eba855AB1F2fF8a08fF4A1C917d772578343', 9: 'conference'}

    fetchEventDetails();
    setIsLoading(false);
  }, [resaleTickets]);

  // Combine and filter tickets with event details
  useEffect(() => {
    if (resaleTickets.length === 0 || resaleEvents.length === 0) return;

    const mergedTickets = resaleTickets.map((ticket, index) => ({
      ...ticket,
      eventDetails: {
        name: resaleEvents[index]?.[0] || "",
        date: resaleEvents[index]?.[1] ? Number(resaleEvents[index][1]) : 0,
        location: resaleEvents[index]?.[2] || "",
        organiser: resaleEvents[index]?.[3] || "",
        imageUrl: resaleEvents[index]?.[4] || "",
        price: Number(resaleEvents[index]?.[5]).toString(),
        maxSeats: resaleEvents[index]?.[6]?.toString() || "",
        ticketType: resaleEvents[index]?.[7]?.toString() || "",
        creatorAddress: resaleEvents[index]?.[8] || "",
        category: resaleEvents[index]?.[9] || "",
      },
    }));

    const filtered = mergedTickets.filter((ticket) => {
      const event = ticket.eventDetails;
      const matchesSearch =
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organiser.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType
        ? event.category.toLowerCase() === selectedType.toLowerCase()
        : true;
      return matchesSearch && matchesType;
    });

    setFilteredTickets(filtered);
  }, [resaleTickets, resaleEvents, searchTerm, selectedType]);

  // Render helper components
  const renderSearchAndFilter = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events by name or location"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Event Types</option>
            {EVENT_TYPES.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderTicketsList = () => {
    if (isLoading) {
      return (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <p className="text-xl text-gray-600">Loading tickets...</p>
        </div>
      );
    }

    if (filteredTickets.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <p className="text-xl text-gray-600 mb-4">
            No resale tickets available at the moment.
          </p>
          <p className="text-gray-500">Check back later for more tickets!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            event={ticket.event}
            showResaleOption={false}
            isMarketplace
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Ticket Marketplace
        </h1>
        <p className="text-gray-600">
          Find and purchase resale tickets for upcoming events
        </p>
      </div>

      {renderSearchAndFilter()}
      {renderTicketsList()}
    </div>
  );
};

export default MarketplacePage;
