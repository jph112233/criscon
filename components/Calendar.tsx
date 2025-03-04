'use client';

import React, { useState, useEffect } from 'react';
import { format, parse, parseISO } from 'date-fns';
import Link from 'next/link';

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  location?: string;
  type: 'meeting' | 'free' | 'event';
  date: Date;
  description?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventUpdate?: (updatedEvent: CalendarEvent, index: number) => void;
  conferenceStart: Date;
  conferenceEnd: Date;
}

const Calendar: React.FC<CalendarProps> = ({ 
  events, 
  onEventUpdate,
  conferenceStart,
  conferenceEnd
}) => {
  // Calculate days based on conference dates
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const daysDiff = Math.ceil((conferenceEnd.getTime() - conferenceStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const dates = Array.from({ length: daysDiff }, (_, i) => {
    const date = new Date(conferenceStart);
    date.setDate(date.getDate() + i);
    return date.getDate();
  });

  const [selectedDate, setSelectedDate] = useState(conferenceStart.getDate());
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Update filtered events when selected date changes
  useEffect(() => {
    console.log('\n--- Filtering Events ---');
    console.log('Selected date:', selectedDate);
    console.log('Total events to filter:', events.length);
    
    const newFilteredEvents = events.filter(event => {
      try {
        const eventDate = new Date(event.date);
        console.log('Filtering event:', {
          title: event.title,
          eventDate: eventDate.toLocaleString(),
          eventDay: eventDate.getDate(),
          selectedDate,
          matches: eventDate.getDate() === selectedDate
        });
        
        return eventDate.getDate() === selectedDate;
      } catch (error) {
        console.error('Error filtering event:', event, error);
        return false;
      }
    });

    console.log('Filtered events:', newFilteredEvents);
    setFilteredEvents(newFilteredEvents);
  }, [selectedDate, events]);

  const handleDateClick = (date: number) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans relative">
      {/* Header */}
      <div className="flex justify-center items-center mb-6">
        <Link href="/">
          <h1 className="text-2xl font-bold text-green-800 hover:text-green-600 transition-colors cursor-pointer">
            {format(conferenceStart, 'MMMM yyyy')}
          </h1>
        </Link>
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        {dates.map((date, index) => {
          const currentDate = new Date(conferenceStart);
          currentDate.setDate(currentDate.getDate() + index);
          const dayName = days[currentDate.getDay()];
          
          return (
            <div 
              key={date} 
              className="text-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleDateClick(date)}
            >
              <div className="text-gray-600 mb-1">{dayName}</div>
              <div className={`text-2xl font-semibold ${
                date === selectedDate 
                  ? 'bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto'
                  : ''
              }`}>
                {date}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="bg-gray-100 rounded-full p-1 flex">
          <button className="flex-1 py-2 px-4 rounded-full">Sessions</button>
          <button className="flex-1 py-2 px-4 rounded-full bg-green-600 text-white">My Agenda</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 overflow-x-auto">
        <button className="px-4 py-2 rounded-full border border-green-300 text-green-700 whitespace-nowrap hover:bg-green-50">
          Favorited
        </button>
        <button className="px-4 py-2 rounded-full border border-green-300 text-green-700 whitespace-nowrap hover:bg-green-50">
          Reserved
        </button>
        <button className="px-4 py-2 rounded-full border border-green-300 text-green-700 whitespace-nowrap hover:bg-green-50">
          Meetings
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-green-800">
          {format(new Date(conferenceStart.getFullYear(), conferenceStart.getMonth(), selectedDate), 'EEEE, MMMM d')}
        </h2>
        
        {filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg bg-green-50 hover:bg-green-100 cursor-pointer transition-colors"
                onClick={() => handleEventClick(event)}
              >
                <div>
                  <div className="text-sm mb-1 text-green-700">{event.time}</div>
                  <div className="font-semibold text-lg mb-1">{event.title}</div>
                  {event.location && (
                    <div className="text-sm text-gray-600">{event.location}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No events scheduled for {format(new Date(conferenceStart.getFullYear(), conferenceStart.getMonth(), selectedDate), 'MMMM d, yyyy')}
          </div>
        )}
        
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <div>Selected Date: {selectedDate}</div>
            <div>Total Events: {events.length}</div>
            <div>Filtered Events: {filteredEvents.length}</div>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {showDetailsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-green-800">{selectedEvent.title}</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Time</div>
                <div className="text-green-700">{selectedEvent.time}</div>
              </div>
              {selectedEvent.location && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Location</div>
                  <div className="text-gray-700">{selectedEvent.location}</div>
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Description</div>
                  <div className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</div>
                </div>
              )}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar; 