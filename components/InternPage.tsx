import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

const InternPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full px-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tight">
            Application received
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Thanks for applying. Our team will review your internship request and
            reach out within 5–7 business days.
          </p>
          <Link
            to="/"
            className="inline-block border-b-2 border-black pb-1 text-sm font-bold uppercase tracking-widest hover:text-gray-600 hover:border-gray-600 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-10 min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 mb-20">
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
            Internship
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
            Join MOCA Gandhinagar as an intern. Work with exhibitions, visitor
            experience, and operations while building real-world museum skills.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-2xl font-bold mb-8">
              Internship Tracks
            </h3>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">
                    Exhibitions & Programming
                  </h4>
                  <p className="text-gray-600">
                    Support exhibition planning, event logistics, and artist
                    talks. Great for students exploring curatorial work.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">
                    Education & Outreach
                  </h4>
                  <p className="text-gray-600">
                    Assist school visits, guided experiences, and learning
                    resources for public audiences.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">
                    Operations & Visitor Experience
                  </h4>
                  <p className="text-gray-600">
                    Work with admissions, shop operations, and visitor
                    communications. Learn how a museum runs day-to-day.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-8 bg-gray-50 rounded-2xl">
              <h4 className="font-bold mb-4">What you get</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-black rounded-full" />{' '}
                  Internship certificate (on completion)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-black rounded-full" />{' '}
                  Mentorship from MOCA staff
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-black rounded-full" />{' '}
                  Museum shop discounts and free entry
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-lg h-fit">
            <h3 className="text-2xl font-bold mb-6">
              Apply for Internship
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    First Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Last Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Email
                </label>
                <input
                  required
                  type="email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Track
                  </label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black">
                    <option>Exhibitions & Programming</option>
                    <option>Education & Outreach</option>
                    <option>Operations & Visitor Experience</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Availability
                </label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black">
                  <option>Weekdays</option>
                  <option>Weekends</option>
                  <option>Flexible</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
              >
                Submit Application
              </button>
              <p className="text-[10px] text-gray-400 text-center">
                This form records interest. A coordinator will contact you for next
                steps.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternPage;

