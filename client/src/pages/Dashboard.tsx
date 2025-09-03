import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5001/api/';

interface Note {
  _id: string;
  title: string;
  content: string;
}

interface User {
    name: string;
    email: string;
}

const Dashboard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/signin');
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const config = getAuthHeaders();
      if (!config) return;

      try {
        const [userRes, notesRes] = await Promise.all([
          axios.get(API_URL + 'auth/me', config),
          axios.get(API_URL + 'notes', config)
        ]);
        setUser(userRes.data);
        setNotes(notesRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
        localStorage.removeItem('userToken');
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getAuthHeaders, navigate]);

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;
    const config = getAuthHeaders();
    if (!config) return;

    try {
      const { data: newNote } = await axios.post(API_URL + 'notes', { content: newNoteContent }, config);
      setNotes([newNote, ...notes]);
      setNewNoteContent('');
    } catch (error) {
      console.error('Failed to create note', error);
    }
  };
  
  const handleDeleteNote = async (id: string) => {
    const config = getAuthHeaders();
    if (!config) return;

    try {
      await axios.delete(`${API_URL}notes/${id}`, config);
      setNotes(notes.filter(note => note._id !== id));
    } catch (error) {
        console.error('Failed to delete note', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/signin');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600">
            Logout
          </button>
        </header>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <textarea
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Create a new note..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            rows={3}
          ></textarea>
          <button onClick={handleCreateNote} className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
            Create Note
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Your Notes</h2>
          <div className="space-y-4">
            {notes.length > 0 ? (
              notes.map(note => (
                <div key={note._id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-start">
                  <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  <button onClick={() => handleDeleteNote(note._id)} className="text-red-500 hover:text-red-700 font-bold ml-4">
                    X
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">You have no notes yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;