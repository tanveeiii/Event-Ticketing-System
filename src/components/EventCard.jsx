import React, { useEffect } from "react";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  const formatDate = (unixTime) => {
    const date = new Date(unixTime * 1000);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };
  console.log(event, "EVNET")

  

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="h-48 relative overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 m-2 rounded-full text-sm font-medium">
          {event.category}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {event.name}
        </h3>

        <div className="mb-4 space-y-2">
          <div className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-2 text-purple-500" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-gray-700 font-semibold">
            <DollarSign size={16} className="mr-2 text-purple-500" />
            <span>{Number(event.price)/1e18}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin size={16} className="mr-2 text-purple-500" />
            <span>  {event.location}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-5">
          <span
            className={`${
              event.totalTickets - event.ticketsSold > 50
                ? "bg-green-100 text-green-800"
                : event.totalTickets - event.ticketsSold > 10
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800"
            } px-3 py-1 rounded-full text-xs font-medium`}
          >
            {event.totalTickets - event.ticketsSold} tickets left
          </span>
          <Link
            to={`/events/${event.id}`}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
