import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { Link } from 'react-router-dom';

const PurchaseTicket = ({ eventId, price, isResale = false, ticketId }) => {
  const { purchaseTicket, purchaseResaleTicket, tickets } = useEventContext();
  const [purchaseStatus, setPurchaseStatus] = useState('idle'); // 'idle' | 'success' | 'error'

  const hasTicket = tickets.some(t => t.eventId === eventId);

  const handlePurchase = () => {
    try {
      if (isResale && ticketId) {
        purchaseResaleTicket(ticketId);
      } else {
        purchaseTicket(eventId);
      }
      setPurchaseStatus('success');

      setTimeout(() => {
        setPurchaseStatus('idle');
      }, 3000);
    } catch (error) {
      setPurchaseStatus('error');

      setTimeout(() => {
        setPurchaseStatus('idle');
      }, 3000);
    }
  };

  if (purchaseStatus === 'success') {
    return (
      <div className="bg-green-100 text-green-800 p-3 rounded-md flex items-center mb-4">
        <CheckCircle size={18} className="mr-2" />
        Ticket purchased successfully!
      </div>
    );
  }

  if (purchaseStatus === 'error') {
    return (
      <div className="bg-red-100 text-red-800 p-3 rounded-md flex items-center mb-4">
        <AlertCircle size={18} className="mr-2" />
        There was a problem with your purchase.
      </div>
    );
  }

  if (hasTicket) {
    return (
      <div className="space-y-3">
        <div className="bg-green-100 text-green-800 p-3 rounded-md flex items-center">
          <CheckCircle size={18} className="mr-2" />
          You already have a ticket for this event!
        </div>
        <Link 
          to="/dashboard" 
          className="block text-center bg-gray-100 text-gray-700 font-medium py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          View My Tickets
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={purchaseStatus !== 'idle'}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-md transition-colors"
    >
      Buy Ticket - ${price.toFixed(2)}
    </button>
  );
};

export default PurchaseTicket;
