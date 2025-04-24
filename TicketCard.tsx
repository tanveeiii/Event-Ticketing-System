import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Event } from '../types';
import { Calendar, MapPin, Tag } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  event: Event;
  showResaleOption?: boolean;
  isPast?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, event, showResaleOption = false, isPast = false }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleResellClick = () => {
    navigate(`/resell-ticket/${ticket.id}`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-200 ${
        isHovered && !isPast ? 'transform -translate-y-1' : ''
      } ${isPast ? 'opacity-75' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        {ticket.forResale && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            For Resale
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Tag className="h-5 w-5 mr-2" />
            <span>
              {ticket.forResale 
                ? `Resale Price: $${ticket.resalePrice?.toFixed(2)}`
                : `Original Price: $${ticket.price.toFixed(2)}`}
            </span>
          </div>
        </div>

        {showResaleOption && !isPast && !ticket.forResale && (
          <button
            onClick={handleResellClick}
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            List for Resale
          </button>
        )}
        
        {isPast && (
          <div className="text-center text-gray-500 text-sm mt-2">
            Event has ended
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;