// services/dashboardService.js

// Use globalThis.process to avoid linter "process is not defined" in browser environments
const API_BASE_URL = (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env && globalThis.process.env.REACT_APP_API_URL)
  ? globalThis.process.env.REACT_APP_API_URL
  : 'http://localhost:5000/api';

// Default stats for fallback
const DEFAULT_STATS = {
  totalUsers: 0,
  totalAdmins: 0,
  totalNormalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  totalStories: 0,
  totalVideos: 0,
  totalContacts: 0,
  totalSubscribers: 0,
  recentStories: [],
  recentVideos: [],
  recentContacts: [],
  monthlyStoryData: [
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
    { month: "Dec", value: 0 }
  ],
  subscribersToday: 0
};

export const dashboardService = {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} stats object containing:
   *   totalUsers, totalAdmins, totalNormalUsers,
   *   activeUsers, inactiveUsers,
   *   totalStories, totalVideos, totalContacts, totalSubscribers
   */
  async getStats() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No authentication token found for dashboard stats');
        return { ...DEFAULT_STATS };
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        // Handle specific status codes
        if (response.status === 403) {
          console.warn('Access forbidden to dashboard stats');
          return { ...DEFAULT_STATS, _error: 'Forbidden' };
        }
        if (response.status === 500) {
          console.warn('Server error fetching dashboard stats');
          return { ...DEFAULT_STATS, _error: 'Server Error' };
        }
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch  {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Handle different response structures
      // Case 1: { success: true, data: { ... } }
      if (result.success && result.data) {
        return { ...DEFAULT_STATS, ...result.data };
      }
      // Case 2: Direct stats object
      if (result.totalUsers !== undefined || result.totalStories !== undefined) {
        return { ...DEFAULT_STATS, ...result };
      }
      // Case 3: Unexpected structure
      console.warn('Unexpected dashboard stats response structure:', result);
      return { ...DEFAULT_STATS, ...result };

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats with error flag
      return { ...DEFAULT_STATS, _error: error.message };
    }
  },

  /**
   * Get dashboard statistics with fallback for offline/development
   * @returns {Promise<Object>} stats object with default values if API fails
   */
  async getStatsWithFallback() {
    try {
      const stats = await this.getStats();
      // If stats has an error flag or is empty, merge with defaults
      if (stats._error) {
        return { ...DEFAULT_STATS, ...stats };
      }
      return stats;
    } catch (error) {
      console.warn('Using fallback dashboard stats:', error.message);
      return { ...DEFAULT_STATS };
    }
  },

  /**
   * Get monthly story data for chart
   * @param {Array} stories - Array of story objects
   * @returns {Array} Monthly data for chart
   */
  getMonthlyStoryData(stories = []) {
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
      { month: "Dec", value: 0 }
    ];

    if (!stories || stories.length === 0) {
      return months;
    }

    const dateFields = ['created_at', 'createdAt', 'date', 'uploaded_at', 'published_at', 'updated_at'];
    
    stories.forEach(story => {
      let dateField = null;
      for (const field of dateFields) {
        if (story[field]) {
          dateField = story[field];
          break;
        }
      }
      
      if (dateField) {
        try {
          const date = new Date(dateField);
          if (!isNaN(date.getTime())) {
            const monthIndex = date.getMonth();
            months[monthIndex].value += 1;
          }
        } catch {
          // Skip invalid dates silently
        }
      }
    });

    return months;
  },

  /**
   * Get today's subscribers count
   * @param {Array} subscribers - Array of subscriber objects
   * @returns {number} Number of subscribers today
   */
  getTodaySubscribers(subscribers = []) {
    if (!subscribers || subscribers.length === 0) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateFields = ['created_at', 'createdAt', 'date', 'subscribed_at', 'updated_at'];
    
    return subscribers.filter((s) => {
      let dateField = null;
      for (const field of dateFields) {
        if (s[field]) {
          dateField = s[field];
          break;
        }
      }
      if (!dateField) return false;
      try {
        const date = new Date(dateField);
        if (isNaN(date.getTime())) return false;
        date.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime();
      } catch {
        return false;
      }
    }).length;
  },

  /**
   * Get recent items (stories, videos, contacts)
   * @param {Array} items - Array of items
   * @param {number} limit - Number of items to return
   * @returns {Array} Sorted recent items
   */
  getRecentItems(items = [], limit = 5) {
    if (!items || items.length === 0) {
      return [];
    }

    const dateFields = ['created_at', 'createdAt', 'date', 'uploaded_at', 'published_at', 'updated_at'];
    
    return [...items]
      .sort((a, b) => {
        let dateA = null, dateB = null;
        
        for (const field of dateFields) {
          if (!dateA && a[field]) dateA = a[field];
          if (!dateB && b[field]) dateB = b[field];
        }
        
        try {
          return new Date(dateB || 0) - new Date(dateA || 0);
        } catch  {
          return 0;
        }
      })
      .slice(0, limit);
  },

  /**
   * Get all dashboard data in one call (for Dashboard component)
   * @param {Object} services - Object containing service instances
   * @param {Object} services.storyService - Story service
   * @param {Object} services.videoService - Video service
   * @param {Object} services.contactService - Contact service
   * @param {Object} services.newsletterService - Newsletter service
   * @param {Object} services.userService - User service
   * @returns {Promise<Object>} Combined dashboard data
   */
  async getAllDashboardData(services) {
    try {
      // Fetch all data in parallel with fallbacks
      const [
        stories,
        videos,
        contacts,
        subscribers,
        users,
        stats
      ] = await Promise.all([
        services.storyService?.getAll?.() || Promise.resolve([]),
        services.videoService?.getAll?.() || Promise.resolve([]),
        services.contactService?.getAll?.() || Promise.resolve([]),
        services.newsletterService?.getAll?.() || Promise.resolve([]),
        services.userService?.getAll?.() || Promise.resolve([]),
        this.getStatsWithFallback()
      ]);

      // Ensure all data is arrays
      const storiesData = Array.isArray(stories) ? stories : [];
      const videosData = Array.isArray(videos) ? videos : [];
      const contactsData = Array.isArray(contacts) ? contacts : [];
      const subscribersData = Array.isArray(subscribers) ? subscribers : [];
      const usersData = Array.isArray(users) ? users : [];

      // Generate monthly data from stories
      const monthlyData = this.getMonthlyStoryData(storiesData);

      // Get today's subscribers
      const subscribersToday = this.getTodaySubscribers(subscribersData);

      // Get recent items
      const recentStories = this.getRecentItems(storiesData);
      const recentVideos = this.getRecentItems(videosData);
      const recentContacts = this.getRecentItems(contactsData);

      // Calculate additional stats
      const totalStories = storiesData.length;
      const totalVideos = videosData.length;
      const totalContacts = contactsData.length;
      const totalSubscribers = subscribersData.length;
      const totalUsers = usersData.length;

      return {
        stats: {
          stories: totalStories,
          videos: totalVideos,
          users: totalUsers,
          contacts: totalContacts,
          subscribers: totalSubscribers,
          totalStories,
          totalVideos,
          totalContacts,
          totalSubscribers,
          totalUsers,
          // Merge with API stats if available
          ...(typeof stats === 'object' ? stats : {})
        },
        monthlyData,
        subscribersToday,
        recentStories,
        recentVideos,
        recentContacts,
        // Raw data if needed
        raw: { 
          stories: storiesData, 
          videos: videosData, 
          contacts: contactsData, 
          subscribers: subscribersData, 
          users: usersData 
        }
      };
    } catch (error) {
      console.error('Error fetching all dashboard data:', error);
      // Return default data structure with error flag
      return {
        stats: { ...DEFAULT_STATS },
        monthlyData: DEFAULT_STATS.monthlyStoryData,
        subscribersToday: 0,
        recentStories: [],
        recentVideos: [],
        recentContacts: [],
        raw: { stories: [], videos: [], contacts: [], subscribers: [], users: [] },
        _error: error.message
      };
    }
  },

  /**
   * Get quick stats for dashboard cards
   * @param {Array} data - Array of items
   * @returns {Object} Quick stats
   */
  getQuickStats(data = []) {
    if (!Array.isArray(data)) {
      return { total: 0, recent: 0, change: 0 };
    }

    const total = data.length;
    const recent = this.getRecentItems(data, 1).length;
    
    return {
      total,
      recent,
      change: 0 // Could be calculated with previous data
    };
  }
};

export default dashboardService;