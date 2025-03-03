import { useState, useEffect } from 'react';
import Head from 'next/head';
import Event from '../components/Event';
import { PlusIcon } from '@heroicons/react/24/solid';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface EventFile {
  id: string;
  filename: string;
  path: string;
}

interface EventType {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  comments: Array<{
    id: string;
    content: string;
    authorName: string;
    createdAt: Date;
  }>;
  files: EventFile[];
}

console.log('Rendering Index Page'); // Logging for debugging

export default function Home() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
    location: '',
  });

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...'); // Logging for debugging
      const response = await fetch('/api/events');
      const data = await response.json();
      console.log('Fetched events:', data); // Logging for debugging
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error); // Logging for debugging
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting new event:', newEvent); // Logging for debugging

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const createdEvent = await response.json();
      console.log('Event created:', createdEvent); // Logging for debugging

      // Refresh the events list
      await fetchEvents();

      // Reset form and close it
      setShowAddForm(false);
      setNewEvent({
        title: '',
        description: '',
        startTime: new Date(),
        endTime: new Date(),
        location: '',
      });
    } catch (error) {
      console.error('Error creating event:', error); // Logging for debugging
      alert('Failed to create event. Please try again.');
    }
  };

  const handleDateChange = (date: Date | null, field: 'startTime' | 'endTime') => {
    if (date) {
      setNewEvent({ ...newEvent, [field]: date });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <Head>
        <title>CRIS Con 2025</title>
        <meta name="description" content="CRIS Con 2025 Event Schedule" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-2">CRIS Con 2025</h1>
          <p className="text-xl text-gray-600">July 17-22, 2025</p>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors duration-300"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Event
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Add New Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Start Time</label>
                  <DatePicker
                    selected={newEvent.startTime}
                    onChange={(date) => handleDateChange(date, 'startTime')}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">End Time</label>
                  <DatePicker
                    selected={newEvent.endTime}
                    onChange={(date) => handleDateChange(date, 'endTime')}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {events.map((event) => (
            <Event key={event.id} {...event} />
          ))}
        </div>
      </main>

      <footer className="bg-green-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>CRIS Con 2025 - Celebrating Costa Rican Innovation and Science</p>
        </div>
      </footer>
    </div>
  );
}
