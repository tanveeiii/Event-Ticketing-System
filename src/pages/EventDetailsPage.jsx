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
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import { useEventContext } from "../context/EventContext";
import {
  getEvent,
  buyTicket,
  buyMultipleTickets,
  getUserTicketCount,
  getRemainingTicketsForUser,
} from "../ethers/ethersEvents";
import { ethers } from "ethers";

const EventDetailsPage = () => {
  const { id } = useParams();
  const { events, purchaseTicket, tickets } = useEventContext();
  const [event, setEvent] = useState({
    name: "",
    date: "",
    location: "",
    description: "",
    imageUrl: "",
    price: "",
    ticketsAvailable: "",
    ticketsSold: "",
    organizer: "",
    category: "",
    maxTicketsPerBuyer: 5,
  });
  const [purchaseStatus, setPurchaseStatus] = useState("idle");
  const [isScrolled, setIsScrolled] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [remainingTickets, setRemainingTickets] = useState(5);
  const [loadingRemainingTickets, setLoadingRemainingTickets] = useState(true);
  const account = localStorage.getItem("wallet-address");

  const userTicketsForEvent = tickets.filter((t) => t.eventId === id);
  const hasTicket = userTicketsForEvent.length > 0;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      const eventDetails = await getEvent(id);
      setEvent({
        name: eventDetails[0],
        date: new Date(Number(eventDetails[1]) * 1000)
          .toISOString()
          .split("T")[0], // convert timestamp to date
        location: eventDetails[2],
        description: eventDetails[3],
        imageUrl: eventDetails[4],
        price: Number(eventDetails[5]) / 1e18, // convert wei to ether
        ticketsAvailable: Number(eventDetails[6]) - Number(eventDetails[7]),
        ticketsSold: Number(eventDetails[7]),
        organizer: eventDetails[8],
        category: eventDetails[9],
        maxTicketsPerBuyer: Number(eventDetails[10] || 5),
      });
    };

    fetchEvent();
  }, [id]);

  // Fetch remaining tickets user can buy
  useEffect(() => {
    const fetchRemainingTickets = async () => {
      if (!account) {
        setRemainingTickets(0);
        return;
      }
      try {
        setLoadingRemainingTickets(true);
        const remaining = await getRemainingTicketsForUser(account, id);
        setRemainingTickets(Number(remaining));
      } catch (error) {
        console.error("Error fetching remaining tickets:", error);
      } finally {
        setLoadingRemainingTickets(false);
      }
    };

    fetchRemainingTickets();
  }, [account, id]);

  useEffect(() => {
    console.log(event);
  }, [event]);

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

  const incrementQuantity = () => {
    const maxAllowed = Math.min(remainingTickets, event.ticketsAvailable);
    if (quantity < maxAllowed) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handlePurchaseTickets = async () => {
    try {
      if (!account) {
        setPurchaseStatus("error");
        console.error("No wallet connected. Please connect your wallet first.");
        return;
      }

      setPurchaseStatus("processing");

      // Create an array of metadata objects for each ticket
      const tokenURIs = [];
      for (let i = 0; i < quantity; i++) {
        const ticketMetadata = {
          name: event.name + " Ticket",
          description: "Entry ticket for " + event.name,
          image: event.imageUrl,
          attributes: [
            { trait_type: "Date", value: event.date },
            { trait_type: "Location", value: event.location },
            { trait_type: "Ticket Number", value: `${i + 1} of ${quantity}` },
          ],
        };

        const metadataJSON = JSON.stringify(ticketMetadata);
        const ticketURI = `data:application/json;base64,${btoa(metadataJSON)}`;
        tokenURIs.push(ticketURI);
      }

      let tx;
      if (quantity === 1) {
        // Use original buyTicket function for single purchases
        tx = await buyTicket(id, tokenURIs[0], event.price.toString());
      } else {
        // Use new buyMultipleTickets function for multiple purchases
        tx = await buyMultipleTickets(
          id,
          tokenURIs,
          quantity,
          event.price.toString()
        );
      }

      // Update ticket count multiple times if needed
      for (let i = 0; i < quantity; i++) {
        purchaseTicket(id);
      }

      setPurchaseStatus("success");

      // Update local state
      setEvent({
        ...event,
        ticketsAvailable: event.ticketsAvailable - quantity,
        ticketsSold: event.ticketsSold + quantity,
      });

      // Update remaining tickets
      const remaining = await getRemainingTicketsForUser(account, id);
      setRemainingTickets(Number(remaining));

      setTimeout(() => {
        setPurchaseStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Error while purchasing: ", error);
      console.log("Account address:", account);
      console.log("Event ID:", id);
      console.log("Quantity:", quantity);
      console.log("Price:", event.price.toString());
      setPurchaseStatus("error");

      setTimeout(() => {
        setPurchaseStatus("idle");
      }, 3000);
    }
  };

  // Calculate the total price
  const totalPrice = event.price * quantity;

  // Calculate maximum available tickets the user can buy
  const maxPurchasable = Math.min(remainingTickets, event.ticketsAvailable);
  const canBuyMore = maxPurchasable > 0;

  return (
    <div className="min-h-screen pb-12">
      {/* Header Image */}
      <div className="relative h-64 md:h-96 w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
        <img
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 container mx-auto px-4 pb-6 z-20">
          <div className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
            {event.category}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {event.name}
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
            {event.name}
          </h2>
          {canBuyMore ? (
            <button
              onClick={handlePurchaseTickets}
              disabled={purchaseStatus !== "idle"}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                purchaseStatus === "processing"
                  ? "bg-purple-400 cursor-wait"
                  : "bg-purple-600 hover:bg-purple-700 transition-colors"
              }`}
            >
              {purchaseStatus === "processing"
                ? "Processing..."
                : `Buy ${
                    quantity > 1 ? quantity + " Tickets" : "Ticket"
                  } - ${totalPrice.toFixed(5)} ETH`}
            </button>
          ) : (
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {event.ticketsAvailable > 0 ? "Max Tickets Reached" : "Sold Out"}
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
                    <p className="text-gray-700">{event.date}</p>
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
                    <p className="text-gray-700">{event.organizer}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-4">
                    <DollarSign size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Ticket Limit</h3>
                    <p className="text-gray-700">
                      Maximum {event.maxTicketsPerBuyer} tickets per buyer
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
                <span className="text-gray-700">Price per ticket:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {event.price} ETH
                </span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">Available:</span>
                <span
                  className={`${
                    event.ticketsAvailable > 50
                      ? "text-green-600"
                      : event.ticketsAvailable > 10
                      ? "text-amber-600"
                      : "text-red-600"
                  } font-medium`}
                >
                  {event.ticketsAvailable} tickets
                </span>
              </div>

              {!loadingRemainingTickets && (
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">You can buy:</span>
                  <span className="text-purple-600 font-medium">
                    {remainingTickets} more tickets
                  </span>
                </div>
              )}

              {purchaseStatus === "success" && (
                <div className="bg-green-100 text-green-800 p-3 rounded-md flex items-center mb-4">
                  <CheckCircle size={18} className="mr-2" />
                  {quantity > 1 ? "Tickets" : "Ticket"} purchased successfully!
                </div>
              )}

              {purchaseStatus === "error" && (
                <div className="bg-red-100 text-red-800 p-3 rounded-md flex items-center mb-4">
                  <AlertCircle size={18} className="mr-2" />
                  There was a problem with your purchase.
                </div>
              )}

              {canBuyMore ? (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">
                      Quantity:
                    </label>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-1 transition-colors disabled:opacity-50"
                      >
                        <MinusCircle size={24} />
                      </button>

                      <span className="text-2xl font-bold text-gray-900 mx-4">
                        {quantity}
                      </span>

                      <button
                        onClick={incrementQuantity}
                        disabled={quantity >= maxPurchasable}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-1 transition-colors disabled:opacity-50"
                      >
                        <PlusCircle size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-4 border-t border-b mb-6">
                    <span className="text-gray-800 font-medium">Total:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {totalPrice.toFixed(5)} ETH
                    </span>
                  </div>

                  <button
                    onClick={handlePurchaseTickets}
                    disabled={purchaseStatus !== "idle"}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-md transition-colors"
                  >
                    {purchaseStatus === "processing"
                      ? "Processing..."
                      : `Buy ${
                          quantity > 1 ? quantity + " Tickets" : "Ticket"
                        }`}
                  </button>
                </>
              ) : (
                <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 text-center">
                  {event.ticketsAvailable > 0
                    ? "Maximum ticket limit reached"
                    : "Sold Out"}
                </div>
              )}

              {hasTicket && (
                <Link
                  to="/dashboard"
                  className="mt-4 block text-center bg-gray-100 text-gray-700 font-medium py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  View My Tickets
                </Link>
              )}

              {canBuyMore && (
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
