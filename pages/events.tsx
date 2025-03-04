import { useState, useEffect } from 'react';
import Head from 'next/head';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import Layout from '../components/Layout';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Event {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(Date.now() + 60 * 60 * 1000),
    location: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data.map((event: any) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
      })));
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setEvents([...events, { ...createdEvent, startTime: new Date(createdEvent.startTime), endTime: new Date(createdEvent.endTime) }]);
      setShowAddModal(false);
      setNewEvent({
        title: '',
        description: '',
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        location: '',
      });
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      const response = await fetch(`/api/events?id=${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updatedEvent = await response.json();
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...updatedEvent, startTime: new Date(updatedEvent.startTime), endTime: new Date(updatedEvent.endTime) }
          : event
      ));
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setEvents(events.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const EventForm = ({ event, onSubmit, onCancel }: { 
    event: Omit<Event, 'id'> | Event, 
    onSubmit: (e: React.FormEvent) => void,
    onCancel: () => void 
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={event.title}
          onChange={(e) => 'id' in event 
            ? setEditingEvent({ ...event, title: e.target.value })
            : setNewEvent({ ...newEvent, title: e.target.value })
          }
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={event.description}
          onChange={(e) => 'id' in event
            ? setEditingEvent({ ...event, description: e.target.value })
            : setNewEvent({ ...newEvent, description: e.target.value })
          }
          className="w-full p-2 border rounded-lg h-32"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <DatePicker
            selected={event.startTime}
            onChange={(date) => date && ('id' in event
              ? setEditingEvent({ ...event, startTime: date })
              : setNewEvent({ ...newEvent, startTime: date })
            )}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <DatePicker
            selected={event.endTime}
            onChange={(date) => date && ('id' in event
              ? setEditingEvent({ ...event, endTime: date })
              : setNewEvent({ ...newEvent, endTime: date })
            )}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full p-2 border rounded-lg"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          value={event.location}
          onChange={(e) => 'id' in event
            ? setEditingEvent({ ...event, location: e.target.value })
            : setNewEvent({ ...newEvent, location: e.target.value })
          }
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {'id' in event ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );

  return (
    <Layout>
      <Head>
        <title>Manage Events - CRIS Con 2025</title>
        <meta name="description" content="Manage CRIS Con 2025 Events" />
      </Head>

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Manage Events</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <PlusIcon className="h-5 w-5" />
            Add Event
          </button>
        </div>

        {error ? (
          <div className="text-center py-4">
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={fetchEvents}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime()).map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-green-800">{event.title}</h3>
                    <p className="text-gray-600">
                      {format(event.startTime, 'MMMM d, yyyy h:mm aa')} - {format(event.endTime, 'h:mm aa')}
                    </p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{event.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold text-green-800 mb-4">Add New Event</h2>
              <EventForm 
                event={newEvent}
                onSubmit={handleSubmit}
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </div>
        )}

        {/* Edit Event Modal */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold text-green-800 mb-4">Edit Event</h2>
              <EventForm 
                event={editingEvent}
                onSubmit={handleUpdate}
                onCancel={() => setEditingEvent(null)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 