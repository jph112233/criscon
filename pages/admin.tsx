import { useState, useEffect } from 'react';
import Head from 'next/head';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { TrashIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';

interface EmailListEntry {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface ConferenceSettings {
  startDate: Date;
  endDate: Date;
  address: string;
  notes: string;
}

export default function AdminPage() {
  const [settings, setSettings] = useState<ConferenceSettings>({
    startDate: new Date(2025, 6, 17),
    endDate: new Date(2025, 6, 22),
    address: '',
    notes: ''
  });

  const [emailList, setEmailList] = useState<EmailListEntry[]>([]);
  const [newEmail, setNewEmail] = useState({
    email: '',
    name: '',
    role: 'attendee',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchEmailList();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          address: data.address,
          notes: data.notes,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showMessage('error', 'Failed to load conference settings');
    }
  };

  const fetchEmailList = async () => {
    try {
      const response = await fetch('/api/admin/emails');
      if (response.ok) {
        const data = await response.json();
        setEmailList(data);
      }
    } catch (error) {
      console.error('Error fetching email list:', error);
      showMessage('error', 'Failed to load email list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        showMessage('success', 'Conference settings updated successfully');
        // Force a hard refresh of all pages to update the conference dates
        window.location.reload();
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showMessage('error', 'Failed to update conference settings');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmail),
      });

      if (response.ok) {
        const data = await response.json();
        setEmailList([...emailList, data]);
        setNewEmail({ email: '', name: '', role: 'attendee' });
        showMessage('success', 'Email added successfully');
      } else {
        throw new Error('Failed to add email');
      }
    } catch (error) {
      console.error('Error adding email:', error);
      showMessage('error', 'Failed to add email');
    }
  };

  const handleDeleteEmail = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/emails/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEmailList(emailList.filter(email => email.id !== id));
        showMessage('success', 'Email removed successfully');
      } else {
        throw new Error('Failed to delete email');
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      showMessage('error', 'Failed to remove email');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <Layout>
      <Head>
        <title>Admin - CRIS Con 2025</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-800 mb-8">Admin Dashboard</h1>

        {/* Conference Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Conference Settings</h2>
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <DatePicker
                  selected={settings.startDate}
                  onChange={(date) => date && setSettings({ ...settings, startDate: date })}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <DatePicker
                  selected={settings.endDate}
                  onChange={(date) => date && setSettings({ ...settings, endDate: date })}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter conference venue address"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={settings.notes}
                  onChange={(e) => setSettings({ ...settings, notes: e.target.value })}
                  className="w-full p-2 border rounded-lg h-32"
                  placeholder="Enter any additional conference information or notes"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* Email List Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Email List Management</h2>
          
          {/* Add Email Form */}
          <form onSubmit={handleEmailSubmit} className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newEmail.email}
                  onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newEmail.name}
                  onChange={(e) => setNewEmail({ ...newEmail, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newEmail.role}
                  onChange={(e) => setNewEmail({ ...newEmail, role: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="attendee">Attendee</option>
                  <option value="speaker">Speaker</option>
                  <option value="organizer">Organizer</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Add Email
              </button>
            </div>
          </form>

          {/* Email List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : emailList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      No emails added yet
                    </td>
                  </tr>
                ) : (
                  emailList.map((email) => (
                    <tr key={email.id} className="border-t">
                      <td className="px-4 py-2">{email.email}</td>
                      <td className="px-4 py-2">{email.name}</td>
                      <td className="px-4 py-2 capitalize">{email.role}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleDeleteEmail(email.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete email"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Toast Message */}
      {message && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}
        >
          {message.text}
        </div>
      )}
    </Layout>
  );
} 