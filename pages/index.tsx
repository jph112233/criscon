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
  const [isLoading, setIsLoading] = useState(true);

  // Conference dates
  const CONFERENCE_START = new Date(2025, 6, 17); // July 17, 2025
  const CONFERENCE_END = new Date(2025, 6, 22, 23, 59, 59); // July 22, 2025 23:59:59

  const getInitialStartDate = () => {
    const today = new Date();
    // If today is within conference dates, use today, otherwise use conference start
    if (today >= CONFERENCE_START && today <= CONFERENCE_END) {
      return today;
    }
    return CONFERENCE_START;
  };

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: getInitialStartDate(),
    endTime: new Date(getInitialStartDate().getTime() + 60 * 60 * 1000), // 1 hour after start time
    location: '',
  });

  console.log('Initial event dates:', { start: newEvent.startTime, end: newEvent.endTime }); // Logging for debugging

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...'); // Logging for debugging
      setIsLoading(true);
      const response = await fetch('/api/events');
      const data = await response.json();
      console.log('Fetched events:', data); // Logging for debugging
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error); // Logging for debugging
      alert('Failed to fetch events. Please refresh the page.');
    } finally {
      setIsLoading(false);
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

      // Add the new event to the list
      setEvents([...events, createdEvent]);

      // Reset form and close it
      setShowAddForm(false);
      setNewEvent({
        title: '',
        description: '',
        startTime: getInitialStartDate(),
        endTime: new Date(getInitialStartDate().getTime() + 60 * 60 * 1000), // 1 hour after start time
        location: '',
      });
    } catch (error) {
      console.error('Error creating event:', error); // Logging for debugging
      alert('Failed to create event. Please try again.');
    }
  };

  const handleDateChange = (date: Date | null, field: 'startTime' | 'endTime') => {
    if (!date) return;

    console.log('Date change:', { field, date }); // Logging for debugging

    if (field === 'startTime') {
      // Ensure date is within conference period
      if (date < CONFERENCE_START) {
        date = CONFERENCE_START;
      } else if (date > CONFERENCE_END) {
        date = CONFERENCE_END;
      }

      // Update end time to be 1 hour after start time if it's before the new start time
      const newEndTime = newEvent.endTime < date ? new Date(date.getTime() + 60 * 60 * 1000) : newEvent.endTime;
      
      setNewEvent({
        ...newEvent,
        startTime: date,
        endTime: newEndTime > CONFERENCE_END ? CONFERENCE_END : newEndTime,
      });
    } else {
      // For end time, ensure it's after start time and within conference
      if (date <= newEvent.startTime) {
        date = new Date(newEvent.startTime.getTime() + 60 * 60 * 1000);
      }
      if (date > CONFERENCE_END) {
        date = CONFERENCE_END;
      }
      
      setNewEvent({
        ...newEvent,
        endTime: date,
      });
    }
  };

  const handleDeleteEvent = (deletedEventId: string) => {
    setEvents(events.filter(event => event.id !== deletedEventId));
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
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-800">Add New Event</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
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
                    minDate={CONFERENCE_START}
                    maxDate={CONFERENCE_END}
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be between July 17-22, 2025</p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">End Time</label>
                  <DatePicker
                    selected={newEvent.endTime}
                    onChange={(date) => handleDateChange(date, 'endTime')}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full p-2 border rounded-lg"
                    minDate={newEvent.startTime}
                    maxDate={CONFERENCE_END}
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be after start time and before July 22, 2025</p>
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

              <div className="flex justify-end">
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
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No events found. Add your first event!</p>
            </div>
          ) : (
            events.map((event) => (
              <Event key={event.id} {...event} onDelete={handleDeleteEvent} />
            ))
          )}
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
