import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventContext } from "../context/EventContext";
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Image,
  Info,
} from "lucide-react";
import { createEvent } from "../ethers/ethersEvents";
import { ethers } from "ethers";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { addEvent } = useEventContext();

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    // time: "",
    location: "",
    description: "",
    price: "",
    capacity: "",
    imageUrl: "",
    category: "music",
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

    const newEvent = {
      id: Date.now().toString(),
      ...formData,
      price: parseFloat(formData.price),
      capacity: parseInt(formData.capacity),
      ticketsSold: 0,
      createdAt: new Date().toISOString(),
    };

    const txData = await createEvent(
      formData.title,
      Math.floor(new Date(formData.date).getTime() / 1000),
      ethers.parseEther(formData.price.toString()),
      Number(formData.capacity),
      formData.location,
      formData.description,
      formData.imageUrl,
      formData.category
    );
    console.log(txData);
    const receipt = await txData.wait();
    const logs = receipt.logs[0];
    const eventArgs = logs.args;
    console.log(eventArgs[0]);
    addEvent(newEvent);
    navigate("/events/" + eventArgs[0]);
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
            Event Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="date"
            >
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Date</span>
              </div>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={(() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 2);
                return tomorrow.toISOString().split("T")[0];
              })()}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* <div>
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="time"
            >
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>Time</span>
              </div>
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div> */}
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="location"
          >
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>Location</span>
            </div>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="description"
          >
            <div className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              <span>Description</span>
            </div>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
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
              step="0.00001"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="capacity"
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>Capacity</span>
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
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="imageUrl"
          >
            <div className="flex items-center">
              <Image className="h-5 w-5 mr-2" />
              <span>Event Image URL</span>
            </div>
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="category"
          >
            Event Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          >
            <option value="music">Music</option>
            <option value="sports">Sports</option>
            <option value="theater">Theater</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="other">Other</option>
          </select>
        </div>

        {isSubmitting && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md">
            <p className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating your event on the blockchain. Please wait...
            </p>
          </div>
        )}

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
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
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
