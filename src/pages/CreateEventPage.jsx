import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventContext } from "../context/EventContext";
import { Calendar, Clock, DollarSign, Users } from "lucide-react";
import { createEvent } from "../ethers/ethersEvents"; // Adjust the import path as needed

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { addEvent } = useEventContext();

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    price: "",
    capacity: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert date to Unix timestamp (seconds)
      const eventDateTimestamp = Math.floor(
        new Date(formData.date).getTime() / 1000
      );

      // Convert price to wei (smallest unit)
      const priceInWei = parseFloat(formData.price) * 10 ** 18; // Convert to wei

      // Call the blockchain function
      const tx = await createEvent(
        formData.title,
        eventDateTimestamp,
        priceInWei.toString(),
        formData.capacity
      );

      // Add to local context as well
      const newEvent = {
        id: Date.now().toString(),
        title: formData.title,
        date: formData.date,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity),
        ticketsSold: 0,
        createdAt: new Date().toISOString(),
        txHash: tx.hash, // Store transaction hash
      };

      addEvent(newEvent);
      navigate("/events/" + newEvent.id);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. See console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Create New Event</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="mb-6">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="title"
          >
            Event Name
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="date"
          >
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>Event Date</span>
            </div>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="price"
          >
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              <span>Ticket Price (ETH)</span>
            </div>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            min="0"
            step="0.001"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="capacity"
          >
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              <span>Total Tickets</span>
            </div>
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 mr-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
