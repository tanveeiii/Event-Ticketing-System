import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, PlusCircle, BarChart } from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import EventCard from '../components/EventCard';
import { getAvailableEvents } from '../ethers/ethersEvents';

const HomePage = () => {
  const [eventsAdded, setEvents] = useState([]);
  const { events } = useEventContext();
  
  useEffect(() => {
    return async() => {
      const data = await getAvailableEvents();
      const featuredData = data.slice(0,3)
      console.log("HELL")
      console.log(data);
      setEvents(featuredData);
    }
  }, [])
  

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="relative bg-purple-700 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-purple-700/70 z-10"></div>
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-50"></div>
          <div className="relative z-20 px-6 py-16 md:py-24 md:px-12 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Discover Amazing Events
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Find and book tickets for the best concerts, conferences, festivals, and more. Or create your own event and start selling tickets today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/events" 
                className="bg-white text-purple-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-300 text-center"
              >
                Explore Events
              </Link>
              <Link 
                to="/create-event" 
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-300 border border-purple-500 text-center"
              >
                Create Event
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="bg-purple-100 p-4 rounded-full mb-4">
              <Calendar size={28} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Find Events</h3>
            <p className="text-gray-600">Discover events that match your interests and location.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="bg-purple-100 p-4 rounded-full mb-4">
              <Ticket size={28} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Buy Tickets</h3>
            <p className="text-gray-600">Secure your spot with our easy ticket purchasing system.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="bg-purple-100 p-4 rounded-full mb-4">
              <PlusCircle size={28} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Create Events</h3>
            <p className="text-gray-600">Host your own events and sell tickets directly on our platform.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="bg-purple-100 p-4 rounded-full mb-4">
              <BarChart size={28} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Manage Tickets</h3>
            <p className="text-gray-600">Resell tickets you can't use or track your purchases.</p>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Featured Events</h2>
          <Link to="/events" className="text-purple-600 hover:text-purple-700 font-medium">
            View All →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventsAdded.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
