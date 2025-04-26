import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Tag } from 'lucide-react';
import PurchaseTicket from './PurchaseTicket';
import formatDate from '../utils/fornatDate';

const TicketCard = ({ ticket, event, showResaleOption = false, isPast = false }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleResellClick = () => {
    navigate(`/resell-ticket/${ticket.id}`);
  };


  const formatPrice = (priceInWei) => {
    if (!priceInWei) return "0.00";
    return (Number(priceInWei) / 1e18).toFixed(2);  // Assume price is stored in Wei (smallest ETH unit)
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-200 
        ${isHovered && !isPast ? 'transform -translate-y-1' : ''} 
        ${isPast ? 'opacity-75' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img
          src={ticket.eventDetails.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={ticket.eventDetails.title || "Event"}
          className="w-full h-48 object-cover"
        />
        {ticket?.forResale && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            For Resale
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {ticket.eventDetails.name || "Event Name"}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{formatDate(ticket.eventDetails.date)}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{ticket.eventDetails.location || "Unknown Location"}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Tag className="h-5 w-5 mr-2" />
            <span>
              {ticket?.forResale
                ? `Resale Price: $${ticket?.resalePrice ? Number(ticket.resalePrice).toFixed(2) : "0.00"}`
                : `Original Price: $${formatPrice(ticket?.eventDetails?.price)}`
              }
            </span>
          </div>
        </div>

        {/* Purchase Button */}
        {ticket?.forResale && !isPast && (
          <PurchaseTicket
            eventId={ticket.tokenId}
            price={ticket?.resalePrice || ticket?.price}
            isResale={true}
            ticketId={ticket?.id}
          />
        )}

        {/* Resell Button */}
        {showResaleOption && !isPast && !ticket?.forResale && (
          <button
            onClick={handleResellClick}
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            List for Resale
          </button>
        )}

        {/* Event ended */}
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
