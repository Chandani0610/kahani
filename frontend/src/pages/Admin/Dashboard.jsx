import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenIcon,
  VideoCameraIcon,
  UsersIcon,
  EnvelopeIcon,
  PlusIcon,
  ArrowRightIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpTrayIcon,
  PaperAirplaneIcon,
  InboxIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ChevronRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { storyService } from '../../services/storyService';
import { videoService } from '../../services/videoService';
import { contactService } from '../../services/contactService';
import { newsletterService } from '../../services/newsletterService';
import { userService } from '../../services/userService';

// Modern Dashboard Header Component with Date Picker and Upgraded Stat Cards
const DashboardHeader = ({ stats, subscribersToday }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get days in month
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

  // Navigate months
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const calendarRef = useRef(null);

  // Select date
  const selectDate = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    setShowCalendar(false);
  };

  // Close calendar when clicking outside (popover behavior, does not stop the page)
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

  // Close calendar on Escape key
  useEffect(() => {
    if (!showCalendar) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowCalendar(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCalendar]);

  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  // Check if date is selected
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
      lightBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      barColor: "bg-gradient-to-r from-emerald-500 to-teal-500",
      topBorder: "border-t-emerald-500",
      pctWidth: "75%",
    },
    {
      title: "Total Videos",
      value: stats.videos,
      change: "+3 this week",
      icon: VideoCameraIcon,
      lightBg: "bg-purple-50 text-purple-600 border-purple-100",
      barColor: "bg-gradient-to-r from-purple-500 to-indigo-500",
      topBorder: "border-t-purple-500",
      pctWidth: "60%",
    },
    {
      title: "Active Users",
      value: stats.users,
      change: "+18 this week",
      icon: UsersIcon,
      lightBg: "bg-blue-50 text-blue-600 border-blue-100",
      barColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
      topBorder: "border-t-blue-500",
      pctWidth: "85%",
    },
    {
      title: "Inquiries",
      value: stats.contacts,
      change: "+5 this week",
      icon: EnvelopeIcon,
      lightBg: "bg-amber-50 text-amber-600 border-amber-100",
      barColor: "bg-gradient-to-r from-amber-500 to-orange-500",
      topBorder: "border-t-amber-500",
      pctWidth: "50%",
    },
    {
      title: "Subscribers",
      value: stats.subscribers,
      change: `+${subscribersToday} today`,
      icon: InboxIcon,
      lightBg: "bg-rose-50 text-rose-600 border-rose-100",
      barColor: "bg-gradient-to-r from-rose-500 to-pink-500",
      topBorder: "border-t-rose-500",
      pctWidth: "90%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Ambient Background */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative">
        {/* Subtle glowing ambient circles cleanly clipped to rounded-3xl boundary */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-52 h-52 rounded-full bg-emerald-400/20 blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide text-emerald-100 mb-3 border border-white/20">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
            <span>KahaniLand Management Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Welcome Back, Admin! 👋
          </h1>
          <p className="text-emerald-100/90 mt-1.5 text-xs sm:text-sm font-medium max-w-xl">
            Live overview of story publishing, animated videos, readers engagement, and incoming feedback.
          </p>
        </div>

        {/* Date Button & Calendar Popover */}
        <div className="relative z-30 flex-shrink-0" ref={calendarRef}>
          <button
            type="button"
            onClick={() => setShowCalendar((prev) => !prev)}
            className={`flex items-center gap-2.5 sm:gap-3 backdrop-blur-md border rounded-2xl px-4 py-2.5 shadow-sm transition-all text-white focus:outline-none cursor-pointer ${
              showCalendar 
                ? 'bg-white/25 border-white/50 shadow-md ring-2 ring-white/20' 
                : 'bg-white/10 hover:bg-white/20 active:scale-95 border-white/25 hover:border-white/40'
            }`}
            aria-label="Toggle calendar"
            aria-expanded={showCalendar}
          >
            <CalendarDaysIcon className="w-5 h-5 text-emerald-300 flex-shrink-0" />
            <span className="font-semibold text-xs sm:text-sm tracking-tight">
              {selectedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                weekday: 'short',
              })}
            </span>
          </button>

          {/* Calendar Popover (Floating Pop-type without blocking page) */}
          {showCalendar && (
            <div
              role="dialog"
              aria-modal="false"
              aria-label="Choose date"
              className="absolute right-0 mt-2.5 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 p-5 z-50 w-80 max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/10 origin-top-right"
            >
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-4">
                <button 
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                  aria-label="Previous month"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="text-center">
                  <h3 className="text-sm font-bold text-slate-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                </div>
                <button 
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                  aria-label="Next month"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-[11px] font-bold text-slate-400 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-8"></div>
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
                        h-8 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center
                        ${isSelectedDate 
                          ? 'bg-emerald-600 text-white shadow-xs font-bold ring-2 ring-emerald-400/40' 
                          : isTodayDate 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 font-bold' 
                            : 'hover:bg-slate-100 text-slate-700'
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setSelectedDate(today);
                    setCurrentMonth(today);
                    setShowCalendar(false);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors font-bold"
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
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors font-semibold"
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {statCards.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className={`bg-white rounded-2xl border border-slate-200/80 border-t-4 ${item.topBorder} p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.lightBg} shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                    {item.change}
                  </span>
                </div>

                <div className="mt-4">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {item.value}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                    {item.title}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.barColor} rounded-full transition-all duration-500`}
                    style={{ width: item.pctWidth }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Modern Dashboard Middle Component with 12-month chart, Quick Actions & Newsletter widget
const DashboardMiddle = ({ 
  monthlyData, 
  onAddStory, 
  onUploadVideo, 
  onManageUsers, 
  onSendNewsletter,
  totalSubscribers,
  newToday 
}) => {
  const actions = [
    {
      title: "Add New Story",
      desc: "Publish illustrated story",
      icon: PlusIcon,
      bg: "hover:bg-emerald-50/70",
      iconBg: "bg-emerald-100 text-emerald-700",
      borderColor: "border-emerald-200/60",
      onClick: onAddStory,
    },
    {
      title: "Upload Video",
      desc: "Add animated video tale",
      icon: ArrowUpTrayIcon,
      bg: "hover:bg-purple-50/70",
      iconBg: "bg-purple-100 text-purple-700",
      borderColor: "border-purple-200/60",
      onClick: onUploadVideo,
    },
    {
      title: "Manage Users",
      desc: "View readers & roles",
      icon: UsersIcon,
      bg: "hover:bg-blue-50/70",
      iconBg: "bg-blue-100 text-blue-700",
      borderColor: "border-blue-200/60",
      onClick: onManageUsers,
    },
    {
      title: "Send Newsletter",
      desc: "Broadcast story club emails",
      icon: PaperAirplaneIcon,
      bg: "hover:bg-amber-50/70",
      iconBg: "bg-amber-100 text-amber-700",
      borderColor: "border-amber-200/60",
      onClick: onSendNewsletter,
    },
  ];

  const defaultMonths = [
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "May", value: 0 },
    { month: "Jun", value: 0 },
    { month: "Jul", value: 0 },
    { month: "Aug", value: 0 },
    { month: "Sep", value: 0 },
    { month: "Oct", value: 0 },
    { month: "Nov", value: 0 },
    { month: "Dec", value: 0 },
  ];

  const months = monthlyData || defaultMonths;
  const maxValue = Math.max(...months.map(m => m.value), 1);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Chart - 12 Months Stories Uploaded */}
      <div className="xl:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Stories Uploaded
                </h2>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/60">
                  2026 Velocity
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Monthly distribution of published stories
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
              Peak: {maxValue} Stories
            </span>
          </div>

          <div className="relative flex justify-between items-end h-64 mt-8 pt-6 border-b border-slate-100">
            {/* Subtle Horizontal Guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-dashed border-slate-200 w-full" />
              <div className="border-b border-dashed border-slate-200 w-full" />
              <div className="border-b border-dashed border-slate-200 w-full" />
            </div>

            {months.map((item) => {
              const heightPercent = Math.max((item.value / maxValue) * 100, 6);
              return (
                <div key={item.month} className="group relative flex flex-col items-center z-10 flex-1">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap z-20">
                    {item.value} {item.value === 1 ? 'Story' : 'Stories'}
                  </div>

                  <span className="text-[11px] font-bold text-slate-600 mb-1.5 group-hover:text-emerald-600 transition-colors">
                    {item.value > 0 ? item.value : ''}
                  </span>

                  <div className="w-5 sm:w-6 h-48 flex items-end justify-center">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all duration-300 shadow-xs"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400 mt-2.5 group-hover:text-slate-800 transition-colors">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-slate-900">
              Quick Actions
            </h2>
            <SparklesIcon className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xs text-slate-400 font-medium mb-4">
            Common administrative workflows
          </p>

          <div className="space-y-2.5">
            {actions.map((action, index) => {
              const Icon = action.icon;

              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`w-full p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 ${action.bg} ${action.borderColor} flex items-center justify-between text-left hover:shadow-xs transition-all duration-200 group focus:outline-none`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${action.iconBg} shadow-2xs`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-slate-900 truncate">
                        {action.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {action.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors flex-shrink-0 ml-2" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Newsletter Subscribers Hero Card */}
      <div className="xl:col-span-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl border border-slate-800 shadow-md p-6 flex flex-col justify-between relative overflow-hidden">
        {/* Glow ambient highlight */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <EnvelopeIcon className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <SparklesIcon className="w-3 h-3" />
              Active Club
            </span>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Subscribers
            </p>
            <h3 className="text-4xl font-black tracking-tight text-white mt-1">
              {totalSubscribers || 0}
            </h3>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-emerald-400">
                  +{newToday || 0}
                </span>
                <p className="text-[11px] text-slate-400 font-medium">Joined Today</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-pink-400">Weekly</span>
                <p className="text-[11px] text-slate-400 font-medium">Auto-Digest</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={onSendNewsletter}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-bold tracking-tight shadow-md transition-all flex items-center justify-center gap-2"
          >
            <PaperAirplaneIcon className="w-3.5 h-3.5" />
            <span>Compose Newsletter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    stories: 0,
    videos: 0,
    users: 0,
    contacts: 0,
    subscribers: 0,
  });
  const [recentStories, setRecentStories] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [subscribersToday, setSubscribersToday] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // View Detail Modal states
  const [showStoryDetail, setShowStoryDetail] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showVideoDetail, setShowVideoDetail] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Edit Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: '',
    age_group: '',
    content: '',
    image_url: '',
    author: ''
  });

  // Notification toast state
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const hasFetched = useRef(false);

  const categories = ['Adventure', 'Science Fiction', 'Mystery', 'Educational', 'Bedtime', 'Fairy Tale', 'Moral Story'];
  const ageGroups = ['0-1 years', '1-2 years', '2-4 years', '4-6 years'];

  // Notification helper
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  // Generate monthly data from stories
  const generateMonthlyData = (stories) => {
    const months = [
      { month: "Jan", value: 0 },
      { month: "Feb", value: 0 },
      { month: "Mar", value: 0 },
      { month: "Apr", value: 0 },
      { month: "May", value: 0 },
      { month: "Jun", value: 0 },
      { month: "Jul", value: 0 },
      { month: "Aug", value: 0 },
      { month: "Sep", value: 0 },
      { month: "Oct", value: 0 },
      { month: "Nov", value: 0 },
      { month: "Dec", value: 0 },
    ];

    if (!stories || stories.length === 0) {
      return months;
    }

    stories.forEach(story => {
      // Try different possible date field names
      const dateField = story.created_at || story.createdAt || story.date || story.uploaded_at || story.published_at;
      
      if (dateField) {
        try {
          const date = new Date(dateField);
          if (!isNaN(date.getTime())) {
            const monthIndex = date.getMonth();
            months[monthIndex].value += 1;
          }
        } catch {
          console.warn('Invalid date format for story:', story.id);
        }
      }
    });

    return months;
  };

  // Data fetching function - FIXED
  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      const [stories, videos, contacts, subscribers, users] = await Promise.all([
        storyService.getAll().catch(() => []),
        videoService.getAll().catch(() => []),
        contactService.getAll().catch(() => []),
        newsletterService.getAll().catch(() => []),
        userService.getAll().catch(() => []),
      ]);

      // Ensure all data is arrays
      const storiesArray = Array.isArray(stories)
        ? stories
        : Array.isArray(stories?.data)
        ? stories.data
        : Array.isArray(stories?.stories)
        ? stories.stories
        : [];
      const videosArray = Array.isArray(videos)
        ? videos
        : Array.isArray(videos?.data)
        ? videos.data
        : Array.isArray(videos?.videos)
        ? videos.videos
        : [];
      const contactsArray = Array.isArray(contacts)
        ? contacts
        : Array.isArray(contacts?.data)
        ? contacts.data
        : [];
      const subscribersArray = Array.isArray(subscribers)
        ? subscribers
        : Array.isArray(subscribers?.data)
        ? subscribers.data
        : Array.isArray(subscribers?.newsletters)
        ? subscribers.newsletters
        : [];
      const usersArray = Array.isArray(users)
        ? users
        : Array.isArray(users?.users)
        ? users.users
        : Array.isArray(users?.data)
        ? users.data
        : [];

      console.log('Stories count:', storiesArray.length);
      console.log('Videos count:', videosArray.length);
      console.log('Contacts count:', contactsArray.length);
      console.log('Subscribers count:', subscribersArray.length);

      setStats({
        stories: storiesArray.length,
        videos: videosArray.length,
        users: usersArray.length,
        contacts: contactsArray.length,
        subscribers: subscribersArray.length,
      });

      // Generate monthly data from stories
      const monthlyStats = generateMonthlyData(storiesArray);
      console.log('Monthly stats:', monthlyStats);
      setMonthlyData(monthlyStats);

      // Recent items (latest 5)
      const sortedStories = [...storiesArray]
        .sort((a, b) => {
          const dateA = a.created_at || a.createdAt || a.date || a.published_at || 0;
          const dateB = b.created_at || b.createdAt || b.date || b.published_at || 0;
          try {
            return new Date(dateB) - new Date(dateA);
          } catch {
            return 0;
          }
        })
        .slice(0, 5);
      setRecentStories(sortedStories);

      const sortedVideos = [...videosArray]
        .sort((a, b) => {
          const dateA = a.created_at || a.createdAt || a.date || 0;
          const dateB = b.created_at || b.createdAt || b.date || 0;
          try {
            return new Date(dateB) - new Date(dateA);
          } catch {
            return 0;
          }
        })
        .slice(0, 5);
      setRecentVideos(sortedVideos);

      // --- FIX: Ensure contacts is an array before sorting ---
      const sortedContacts = [...contactsArray]
        .sort((a, b) => {
          const dateA = a.created_at || a.createdAt || a.date || 0;
          const dateB = b.created_at || b.createdAt || b.date || 0;
          try {
            return new Date(dateB) - new Date(dateA);
          } catch {
            return 0;
          }
        })
        .slice(0, 5);
      setRecentContacts(sortedContacts);

      // Subscribers today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaySubs = subscribersArray.filter((s) => {
        const dateField = s.created_at || s.createdAt || s.date || s.subscribed_at;
        if (!dateField) return false;
        try {
          const date = new Date(dateField);
          if (isNaN(date.getTime())) return false;
          date.setHours(0, 0, 0, 0);
          return date.getTime() === today.getTime();
        } catch {
          return false;
        }
      });
      setSubscribersToday(todaySubs.length);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Lazy load: fetch only once, prevent double call in Strict Mode
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardData();
    }
  }, []);

  // Quick action handlers
  const handleAddStory = () => navigate('/admin/stories', { state: { openAdd: true } });
  const handleUploadVideo = () => navigate('/admin/videos', { state: { openAdd: true } });
  const handleManageUsers = () => navigate('/admin/users');
  const handleSendNewsletter = () => navigate('/admin/newsletters/send');

  // View Detail handlers
  const handleViewStory = (story) => {
    setSelectedStory(story);
    setShowStoryDetail(true);
  };

  const handleViewVideo = (video) => {
    setSelectedVideo(video);
    setShowVideoDetail(true);
  };

  // View Contact - Navigate to contact page
  const handleViewContact = (contactId) => {
    navigate(`/admin/contacts/${contactId}`);
  };

  // Edit handlers
  const handleEditStory = (story) => {
    setEditingItem({ ...story, type: 'story' });
    setEditFormData({
      title: story.title || '',
      category: story.category || '',
      age_group: story.age_group || '',
      content: story.story || story.content || '',
      image_url: story.image_url || story.image || '',
      author: story.author || ''
    });
    setShowEditModal(true);
  };

  const handleEditVideo = (video) => {
    setEditingItem({ ...video, type: 'video' });
    setEditFormData({
      title: video.title || '',
      category: video.category || '',
      age_group: video.age_group || '',
      content: video.description || '',
      image_url: video.thumbnail || '',
      author: ''
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!editFormData.title.trim()) {
        showNotification('error', 'Title is required');
        setIsSubmitting(false);
        return;
      }
      if (!editFormData.content.trim()) {
        showNotification('error', 'Content is required');
        setIsSubmitting(false);
        return;
      }
      if (!editFormData.category) {
        showNotification('error', 'Category is required');
        setIsSubmitting(false);
        return;
      }

      if (editingItem.type === 'story') {
        const wordCount = editFormData.content.split(/\s+/).length;
        const readTime = Math.ceil(wordCount / 200);
        const read_time = `${readTime} Min Read`;

        const storyData = {
          ...editFormData,
          read_time
        };

        await storyService.update(editingItem.id, storyData);
        showNotification('success', 'Story updated successfully');
      } else if (editingItem.type === 'video') {
        await videoService.update(editingItem.id, {
          title: editFormData.title,
          category: editFormData.category,
          age_group: editFormData.age_group,
          description: editFormData.content,
          thumbnail: editFormData.image_url
        });
        showNotification('success', 'Video updated successfully');
      }
      
      // Refresh all data
      await fetchDashboardData();
      
      setShowEditModal(false);
      setEditingItem(null);
      setEditFormData({
        title: '',
        category: '',
        age_group: '',
        content: '',
        image_url: '',
        author: ''
      });
    } catch (error) {
      console.error('Error updating item:', error);
      showNotification('error', error.message || 'Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete modal handlers
  const openDeleteModal = (item, type) => {
    setDeleteItem({ ...item, type });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteItem(null);
    setDeleteLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      setDeleteLoading(true);
      if (deleteItem.type === 'story') {
        await storyService.delete(deleteItem.id);
        showNotification('success', 'Story deleted successfully');
      } else if (deleteItem.type === 'video') {
        await videoService.delete(deleteItem.id);
        showNotification('success', 'Video deleted successfully');
      }
      // Refresh all data
      await fetchDashboardData();
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting item:', error);
      showNotification('error', `Failed to delete ${deleteItem.type}`);
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of stories, videos, and platform analytics</p>
        </div>
        <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800">Loading Dashboard</h3>
          <p className="text-gray-500 text-sm mt-1">Retrieving latest stories, analytics, and activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
          )}
          <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {notification.message}
          </span>
          <button
            onClick={() => setNotification({ show: false, type: '', message: '' })}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Dashboard Header with Stats Cards */}
      <DashboardHeader stats={stats} subscribersToday={subscribersToday} />

      {/* Dashboard Middle - Chart, Quick Actions, Newsletter */}
      <DashboardMiddle 
        monthlyData={monthlyData}
        onAddStory={handleAddStory}
        onUploadVideo={handleUploadVideo}
        onManageUsers={handleManageUsers}
        onSendNewsletter={handleSendNewsletter}
        totalSubscribers={stats.subscribers}
        newToday={subscribersToday}
      />

      {/* Recent Stories & Videos with Clean Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stories */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Recent Stories</h3>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  {recentStories.length} Published
                </span>
              </div>
              <button
                onClick={() => navigate('/admin/stories')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 group"
              >
                <span>View All</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {recentStories.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <BookOpenIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-500">No stories found yet</p>
                </div>
              ) : (
                recentStories.map((story) => (
                  <div
                    key={story.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/70 transition-all duration-150"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200/60">
                      {story.image_url || story.image ? (
                        <img
                          src={story.image_url || story.image}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-500">
                          <BookOpenIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{story.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                        <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md border border-emerald-200/50 truncate">
                          {story.category}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400 truncate">{story.age_group || 'All Ages'}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleViewStory(story)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Story"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditStory(story)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Story"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(story, 'story')}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Story"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Recent Videos</h3>
                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200/60">
                  {recentVideos.length} Videos
                </span>
              </div>
              <button
                onClick={() => navigate('/admin/videos')}
                className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 group"
              >
                <span>View All</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {recentVideos.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <VideoCameraIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-500">No videos uploaded yet</p>
                </div>
              ) : (
                recentVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/70 transition-all duration-150"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 relative border border-slate-200/60">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-500">
                          <VideoCameraIcon className="w-5 h-5" />
                        </div>
                      )}
                      {video.duration && (
                        <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white font-mono text-[9px] px-1 rounded">
                          {video.duration}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{video.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                        <span className="bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-md border border-purple-200/50 truncate">
                          {video.category}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400 truncate">{video.age_group || 'All Ages'}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleViewVideo(video)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Video"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditVideo(video)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Video"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(video, 'video')}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Video"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Contacts & Inquiries with Clean List */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Recent Messages & Feedback</h3>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200/60">
              {recentContacts.length} Inquiries
            </span>
          </div>
          <button
            onClick={() => navigate('/admin/contacts')}
            className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {recentContacts.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <EnvelopeIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500">No inquiries or messages yet</p>
            </div>
          ) : (
            recentContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleViewContact(contact.id)}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/70 transition-all duration-150 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center flex-shrink-0 text-sm border border-amber-200/60">
                  {contact.name ? contact.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{contact.name}</p>
                    <span className="text-[11px] text-slate-400">•</span>
                    <span className="text-[11px] text-slate-400 truncate">{contact.email}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 truncate mt-0.5">{contact.subject || 'No subject'}</p>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      contact.replied
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}
                  >
                    {contact.replied ? '✓ Replied' : 'Pending'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewContact(contact.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="View details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Story Detail Modal */}
      {showStoryDetail && selectedStory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{selectedStory.title}</h3>
                {selectedStory.author && (
                  <p className="text-gray-500 text-sm">By: {selectedStory.author}</p>
                )}
              </div>
              <button
                onClick={() => setShowStoryDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {selectedStory.category}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {selectedStory.age_group}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {selectedStory.read_time || '5 Min Read'}
              </span>
            </div>

            {selectedStory.image_url || selectedStory.image ? (
              <img 
                src={selectedStory.image_url || selectedStory.image} 
                alt={selectedStory.title}
                className="w-full max-h-80 object-cover rounded-lg mb-4"
              />
            ) : null}

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedStory.story || selectedStory.content}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
              <button
                onClick={() => {
                  setShowStoryDetail(false);
                  handleEditStory(selectedStory);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PencilIcon className="w-4 h-4 inline mr-2" />
                Edit Story
              </button>
              <button
                onClick={() => {
                  setShowStoryDetail(false);
                  openDeleteModal(selectedStory, 'story');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="w-4 h-4 inline mr-2" />
                Delete Story
              </button>
              <button
                onClick={() => setShowStoryDetail(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Video Detail Modal */}
      {showVideoDetail && selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{selectedVideo.title}</h3>
              </div>
              <button
                onClick={() => setShowVideoDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {selectedVideo.category}
              </span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                {selectedVideo.age_group || 'All Ages'}
              </span>
            </div>

            {selectedVideo.thumbnail ? (
              <img 
                src={selectedVideo.thumbnail} 
                alt={selectedVideo.title}
                className="w-full max-h-80 object-cover rounded-lg mb-4"
              />
            ) : null}

            {selectedVideo.description && (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedVideo.description}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
              <button
                onClick={() => {
                  setShowVideoDetail(false);
                  handleEditVideo(selectedVideo);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PencilIcon className="w-4 h-4 inline mr-2" />
                Edit Video
              </button>
              <button
                onClick={() => {
                  setShowVideoDetail(false);
                  openDeleteModal(selectedVideo, 'video');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="w-4 h-4 inline mr-2" />
                Delete Video
              </button>
              <button
                onClick={() => setShowVideoDetail(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Edit {editingItem.type === 'story' ? 'Story' : 'Video'}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter title"
                />
              </div>

              {editingItem.type === 'story' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={editFormData.author}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter author name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Group *
                </label>
                <select
                  name="age_group"
                  value={editFormData.age_group}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select age group</option>
                  {ageGroups.map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingItem.type === 'story' ? 'Image URL' : 'Thumbnail URL'}
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={editFormData.image_url}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter image URL (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingItem.type === 'story' ? 'Story Content *' : 'Description *'}
                </label>
                <textarea
                  name="content"
                  value={editFormData.content}
                  onChange={handleEditInputChange}
                  required
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={editingItem.type === 'story' ? "Write your story content here..." : "Enter video description..."}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </span>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Delete {deleteItem.type === 'story' ? 'Story' : 'Video'}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteItem.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                  deleteLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {deleteLoading ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;