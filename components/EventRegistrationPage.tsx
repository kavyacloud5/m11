import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Mail, Phone, Ticket, User } from 'lucide-react';
import { getEvents, saveEventRegistration } from '../services/data';
import { Event, EventRegistration } from '../types';

const EventRegistrationPage: React.FC = () => {
  const { eventId } = useParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: 1,
  });

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await getEvents();
        setEvents(data);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const event = useMemo(
    () => events.find((e) => e.id === eventId),
    [events, eventId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !eventId) return;

    setSubmitting(true);
    try {
      const reg: EventRegistration = {
        id: `evreg-${Date.now()}`,
        eventId,
        eventTitle: event.title,
        name: form.name,
        email: form.email,
        phone: form.phone.trim() ? form.phone.trim() : undefined,
        quantity: Number(form.quantity) || 1,
        timestamp: Date.now(),
        status: 'Pending',
      };
      await saveEventRegistration(reg);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading event…
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-10 min-h-screen bg-gray-50">
        <div className="max-w-[900px] mx-auto px-6 mb-20">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            Event not found
          </h1>
          <p className="text-gray-500 font-medium">
            This event may have been removed or is not available.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full px-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tight">
            Registration received
          </h2>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            Thanks, <span className="font-bold text-black">{form.name}</span>.
            <br />
            We’ve recorded your registration for{' '}
            <span className="font-bold text-black">{event.title}</span>.
          </p>
          <Link
            to="/events"
            className="inline-block border-b-2 border-black pb-1 text-sm font-bold uppercase tracking-widest hover:text-gray-600 hover:border-gray-600 transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-10 min-h-screen bg-gray-50">
      <div className="max-w-[1000px] mx-auto px-6 mb-20">
        <div className="mb-10">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            Register
          </h1>
          <p className="text-gray-600 font-medium mt-3">
            {event.title} • {event.date}
            {event.location ? ` • ${event.location}` : ''}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-black uppercase tracking-widest text-gray-300">
                    No image
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-700 mb-4">
                  <Ticket className="w-3 h-3" /> {event.type}
                </div>
                {event.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                    Full Name
                  </label>
                  <div className="flex items-center gap-3 border-2 border-gray-100 rounded-xl px-4">
                    <User className="w-4 h-4 text-gray-300" />
                    <input
                      required
                      className="w-full py-4 font-bold outline-none"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                    Email
                  </label>
                  <div className="flex items-center gap-3 border-2 border-gray-100 rounded-xl px-4">
                    <Mail className="w-4 h-4 text-gray-300" />
                    <input
                      required
                      type="email"
                      className="w-full py-4 font-bold outline-none"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                    Phone (optional)
                  </label>
                  <div className="flex items-center gap-3 border-2 border-gray-100 rounded-xl px-4">
                    <Phone className="w-4 h-4 text-gray-300" />
                    <input
                      className="w-full py-4 font-bold outline-none"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3 border-2 border-gray-100 rounded-xl px-4">
                    <Ticket className="w-4 h-4 text-gray-300" />
                    <input
                      type="number"
                      min={1}
                      max={20}
                      className="w-full py-4 font-bold outline-none"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          quantity: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-5 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {submitting ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <Check className="w-5 h-5" />
                )}{' '}
                Submit Registration
              </button>
              <p className="text-[10px] text-gray-400 text-center">
                Admin can confirm registrations from the Staff portal.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationPage;

