import React, { createContext, useState, useContext, ReactNode } from "react";
import { Event, Ticket, User } from "../types";
import {
  events as mockEvents,
  tickets as mockTickets,
  currentUser as mockUser,
} from "../data/mockData";

interface EventContextType {
  events: Event[];
  tickets: Ticket[];
  addEvent: (event: Omit<Event, "id">) => void;
  purchaseTicket: (eventId: string) => void;
  toggleTicketResale: (ticketId: string, resalePrice?: number) => void;
  purchaseResaleTicket: (ticketId: string) => void;
}

export const EventContext = createContext<EventContextType | undefined>(
  undefined
);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [currentUser] = useState<User>(mockUser);

  const addEvent = (event: Omit<Event, "id">) => {
    const newEvent: Event = {
      ...event,
      id: `event${events.length + 1}`,
      availableTickets: Number(event.availableTickets),
      price: Number(event.price),
    };
    setEvents([...events, newEvent]);
  };

  const purchaseTicket = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event || event.availableTickets <= 0) return;

    // Create a new ticket
    const newTicket: Ticket = {
      id: `ticket${tickets.length + 1}`,
      eventId,
      userId: currentUser.id,
      purchaseDate: new Date().toISOString().split("T")[0],
      price: event.price,
      forResale: false,
    };

    // Update available tickets
    setEvents(
      events.map((e) =>
        e.id === eventId
          ? { ...e, availableTickets: e.availableTickets - 1 }
          : e
      )
    );

    // Add the ticket to user's tickets
    setTickets([...tickets, newTicket]);
  };

  const toggleTicketResale = (ticketId: string, resalePrice?: number) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          const forResale = !ticket.forResale;
          return {
            ...ticket,
            forResale,
            resalePrice: forResale ? resalePrice || ticket.price : undefined,
          };
        }
        return ticket;
      })
    );
  };

  const purchaseResaleTicket = (ticketId: string) => {
    // Find the ticket and its associated event
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || !ticket.forResale) return;

    // Update ticket with new owner
    setTickets(
      tickets.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            userId: currentUser.id,
            purchaseDate: new Date().toISOString().split("T")[0],
            forResale: false,
            resalePrice: undefined,
          };
        }
        return t;
      })
    );
  };

  return (
    <EventContext.Provider
      value={{
        events,
        tickets,
        addEvent,
        purchaseTicket,
        toggleTicketResale,
        purchaseResaleTicket,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEventContext must be used within an EventProvider");
  }
  return context;
};
