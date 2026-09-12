import { useState, useEffect, useRef } from 'react';
import {
  BookOpenIcon,
  VideoCameraIcon,
  UsersIcon,
  EnvelopeIcon,
  InboxIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const DashboardHeader = ({ stats, subscribersToday }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const selectDate = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    setShowCalendar(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  useEffect(() => {
    if (!showCalendar) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowCalendar(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCalendar]);

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate.getDate() && 
           currentMonth.getMonth() === selectedDate.getMonth() && 
           currentMonth.getFullYear() === selectedDate.getFullYear();
  };

  const statCards = [
    {
      title: "Total Stories",
      value: stats.stories,
      change: "+8 this week",
      icon: BookOpenIcon,
      iconBg: "bg-green-500",
      wave: "text-green-400",
    },
    {
      title: "Total Videos",
      value: stats.videos,
      change: "+3 this week",
      icon: VideoCameraIcon,
      iconBg: "bg-purple-500",
      wave: "text-purple-400",
    },
    {
      title: "Registered Users",
      value: stats.users,
      change: "+18 this week",
      icon: UsersIcon,
      iconBg: "bg-blue-500",
      wave: "text-blue-400",
    },
    {
      title: "Contact Messages",
      value: stats.contacts,
      change: "+5 this week",
      icon: EnvelopeIcon,
      iconBg: "bg-orange-500",
      wave: "text-orange-400",
    },
    {
      title: "Newsletter Subscribers",
      value: stats.subscribers,
      change: `+${subscribersToday} today`,
      icon: InboxIcon,
      iconBg: "bg-pink-500",
      wave: "text-pink-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Welcome Back, Admin! 👋
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Here's what's happening in KahaniLand today.
          </p>
        </div>

        <div className="relative z-30" ref={calendarRef}>
          <button
            type="button"
            onClick={() => setShowCalendar((prev) => !prev)}
            className={`flex items-center gap-3 bg-white border rounded-xl px-5 py-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
              showCalendar ? 'border-green-500 ring-2 ring-green-100 shadow-md' : 'hover:border-green-400'
            }`}
            aria-label="Select date"
            aria-expanded={showCalendar}
          >
            <CalendarDaysIcon className="w-6 h-6 text-gray-600" />
            <span className="font-semibold text-gray-700">
              {selectedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                weekday: 'short',
              })}
            </span>
          </button>

          {/* Calendar Popover */}
          {showCalendar && (
            <div
              role="dialog"
              aria-modal="false"
              aria-label="Choose date"
              className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 w-80 max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/10 origin-top-right"
            >
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-slate-600"
                  aria-label="Previous month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-base font-bold text-gray-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-slate-600"
                  aria-label="Next month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-10"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const isTodayDate = isToday(day);
                  const isSelectedDate = isSelected(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => selectDate(day)}
                      className={`
                        h-10 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center
                        ${isSelectedDate 
                          ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm font-bold ring-2 ring-green-300' 
                          : isTodayDate 
                            ? 'bg-green-50 text-green-600 border-2 border-green-400 hover:bg-green-100 font-bold' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setSelectedDate(today);
                    setCurrentMonth(today);
                    setShowCalendar(false);
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setSelectedDate(yesterday);
                    setCurrentMonth(yesterday);
                    setShowCalendar(false);
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border shadow-sm p-5 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex gap-4">
                <div
                  className={`${item.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0`}
                >
                  <Icon className="w-9 h-9 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 text-sm font-semibold truncate">
                    {item.title}
                  </p>
                  <h2 className="text-4xl font-bold text-gray-900 mt-1">
                    {item.value}
                  </h2>
                  <p className="text-green-500 text-sm font-semibold mt-1">
                    {item.change}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <svg
                  viewBox="0 0 120 20"
                  className={`w-full h-6 ${item.wave}`}
                  fill="none"
                >
                  <path
                    d="M0 10 C10 2 20 18 30 10 S50 2 60 10 S80 18 90 10 S110 2 120 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardHeader;