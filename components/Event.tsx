import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, MapPinIcon, ChatBubbleLeftIcon, PaperClipIcon, TrashIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: Date;
}

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
  comments: Comment[];
  files: EventFile[];
  onDelete: (id: string) => void;
}

export default function Event({
  id,
  title,
  description,
  startTime,
  endTime,
  location,
  comments: initialComments,
  files: initialFiles,
  onDelete,
}: EventProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [files, setFiles] = useState<EventFile[]>(initialFiles);
  const [newComment, setNewComment] = useState({ content: '', authorName: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  console.log(`Rendering event: ${title}`); // Logging for debugging

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding comment:', newComment); // Logging for debugging

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newComment,
          eventId: id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const addedComment = await response.json();
      console.log('Comment added:', addedComment); // Logging for debugging
      setComments([addedComment, ...comments]);
      setNewComment({ content: '', authorName: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    console.log('Uploading file:', selectedFile.name); // Logging for debugging

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('eventId', id);

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const uploadedFile = await response.json();
      console.log('File uploaded:', uploadedFile); // Logging for debugging
      setFiles([uploadedFile, ...files]);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
              <h2 className="text-2xl font-bold text-green-800 mb-2">{title}</h2>
              
              <div className="flex items-center text-gray-600 mb-2">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span>{format(new Date(startTime), 'MMM dd, yyyy h:mm a')} - {format(new Date(endTime), 'h:mm a')}</span>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span>{location}</span>
              </div>

              <div className="flex space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                  <span>{comments.length} comments</span>
                </div>
                <div className="flex items-center">
                  <PaperClipIcon className="h-4 w-4 mr-1" />
                  <span>{files.length} attachments</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isExpanded && (
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                title="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className={`p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Delete event"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 animate-fadeIn">
            <p className="text-gray-700 mb-4">{description}</p>
            
            {/* Comments Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-green-700 mb-3">Comments</h3>
              
              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={newComment.authorName}
                    onChange={(e) => setNewComment({ ...newComment, authorName: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                  <textarea
                    placeholder="Add a comment..."
                    value={newComment.content}
                    onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    rows={2}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add Comment
                  </button>
                </div>
              </form>

              {/* Comments List */}
              {comments.map((comment: Comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg mb-2">
                  <p className="text-sm text-gray-800">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    By {comment.authorName} on {format(new Date(comment.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              ))}
            </div>

            {/* Files Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-green-700 mb-3">Attachments</h3>
              
              {/* File Upload Form */}
              <form onSubmit={handleFileUpload} className="mb-4">
                <div className="space-y-2">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    disabled={!selectedFile}
                  >
                    Upload File
                  </button>
                </div>
              </form>

              {/* Files List */}
              {files.map((file: EventFile) => (
                <div key={file.id} className="flex items-center space-x-2 text-sm text-gray-600">
                  <PaperClipIcon className="h-4 w-4" />
                  <a href={file.path} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {file.filename}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold">Delete Event</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 