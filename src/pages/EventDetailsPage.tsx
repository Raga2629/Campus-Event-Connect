import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Clock, ArrowLeft, Users, Mail, BookOpen } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
}

interface Registration {
  id: string;
  registered_at: string;
  students: {
    name: string;
    roll_no: string;
    email: string;
    dept: string;
    year: number;
  };
}

export default function EventDetailsPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { userRole } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole !== 'organizer') {
      navigate('/login');
      return;
    }
    fetchEventDetails();
  }, [eventId, userRole, navigate]);

  const fetchEventDetails = async () => {
    try {
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      const { data: registrationsData } = await supabase
        .from('registrations')
        .select('*, students(*)')
        .eq('event_id', eventId)
        .order('registered_at', { ascending: false });

      setEvent(eventData);
      setRegistrations(registrationsData || []);
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Event not found</p>
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => navigate('/organizer/dashboard')}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200 mr-4"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold">Event Details</h1>
              <p className="text-blue-100 text-sm">View registrations and event information</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{event.title}</h2>
          <p className="text-gray-600 mb-6">{event.description}</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
              <Clock className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-semibold text-gray-800">{event.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
              <MapPin className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Venue</p>
                <p className="font-semibold text-gray-800">{event.venue}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={28} />
              <h3 className="text-2xl font-bold text-gray-800">Registered Students</h3>
            </div>
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
              {registrations.length} {registrations.length === 1 ? 'Student' : 'Students'}
            </span>
          </div>

          {registrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Roll No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Year</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Registered At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr key={registration.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-800">
                            {registration.students.roll_no}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-800">{registration.students.name}</td>
                      <td className="py-4 px-4">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                          {registration.students.dept}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        Year {registration.students.year}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={16} />
                          <span className="text-sm">{registration.students.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {new Date(registration.registered_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No students have registered yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Registrations will appear here once students sign up for this event
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
