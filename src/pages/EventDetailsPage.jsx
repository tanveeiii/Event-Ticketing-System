import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  User,
  AlertCircle,
  CheckCircle,
  Ticket,
} from "lucide-react";
import { useEventContext } from "../context/EventContext";
import { ethers } from "ethers";
import { getEvent } from "../ethers/ethersEvents";

const EventDetailsPage = () => {
  const { id } = useParams();
  const { purchaseTicket, tickets } = useEventContext();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState("idle");
  const [isScrolled, setIsScrolled] = useState(false);

  const userTicketsForEvent = tickets.filter((t) => t.eventId === id);
  const hasTicket = userTicketsForEvent.length > 0;

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    // Contract timestamp is in seconds, JS expects milliseconds
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Format time from timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const eventData = await getEvent(id);
        console.log("Event Data:", eventData);

        // Transform contract data to our application format
        const transformedEvent = {
          id: id,
          title: eventData.name,
          date: eventData.date.toString(),
          price: parseFloat(ethers.utils.formatEther(eventData.price)),
          availableTickets:
            eventData.totalTickets.toNumber() -
            eventData.ticketsSold.toNumber(),
          totalTickets: eventData.totalTickets.toNumber(),
          soldTickets: eventData.ticketsSold.toNumber(),
          organizer: eventData.organizer,
          // Default placeholders for fields not in the contract
          image: "/event-placeholder.jpg", // placeholder image
          description: "No detailed description available.",
          location: "Location details not available",
          type: "Event",
          time: formatTime(eventData.date.toString()),
        };

        setEvent(transformedEvent);
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <p className="mb-6">
          The event you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/events"
          className="inline-block bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          Browse Events
        </Link>
      </div>
    );
  }

  const handlePurchaseTicket = async () => {
    try {
      setPurchaseStatus("processing");
      await purchaseTicket(event.id, event.price);
      setPurchaseStatus("success");

      // Reset status after 3 seconds
      setTimeout(() => {
        setPurchaseStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Purchase failed:", error);
      setPurchaseStatus("error");

      // Reset status after 3 seconds
      setTimeout(() => {
        setPurchaseStatus("idle");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header Image */}
      <div className="relative h-64 md:h-96 w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 container mx-auto px-4 pb-6 z-20">
          <div className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
            {event.type}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Sticky Purchase Bar */}
      <div
        className={`sticky top-16 z-20 w-full bg-white shadow-md transition-all duration-300 ${
          isScrolled ? "py-3" : "py-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 truncate">
            {event.title}
          </h2>
          {event.availableTickets > 0 ? (
            <button
              onClick={handlePurchaseTicket}
              disabled={hasTicket || purchaseStatus !== "idle"}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                hasTicket
                  ? "bg-green-500 cursor-default"
                  : purchaseStatus === "processing"
                  ? "bg-purple-400 cursor-wait"
                  : "bg-purple-600 hover:bg-purple-700 transition-colors"
              }`}
            >
              {hasTicket
                ? "Ticket Purchased"
                : purchaseStatus === "processing"
                ? "Processing..."
                : `Buy Ticket - ${event.price} ETH`}
            </button>
          ) : (
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              Sold Out
            </span>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                About This Event
              </h2>
              <p className="text-gray-700 mb-6">{event.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-4">
                    <Calendar size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Date</h3>
                    <p className="text-gray-700">{formatDate(event.date)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-4">
                    <Clock size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Time</h3>
                    <p className="text-gray-700">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-4">
                    <MapPin size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Location</h3>
                    <p className="text-gray-700">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-4">
                    <User size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Organizer</h3>
                    <p className="text-gray-700 text-sm break-all">
                      {event.organizer}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-4">
                    <Ticket size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Tickets Sold</h3>
                    <p className="text-gray-700">
                      {event.soldTickets} / {event.totalTickets}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Ticket Purchase */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Get Tickets
              </h2>

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">Price:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {event.price} ETH
                </span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-700">Available:</span>
                <span
                  className={`${
                    event.availableTickets > event.totalTickets * 0.5
                      ? "text-green-600"
                      : event.availableTickets > event.totalTickets * 0.2
                      ? "text-amber-600"
                      : "text-red-600"
                  } font-medium`}
                >
                  {event.availableTickets} tickets
                </span>
              </div>

              {purchaseStatus === "success" && (
                <div className="bg-green-100 text-green-800 p-3 rounded-md flex items-center mb-4">
                  <CheckCircle size={18} className="mr-2" />
                  Ticket purchased successfully!
                </div>
              )}

              {purchaseStatus === "error" && (
                <div className="bg-red-100 text-red-800 p-3 rounded-md flex items-center mb-4">
                  <AlertCircle size={18} className="mr-2" />
                  There was a problem with your purchase.
                </div>
              )}

              {hasTicket ? (
                <div className="mb-4">
                  <div className="bg-green-100 text-green-800 p-3 rounded-md flex items-center">
                    <CheckCircle size={18} className="mr-2" />
                    You already have a ticket for this event!
                  </div>
                  <Link
                    to="/dashboard"
                    className="mt-4 block text-center bg-gray-100 text-gray-700 font-medium py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    View My Tickets
                  </Link>
                </div>
              ) : event.availableTickets > 0 ? (
                <button
                  onClick={handlePurchaseTicket}
                  disabled={purchaseStatus !== "idle"}
                  className={`w-full font-medium py-3 rounded-md transition-colors ${
                    purchaseStatus === "processing"
                      ? "bg-purple-400 text-white cursor-wait"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {purchaseStatus === "processing"
                    ? "Processing..."
                    : "Buy Ticket"}
                </button>
              ) : (
                <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 text-center">
                  Sold Out
                </div>
              )}

              {!hasTicket && event.availableTickets > 0 && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Secure your spot now before tickets run out!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
