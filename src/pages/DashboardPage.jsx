import React, { useState, useEffect } from "react";
import { useEventContext } from "../context/EventContext";
import TicketCard from "../components/TicketCard";
import { TicketCheck } from "lucide-react";
import { ticketsOfUsers } from "../ethers/ethersEvents";
import { ethers } from "ethers";
import { Activity } from "lucide-react";

const EmptyTicketsMessage = () => (
  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
    <p className="text-gray-600 mb-4">You don't have any upcoming events.</p>
    <a
      href="/events"
      className="inline-block bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
    >
      Browse Events
    </a>
  </div>
);

const TicketSection = ({
  title,
  tickets,
  isPast = false,
  badgeColor = "purple",
}) => (
  <section className="mb-10">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <span
        className={`bg-${badgeColor}-100 text-${badgeColor}-800 px-3 py-1 rounded-full text-sm font-medium`}
      >
        {tickets.length} Tickets
      </span>
    </div>

    {tickets.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            event={ticket.eventDetails}
            showResaleOption={!isPast}
            isPast={isPast}
          />
        ))}
      </div>
    ) : (
      <EmptyTicketsMessage />
    )}
  </section>
);
import { isTicketListed } from "../ethers/ethersMarketplace";

const DashboardPage = () => {
  const { events } = useEventContext();
  const [activeTab, setActiveTab] = useState("tickets");
  const [userTickets, setUserTicket] = useState([]);
  const provider = new ethers.BrowserProvider(window.ethereum);

  // Get user's tickets with event information
  useEffect(() => {
    const getUserData = async () => {
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const ticketList = await ticketsOfUsers(userAddress);

      const updatedTickets = [];
      for (const ticket of ticketList) {
        const listed = await isTicketListed(ticket.tokenId);
        updatedTickets.push({ ...ticket, isListed: listed });
      }
      setUserTicket(updatedTickets);
    };
    getUserData();
  }, []);

  const ticketsWithEventData = userTickets.map((ticket) => {
    const event = events.find((e) => e.id === ticket.eventId);
    return { ...ticket, event };
  });

  // Filter tickets by date
  const currentDate = new Date();
  // const upcomingTickets = ticketsWithEventData.filter(
  //   (ticket) => ticket.event && new Date(ticket.event.date) >= currentDate
  // );
  const upcomingTickets = ticketsWithEventData.filter(
    (ticket) => !ticket.forResale
  );
  console.log(upcomingTickets, "ticketWithEvent");
  const pastTickets = ticketsWithEventData.filter(
    (ticket) => ticket.event && new Date(ticket.event.date) < currentDate
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
<<<<<<< HEAD
        <div className="bg-purple-700 p-6 text-white">
          <div className="flex items-center">
            {/* <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full border-4 border-white mr-4 object-cover"
            /> */}
            <div>
              {/* <h1 className="text-2xl font-bold">
                {currentUser.name}'s Dashboard
              </h1> */}
              {/* <p className="text-purple-200">{currentUser.email}</p> */}
            </div>
          </div>
        </div>

=======
>>>>>>> 47762960838a6a878bbdeb0cb6292aa2155eb1e8
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("tickets")}
              className={`py-4 px-6 font-medium flex items-center ${
                activeTab === "tickets"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              <TicketCheck size={18} className="mr-2" />
              My Tickets
            </button>
            {/* <button
              onClick={() => setActiveTab("activity")}
              className={`py-4 px-6 font-medium flex items-center ${
                activeTab === "activity"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              <Activity size={18} className="mr-2" />
              Activity
            </button> */}
          </nav>
        </div>
      </div>

      {activeTab === "tickets" && (
        <div>
          <TicketSection
            title="Upcoming Events"
            tickets={upcomingTickets}
            badgeColor="purple"
          />

          {pastTickets.length > 0 && (
<<<<<<< HEAD
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Past Events
                </h2>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  {pastTickets.length} Tickets
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    event={ticket.event}
                    showResaleOption={false}
                    isPast={true}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* {activeTab === "activity" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Recent Activity
          </h2>

          {tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const event = events.find((e) => e.id === ticket.eventId);
                if (!event) return null;

                return (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-12 h-12 object-cover rounded-md mr-4"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Ticket purchased on{" "}
                          {new Date(ticket.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-4">
                        ${ticket.price.toFixed(2)}
                      </span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-6">
              No activity to display yet.
            </p>
=======
            <TicketSection
              title="Past Events"
              tickets={pastTickets}
              isPast={true}
              badgeColor="gray"
            />
>>>>>>> 47762960838a6a878bbdeb0cb6292aa2155eb1e8
          )}
        </div>
      )} */}
    </div>
  );
};

export default DashboardPage;
