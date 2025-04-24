export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Event {
  id: string;
  title: string;
  type: string;
  location: string;
  date: string;
  time: string;
  description: string;
  price: number;
  image: string;
  organizer: string;
  availableTickets: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  purchaseDate: string;
  price: number;
  forResale: boolean;
  resalePrice?: number;
}