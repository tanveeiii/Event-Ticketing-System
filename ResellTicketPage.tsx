import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventContext } from '../context/EventContext';
import { DollarSign } from 'lucide-react';

const ResellTicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tickets, events, toggleTicketResale } = useEventContext();
  
  const ticket = tickets.find(t => t.id === id);
  const event = ticket ? events.find(e => e.id === ticket.eventId) : null;
  
  const [resalePrice, setResalePrice] = useState(ticket?.price.toString() || '');
  const [error, setError] = useState('');

  if (!ticket || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Ticket not found
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(resalePrice);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    toggleTicketResale(ticket.id, price);
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-purple-700 p-6 text-white">
          <h1 className="text-2xl font-bold">List Ticket for Resale</h1>
          <p className="text-purple-200 mt-2">{event.title}</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Ticket Details</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600">Original Purchase Price: ${ticket.price.toFixed(2)}</p>
              <p className="text-gray-600">Event Date: {new Date(event.date).toLocaleDateString()}</p>
              <p className="text-gray-600">Location: {event.location}</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="resalePrice">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span>Set Resale Price</span>
                </div>
              </label>
              <input
                type="number"
                id="resalePrice"
                value={resalePrice}
                onChange={(e) => {
                  setResalePrice(e.target.value);
                  setError('');
                }}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
              >
                List for Resale
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResellTicketPage;