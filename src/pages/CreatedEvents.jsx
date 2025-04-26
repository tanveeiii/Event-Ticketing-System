import React, { useState, useEffect } from "react";
import { Search, Filter, Ticket } from "lucide-react";
import { eventsOfUsers, addTickets } from "../ethers/ethersEvents";
import formatDate from "../utils/fornatDate";
import AddTicketsModal from "../components/AddTicketsModal";

const CreatedEvents = () => {
  const [createdEvents, setCreatedEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const eventTypes = createdEvents.length > 0 
    ? ["All", ...new Set(createdEvents.map((event) => event.category))]
    : ["All"];

  const getCreatedEvents = async () => {
    const storedAddress = localStorage.getItem("wallet-address") || "0x123";
    const data = await eventsOfUsers(storedAddress);
    console.log("Created Events: ", data);
    return data;
  };

  const handleAddTickets = async (eventId, ticketCount) => {
    try {
      await addTickets(eventId, ticketCount);
      
      setCreatedEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                totalTickets: Number(event.totalTickets) + ticketCount 
              } 
            : event
        )
      );
      
    } catch (error) {
      console.error("Failed to add tickets:", error);
      throw error;
    }
  };

  const openAddTicketsModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const userEvents = await getCreatedEvents();
        setCreatedEvents(userEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = createdEvents.filter((event) => {
    const matchesSearch =
      searchTerm === "" ||
      event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "" ||
      selectedType === "All" ||
      event.category === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        My Created Events
      </h1>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search your events by name or location"
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
              {eventTypes.map(
                (type, index) =>
                  type !== "All" && (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  )
              )}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        </div>
      )}

      {!loading && filteredEvents.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-xs text-center font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-xs text-center font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-xs text-center font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-xs text-center font-medium text-gray-500 uppercase tracking-wider">
                  Tickets Sold
                </th>
                <th className="px-6 py-3 text-xs text-center font-medium text-gray-500 uppercase tracking-wider">
                  Revenue (ETH)
                </th>
                <th className="px-6 py-3 text-xs text-center font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 mr-3">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={event.imageUrl || "/placeholder.png"}
                          alt={event.name}
                        />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {event.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {formatDate(event.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {event.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center">
                      <Ticket size={16} className="text-gray-400 mr-2 relative top-[1px]" />
                      {event.ticketsSold} / {event.totalTickets}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {(Number(event.ticketsSold) * Number(event.price))/1e18}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 transition-colors focus:outline-none focus:underline"
                      onClick={() => openAddTicketsModal(event)}
                    >
                      Add Tickets
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <p className="text-xl text-gray-600">
            You haven't created any events yet or no events match your search.
          </p>
          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
            Create Your First Event
          </button>
        </div>
      ) : null}

      {selectedEvent && (
        <AddTicketsModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddTickets={handleAddTickets}
        />
      )}
    </div>
  );
};

export default CreatedEvents;