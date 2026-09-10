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
} from '@heroicons/react/24/outline';
import { storyService } from '../../services/storyService';
import { videoService } from '../../services/videoService';
import { contactService } from '../../services/contactService';
import { newsletterService } from '../../services/newsletterService';

// Mock user service – replace with your actual user service
const userService = {
  getAll: async () => {
    return [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
  },
};

// Dashboard Header Component with Date Picker
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

  // Select date
  const selectDate = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    setShowCalendar(false);
  };

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

        <div className="relative">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-3 bg-white border rounded-xl px-5 py-3 shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-400"
          >
            <CalendarDaysIcon className="w-6 h-6 text-gray-600" />
            <span className="font-semibold text-gray-700">
              {selectedDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                weekday: 'long',
              })}
            </span>
          </button>

          {/* Calendar Dropdown */}
          {showCalendar && (
            <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-xl border p-4 z-50 w-80">
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-bold text-gray-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button 
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
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
                      key={day}
                      onClick={() => selectDate(day)}
                      className={`
                        h-10 rounded-lg text-sm font-medium transition-all duration-200
                        ${isSelectedDate 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : isTodayDate 
                            ? 'bg-green-50 text-green-600 border-2 border-green-400 hover:bg-green-100' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t flex gap-2">
                <button
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
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowCalendar(false)}
                className="mt-3 w-full px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Close
              </button>
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

              {/* Bottom Wave */}
              <div className="mt-5">
                <svg
                  viewBox="0 0 120 20"
                  className={`w-full h-6 ${item.wave}`}
                  fill="none"
                >
                  <path
                    d="M0 10
                       C10 2 20 18 30 10
                       S50 2 60 10
                       S80 18 90 10
                       S110 2 120 10"
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

// Dashboard Middle Component with 12-month chart
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
      icon: PlusIcon,
      bg: "from-green-50 to-green-100",
      iconBg: "bg-green-500",
      onClick: onAddStory,
    },
    {
      title: "Upload Video",
      icon: ArrowUpTrayIcon,
      bg: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-500",
      onClick: onUploadVideo,
    },
    {
      title: "Manage Users",
      icon: UsersIcon,
      bg: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-500",
      onClick: onManageUsers,
    },
    {
      title: "Send Newsletter",
      icon: PaperAirplaneIcon,
      bg: "from-yellow-50 to-yellow-100",
      iconBg: "bg-orange-500",
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
      <div className="xl:col-span-6 bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-800">
          Stories Uploaded
          <span className="text-gray-400 font-normal text-sm">
            {" "}
            (This Year)
          </span>
        </h2>

        <div className="flex justify-between items-end h-72 mt-8">
          {months.map((item) => (
            <div key={item.month} className="flex flex-col items-center">
              <span className="text-xs font-semibold mb-2 text-gray-600">
                {item.value}
              </span>

              <div
                className="w-5 rounded-full bg-gradient-to-t from-green-500 to-green-400 transition-all duration-500 hover:scale-110"
                style={{
                  height: `${(item.value / maxValue) * 200 + 10}px`,
                  minHeight: '10px',
                }}
              ></div>

              <span className="text-xs mt-3 text-gray-500">
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="xl:col-span-4 bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 gap-5">
          {actions.map((action, index) => {
            const Icon = action.icon;

            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`bg-gradient-to-br ${action.bg}
                rounded-2xl h-36
                flex flex-col justify-center items-center
                hover:shadow-lg transition-all duration-300
                hover:-translate-y-1 border border-transparent hover:border-gray-200`}
              >
                <div
                  className={`${action.iconBg}
                  w-12 h-12 rounded-full
                  flex items-center justify-center mb-3`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <p className="font-semibold text-gray-700 text-center text-sm px-2">
                  {action.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Newsletter Subscribers */}
      <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <EnvelopeIcon className="w-7 h-7 text-pink-500" />
            <h2 className="font-bold text-gray-800">
              Newsletter Subscribers
            </h2>
          </div>

          <div className="mt-8">
            <h1 className="text-5xl font-bold">
              {totalSubscribers || 0}
            </h1>
            <p className="text-gray-500 mt-2">
              Total Subscribers
            </p>

            <hr className="my-6" />

            <h2 className="text-3xl font-bold text-green-500">
              {newToday || 0}
            </h2>
            <p className="text-green-600 font-medium">
              New Today
            </p>
          </div>
        </div>

        <img
          src="https://cdn-icons-png.flaticon.com/512/2436/2436636.png"
          alt="reading"
          className="w-36 self-end"
        />
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
      const storiesArray = Array.isArray(stories) ? stories : [];
      const videosArray = Array.isArray(videos) ? videos : [];
      const contactsArray = Array.isArray(contacts) ? contacts : [];
      const subscribersArray = Array.isArray(subscribers) ? subscribers : [];
      const usersArray = Array.isArray(users) ? users : [];

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
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

      {/* Recent Stories & Videos with Vertical Scroll */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Stories</h3>
            <button
              onClick={() => navigate('/admin/stories')}
              className="text-sm text-green-500 hover:text-green-600 font-medium flex items-center gap-1"
            >
              View All <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {recentStories.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No stories yet</p>
            ) : (
              recentStories.map((story) => (
                <div
                  key={story.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {story.image_url || story.image ? (
                      <img
                        src={story.image_url || story.image}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpenIcon className="w-6 h-6 text-gray-400 m-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{story.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{story.category}</span>
                      <span>•</span>
                      <span>{story.age_group}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleViewStory(story)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditStory(story)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(story, 'story')}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Videos</h3>
            <button
              onClick={() => navigate('/admin/videos')}
              className="text-sm text-purple-500 hover:text-purple-600 font-medium flex items-center gap-1"
            >
              View All <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {recentVideos.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No videos yet</p>
            ) : (
              recentVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <VideoCameraIcon className="w-6 h-6 text-gray-400 m-3" />
                    )}
                    {video.duration && (
                      <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 rounded">
                        {video.duration}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{video.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{video.category}</span>
                      <span>•</span>
                      <span>{video.age_group || 'All Ages'}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleViewVideo(video)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditVideo(video)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(video, 'video')}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
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

      {/* Recent Contacts with Vertical Scroll and Click to View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Recent Messages</h3>
          <button
            onClick={() => navigate('/admin/contacts')}
            className="text-sm text-green-500 hover:text-green-600 font-medium flex items-center gap-1"
          >
            View All <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {recentContacts.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No messages</p>
          ) : (
            recentContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleViewContact(contact.id)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <UsersIcon className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{contact.name}</p>
                  <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                  <p className="text-xs text-gray-400 truncate">{contact.subject || 'No subject'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      contact.replied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {contact.replied ? 'Replied' : 'Pending'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewContact(contact.id);
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="View"
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