import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Tag } from "lucide-react";
import PurchaseTicket from "./PurchaseTicket";
import formatDate from "../utils/fornatDate";
import { listTicket, cancelListing } from "../ethers/ethersMarketplace";
import { buyResaleTicket } from "../ethers/ethersMarketplace";
import { ethers } from "ethers";

const TicketCard = ({
  ticket,
  event,
  showResaleOption = false,
  isPast = false,
  isMarketplace = false,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [resalePriceInput, setResalePriceInput] = useState("");
  const [address, setAddress] = useState("");
  useEffect(() => {
    return async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log(address);
      setAddress(address);
    };
  }, []);

  console.log(address);
  console.log(ticket, "tivcke");

  const handleListClick = () => {
    setShowInput(true);
  };

  const handleConfirmResale = async () => {
    if (resalePriceInput) {
      const tx = await listTicket(ticket.tokenId, resalePriceInput);
      console.log(tx, "tx");
      navigate("/marketplace");
    } else {
      alert("Please enter a resale price.");
    }
  };

  const handleBuyResale = async () => {
    if (ticket.price) {
      const tx = await buyResaleTicket(ticket.tokenId);
      console.log(tx, "tx");
      navigate("/dashboard");
    } else {
      alert("Please enter a resale price.");
    }
  };
  const handleCancelListing = async (tokenId) => {
    try {
      console.log(tokenId, "hi ha token id");
      await cancelListing(tokenId);
      alert("Listing cancelled!");
    } catch (error) {
      console.error("Error cancelling listing:", error);
      alert("Failed to cancel listing");
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-200 
        ${isHovered && !isPast ? "transform -translate-y-1" : ""} 
        ${isPast ? "opacity-75" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img
          src={
            ticket.eventDetails.imageUrl ||
            "https://via.placeholder.com/400x300?text=No+Image"
          }
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
                ? `Resale Price: ${
                    ticket?.resalePrice
                      ? Number(ticket.resalePrice).toFixed(2)
                      : "0.00"
                  } ETH`
                : `Original Price: ${ticket?.eventDetails?.price / 1e18} ETH`}
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
        {/* Resale Price Input */}
        {showInput && !isPast && (
          <div className="mt-4">
            <input
              type="number"
              step="0.0001"
              min="0"
              placeholder="Enter resale price in ETH"
              value={resalePriceInput}
              onChange={(e) => setResalePriceInput(e.target.value)}
              className="w-full p-2 border rounded-md mb-2"
            />
            <button
              onClick={handleConfirmResale}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Confirm Resale
            </button>
          </div>
        )}

        {/* Resell Button */}
        {address === ticket.seller || showResaleOption ? (
          showResaleOption && !isPast && !ticket?.isListed && !showInput ? (
            <button
              onClick={handleListClick}
              className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              List for Resale
            </button>
          ) : (
            showResaleOption &&
            ticket?.isListed && (
              <button
                onClick={() => handleCancelListing(ticket.tokenId)}
                className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Cancel the listing
              </button>
            )
          )
        ) : (
          isMarketplace && (
            <button
              onClick={handleBuyResale}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors mt-2 flex items-center justify-center"
            >
              <span className="mr-1">Buy Ticket</span>
            </button>
          )
        )}

        {/* Event date */}

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
