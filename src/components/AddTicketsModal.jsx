import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddTicketsModal = ({ event, isOpen, onClose, onAddTickets }) => {
  const [ticketCount, setTicketCount] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (ticketCount <= 0) {
      setError('Please enter a valid number of tickets');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onAddTickets(event.id, ticketCount);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add tickets. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 animate-fade-in"
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Add Tickets</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <div className="h-12 w-12 flex-shrink-0 mr-3">
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src={event.imageUrl || "/placeholder.png"}
                  alt={event.name}
                />
              </div>
              <div>
                <p className="font-medium text-gray-900">{event.name}</p>
                <p className="text-sm text-gray-500">
                  Current tickets: {event.ticketsSold} / {event.totalTickets}
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="ticketCount" className="block text-sm font-medium text-gray-700 mb-1">
                Number of additional tickets
              </label>
              <input
                id="ticketCount"
                type="number"
                // min="0"
                value={ticketCount}
                onChange={(e) => setTicketCount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter number of tickets"
                required
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 border border-transparent rounded-md font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Tickets'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTicketsModal;