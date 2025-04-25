import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import EventCard from '../components/EventCard';
import { Search, Filter } from 'lucide-react';

const EventsPage = () => {
  const { events } = useEventContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  // Get unique event types
  const eventTypes = ['All', ...new Set(events.map(event => event.type))];
  
  // Filter events based on search and type
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === '' || selectedType === 'All' || event.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Discover Events</h1>
      
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events by name, location or description"
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
      
      {/* Event Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600">No events found matching your criteria.</p>
          <button 
            className="mt-4 text-purple-600 hover:text-purple-700" 
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
