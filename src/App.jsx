import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { EventProvider } from "./context/EventContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import CreateEventPage from "./pages/CreateEventPage";
import ResellTicketPage from "./pages/ResellTicketPage";
import MarketplacePage from "./pages/MarketplacePage";
import CreatedEvents from "./pages/CreatedEvents";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <EventProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/create-event" element={<CreateEventPage />} />
              <Route path="/resell-ticket/:id" element={<ResellTicketPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/created-events" element={<CreatedEvents />} />
            </Routes>
          </main>
        </div>
        <ToastContainer />
      </Router>
    </EventProvider>
  );
}

export default App;
