import React, { useEffect, useState } from 'react';
import { useParams, Link, useFetcher } from 'react-router-dom';
import { Calendar, MapPin, Clock, DollarSign, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { getEvent } from '../ethers/ethersEvents';
import { ethers } from 'ethers';
import { buyTicket } from '../ethers/ethersEvents';

const EventDetailsPage = () => {
  const { id } = useParams();
  const { events, purchaseTicket, tickets } = useEventContext();
  const [event, setEvent] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    imageUrl: '',
    price: '',
    ticketsAvailable: '',
    ticketsSold: '',
    organizer: '',
    category: '',
  });
  const [purchaseStatus, setPurchaseStatus] = useState('idle');
  const [isScrolled, setIsScrolled] = useState(false);

  const userTicketsForEvent = tickets.filter(t => t.eventId === id);
  const hasTicket = userTicketsForEvent.length > 0;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      const eventDetails = await getEvent(id);
      setEvent({
        name: eventDetails[0],
        date: new Date(Number(eventDetails[1]) * 1000).toISOString().split('T')[0], // convert timestamp to date
        location: eventDetails[2],
        description: eventDetails[3],
        imageUrl: eventDetails[4],
        price: ethers.formatEther(eventDetails[5]), // convert wei to ether
        ticketsAvailable: Number(eventDetails[6])-(Number(eventDetails[7])),
        ticketsSold: Number(eventDetails[7]),
        organizer: eventDetails[8],
        category: eventDetails[9],
      });
    };

    fetchEvent();
  }, []);

  useEffect(() => {
    console.log(event)
  }, [event])


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <p className="mb-6">The event you are looking for does not exist or has been removed.</p>
        <Link
          to="/events"
          className="inline-block bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          Browse Events
        </Link>
      </div>
    );
  }

  const handlePurchaseTicket = async() => {
    try {
      setPurchaseStatus('processing');

      const ticketMetadata = {
        name: event.name + " Ticket",
        description: "Entry ticket for " + event.name,
        image: event.imageUrl,
        attributes: [
          { trait_type: "Date", value: event.date },
          { trait_type: "Location", value: event.location }
        ]
      };

      const metadataJSON = JSON.stringify(ticketMetadata);
      const ticketURI = `data:application/json;base64,${btoa(metadataJSON)}`;
      const tx = await buyTicket(id, ticketURI, event.price)
      purchaseTicket(event.id);
      setPurchaseStatus('success');

      setEvent({
        'ticketsAvailable': event.ticketsAvailable-1,
        'name': event.name,
        'location': event.location,
        'category': event.category,
        'date': event.date,
        'description': event.description,
        'imageUrl': event.imageUrl,
        'price': event.price,
        'organizer': event.organizer,
        'ticketsSold': event.ticketsSold+1
      })

      console.log(events.ticketsSold)

      setTimeout(() => {
        setPurchaseStatus('idle');
      }, 3000);
    } catch (error) {
      console.log("Error while purchasing: ", error)
      setPurchaseStatus('error');

      setTimeout(() => {
        setPurchaseStatus('idle');
      }, 3000);
    }
  };

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
        className={`sticky top-16 z-20 w-full bg-white shadow-md transition-all duration-300 ${isScrolled ? "py-3" : "py-0 opacity-0 pointer-events-none"
          }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 truncate">
            {event.name}
          </h2>
          {event.ticketsAvailable > 0 ? (
            <button
              onClick={handlePurchaseTicket}
              disabled={hasTicket || purchaseStatus !== "idle"}
              className={`px-4 py-2 rounded-md text-white font-medium ${hasTicket
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
                    <p className="text-gray-700">{event.date}</p>
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
                    <p className="text-gray-700">{event.organizer}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Ticket Purchase */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Get Tickets</h2>

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">Price:</span>
                <span className="text-2xl font-bold text-gray-900">{event.price}</span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-700">Available:</span>
                <span className={`${event.ticketsAvailable > 50 ? 'text-green-600' :
                    event.ticketsAvailable > 10 ? 'text-amber-600' :
                      'text-red-600'
                  } font-medium`}>
                  {event.ticketsAvailable} tickets
                </span>
              </div>

              {purchaseStatus === 'success' && (
                <div className="bg-green-100 text-green-800 p-3 rounded-md flex items-center mb-4">
                  <CheckCircle size={18} className="mr-2" />
                  Ticket purchased successfully!
                </div>
              )}

              {purchaseStatus === 'error' && (
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
                  <button
                    onClick={handlePurchaseTicket}
                    disabled={purchaseStatus !== 'idle'}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-md transition-colors"
                  >
                    Buy Another Ticket
                  </button>
                  <Link
                    to="/dashboard"
                    className="mt-4 block text-center bg-gray-100 text-gray-700 font-medium py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    View My Tickets
                  </Link>
                </div>
              ) : event.ticketsAvailable > 0 ? (
                <button
                  onClick={handlePurchaseTicket}
                  disabled={purchaseStatus !== 'idle'}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-md transition-colors"
                >
                  Buy Ticket
                </button>
              ) : (
                <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 text-center">
                  Sold Out
                </div>
              )}

              {!hasTicket && event.ticketsAvailable > 0 && (
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