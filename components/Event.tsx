import React, { useState } from 'react';
import { TrashIcon, CalendarIcon, PencilIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface EventFile {
  id: string;
  filename: string;
  path: string;
}

interface EventProps {
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
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedEvent: any) => void;
}

const Event: React.FC<EventProps> = ({
  id,
  title,
  description,
  startTime,
  endTime,
  location,
  comments,
  files,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState({
    title,
    description,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    location,
  });

  console.log('Rendering Event component:', { id, title }); // Logging for debugging

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      onDelete(id);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updatedEvent = await response.json();
      onUpdate(id, updatedEvent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event. Please try again.');
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={editedEvent.title}
              onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editedEvent.description}
              onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
              className="w-full p-2 border rounded-md"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <DatePicker
                selected={editedEvent.startTime}
                onChange={(date) => date && setEditedEvent({ ...editedEvent, startTime: date })}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <DatePicker
                selected={editedEvent.endTime}
                onChange={(date) => date && setEditedEvent({ ...editedEvent, endTime: date })}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={editedEvent.location}
              onChange={(e) => setEditedEvent({ ...editedEvent, location: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">{title}</h3>
          <p className="text-gray-600 mb-2">
            {format(new Date(startTime), 'MMM d, yyyy h:mm a')} -{' '}
            {format(new Date(endTime), 'h:mm a')}
          </p>
          <p className="text-gray-600 mb-4">{location}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-gray-700"
            title="Edit event"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => {/* Add to calendar functionality */}}
            className="text-gray-500 hover:text-gray-700"
            title="Add to calendar"
          >
            <CalendarIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
            title="Delete event"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{description}</p>

      {comments.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Comments</h4>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-3 rounded">
                <p className="text-gray-700">{comment.content}</p>
                <div className="text-sm text-gray-500 mt-1">
                  {comment.authorName} - {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Attached Files</h4>
          <div className="space-y-1">
            {files.map((file) => (
              <div key={file.id} className="flex items-center text-blue-600 hover:text-blue-800">
                <a href={file.path} target="_blank" rel="noopener noreferrer">
                  {file.filename}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Event; 