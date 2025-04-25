import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { Search, Filter } from 'lucide-react';
import TicketCard from '../components/TicketCard';

const MarketplacePage = () => {
  const { tickets, events } = useEventContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const resaleTickets = tickets
    .filter(ticket => ticket.forResale)
    .map(ticket => ({
      ...ticket,
      event: events.find(e => e.id === ticket.eventId)
    }))
    .filter(ticket => ticket.event);

  const eventTypes = ['All', ...new Set(resaleTickets.map(ticket => ticket.event?.type).filter(Boolean))];

  const filteredTickets = resaleTickets.filter(ticket => {
    const matchesSearch =
      searchTerm === '' ||
      ticket.event?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.event?.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === '' ||
      selectedType === 'All' ||
      ticket.event?.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ticket Marketplace</h1>
        <p className="text-gray-600">Find and purchase resale tickets for upcoming events</p>
      </div>

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
              {eventTypes.map((type, index) => (
                type !== 'All' && <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              event={ticket.event}
              showResaleOption={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <p className="text-xl text-gray-600 mb-4">No resale tickets available at the moment.</p>
          <p className="text-gray-500">Check back later for more tickets!</p>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
