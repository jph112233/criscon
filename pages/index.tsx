import { useState, useEffect } from 'react';
import Head from 'next/head';
import Event from '../components/Event';
import { PlusIcon } from '@heroicons/react/24/solid';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDaysIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Calendar, { CalendarEvent } from '../components/Calendar';
import { format } from 'date-fns';
import Layout from '../components/Layout';

interface ConferenceSettings {
  startDate: Date;
  endDate: Date;
}

interface EventFile {
  id: string;
  filename: string;
  path: string;
  createdAt: Date;
}

interface EventType {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  comments: Array<{
    id: string;
    content: string;
    authorName: string;
    createdAt: Date;
  }>;
  files: EventFile[];
}

console.log('Rendering Index Page');

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [conferenceSettings, setConferenceSettings] = useState<ConferenceSettings | null>(null);

  const getInitialStartDate = () => {
    if (!conferenceSettings) return new Date();
    const today = new Date();
    if (today >= conferenceSettings.startDate && today <= conferenceSettings.endDate) {
      return today;
    }
    return conferenceSettings.startDate;
  };

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(Date.now() + 60 * 60 * 1000),
    location: '',
  });

  const fetchConferenceSettings = async () => {
    try {
      console.log('Fetching conference settings');
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch conference settings');
      }
      const data = await response.json();
      console.log('Received conference settings:', data);
      setConferenceSettings({
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      });
      // Update newEvent times based on conference settings
      setNewEvent(prev => ({
        ...prev,
        startTime: new Date(data.startDate),
        endTime: new Date(new Date(data.startDate).getTime() + 60 * 60 * 1000)
      }));
    } catch (error) {
      console.error('Error fetching conference settings:', error);
      setError('Failed to load conference settings. Please try again later.');
    }
  };

  const convertToCalendarEvents = (apiEvents: EventType[]): CalendarEvent[] => {
    return apiEvents.map(event => {
      const startDate = new Date(event.startTime);
      const endDate = new Date(event.endTime);
      return {
        id: event.id,
        title: event.title,
        time: `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`,
        location: event.location,
        type: 'event' as const,
        date: startDate,
        description: event.description
      };
    });
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchConferenceSettings();
      await fetchEvents();
    };
    initializeData();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data: EventType[] = await response.json();
      const calendarEvents = convertToCalendarEvents(data);
      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent, index: number) => {
    const updatedEvents = [...events];
    // Update the corresponding event in the events array
    updatedEvents[index] = {
      ...updatedEvents[index],
      title: updatedEvent.title,
      location: updatedEvent.location || '',
    };
    setEvents(updatedEvents);
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
        endTime: new Date(getInitialStartDate().getTime() + 60 * 60 * 1000),
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
      if (date < conferenceSettings.startDate) {
        date = conferenceSettings.startDate;
      } else if (date > conferenceSettings.endDate) {
        date = conferenceSettings.endDate;
      }

      // Update end time to be 1 hour after start time if it's before the new start time
      const newEndTime = newEvent.endTime < date ? new Date(date.getTime() + 60 * 60 * 1000) : newEvent.endTime;
      
      setNewEvent({
        ...newEvent,
        startTime: date,
        endTime: newEndTime > conferenceSettings.endDate ? conferenceSettings.endDate : newEndTime,
      });
    } else {
      // For end time, ensure it's after start time and within conference
      if (date <= newEvent.startTime) {
        date = new Date(newEvent.startTime.getTime() + 60 * 60 * 1000);
      }
      if (date > conferenceSettings.endDate) {
        date = conferenceSettings.endDate;
      }
      
      setNewEvent({
        ...newEvent,
        endTime: date,
      });
    }
  };

  const handleDeleteEvent = (deletedEventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => {
      const eventWithId = event as CalendarEvent & { id: string };
      return eventWithId.id !== deletedEventId;
    }));
  };

  const handleUpdateEvent = (eventId: string, updatedEvent: EventType) => {
    console.log('Updating event:', { eventId, updatedEvent });
    const convertedEvent: CalendarEvent = {
      title: updatedEvent.title,
      time: `${format(new Date(updatedEvent.startTime), 'h:mm a')} - ${format(new Date(updatedEvent.endTime), 'h:mm a')}`,
      location: updatedEvent.location,
      type: 'event',
      date: new Date(updatedEvent.startTime),
      id: updatedEvent.id
    };
    
    setEvents(prevEvents => prevEvents.map(event => {
      const eventWithId = event as CalendarEvent & { id: string };
      return eventWithId.id === eventId ? convertedEvent : event;
    }));
  };

  return (
    <Layout>
      <Head>
        <title>CRIS Con 2025</title>
        <meta name="description" content="CRIS Con 2025 - Conference Schedule" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-8">
          CRIS Con 2025 Schedule
        </h1>
        {conferenceSettings ? (
          (() => {
            // This block only executes when conferenceSettings is not null
            const settings = conferenceSettings;
            return (
              <>
                <p className="text-center text-gray-600 mb-8">
                  {format(settings.startDate, 'MMMM d')} - {format(settings.endDate, 'MMMM d, yyyy')}
                </p>
                {error ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 mb-2">{error}</p>
                    <button 
                      onClick={() => {
                        setError(null);
                        fetchConferenceSettings();
                        fetchEvents();
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                  </div>
                ) : (
                  <Calendar 
                    events={events} 
                    conferenceStart={settings.startDate}
                    conferenceEnd={settings.endDate}
                  />
                )}
              </>
            );
          })()
        ) : !error && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading conference settings...</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
