// // src/services/videoService.js
// import axios from 'axios';

// // Environment-aware API URL configuration
// const getApiUrl = () => {
//   // Safely access process.env using globalThis to avoid `process` undefined lint errors in browser builds
//   const procEnv = (typeof globalThis !== 'undefined' && typeof globalThis.process !== 'undefined' && typeof globalThis.process.env !== 'undefined') ? globalThis.process.env : undefined;
//   if (procEnv) {
//     if (procEnv.REACT_APP_API_URL) return procEnv.REACT_APP_API_URL;
//     if (procEnv.VITE_API_URL) return procEnv.VITE_API_URL;
//     if (procEnv.NEXT_PUBLIC_API_URL) return procEnv.NEXT_PUBLIC_API_URL;
//   }
  
//   if (typeof import.meta !== 'undefined' && import.meta.env) {
//     if (import.meta.env.REACT_APP_API_URL) return import.meta.env.REACT_APP_API_URL;
//     if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
//   }
  
//   if (typeof window !== 'undefined' && window.location) {
//     const { hostname } = window.location;
//     if (hostname === 'localhost' || hostname === '127.0.0.1') {
//       return 'http://localhost:5000/api';
//     }
//     return '/api';
//   }
  
//   return 'http://localhost:5000/api';
// };

// const API_URL = getApiUrl();

// // Create axios instance with default config
// const axiosInstance = axios.create({
//   baseURL: API_URL,
//   timeout: 30000, // Increased timeout to 30 seconds
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to add auth token
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     console.error('❌ Request interceptor error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response) {
//       switch (error.response.status) {
//         case 401:
//           console.error('❌ Unauthorized access. Please login again.');
//           localStorage.removeItem('token');
//           sessionStorage.removeItem('token');
//           if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
//             // Don't auto-redirect to avoid loops
//           }
//           break;
//         case 403:
//           console.error('❌ Forbidden access.');
//           break;
//         case 404:
//           console.error('❌ Resource not found.');
//           break;
//         case 500:
//           console.error('❌ Server error.');
//           break;
//         default:
//           console.error('❌ An error occurred:', error.message);
//       }
//     } else if (error.request) {
//       console.error('❌ Network error - No response received.');
//     } else {
//       console.error('❌ Error setting up request:', error.message);
//     }
//     return Promise.reject(error);
//   }
// );

// // Video service with enhanced functionality
// export const videoService = {
//   // Get all videos with optional filtering
//   async getAll(params = {}) {
//     try {
//       console.log("🎬 Fetching videos...");
//       const response = await axiosInstance.get('/videos', { params });
//       console.log("🎬 Videos response:", response.status);
      
//       let videos = response.data;
//       if (videos && !Array.isArray(videos)) {
//         videos = videos.data || videos.videos || videos.results || [];
//       }
      
//       if (!Array.isArray(videos)) {
//         videos = [];
//       }
      
//       // Process videos to ensure thumbnail
//       const processedVideos = videos.map(video => {
//         if (!video.thumbnail && video.youtube_url) {
//           const videoId = extractVideoId(video.youtube_url);
//           if (videoId) {
//             return { ...video, thumbnail: getYouTubeThumbnail(videoId) };
//           }
//         }
//         return video;
//       });
      
//       console.log(`🎬 Loaded ${processedVideos.length} videos`);
//       return processedVideos;
//     } catch (error) {
//       console.error('❌ Error fetching videos:', error);
//       return [];
//     }
//   },

//   // Get videos by category
//   async getByCategory(category) {
//     try {
//       const response = await axiosInstance.get('/videos', { params: { category } });
//       let videos = response.data;
//       if (videos && !Array.isArray(videos)) {
//         videos = videos.data || videos.videos || videos.results || [];
//       }
//       return Array.isArray(videos) ? videos : [];
//     } catch (error) {
//       console.error(`❌ Error fetching videos by category ${category}:`, error);
//       return [];
//     }
//   },

//   // Get videos by age group
//   async getByAgeGroup(ageGroup) {
//     try {
//       const response = await axiosInstance.get('/videos', { params: { age_group: ageGroup } });
//       let videos = response.data;
//       if (videos && !Array.isArray(videos)) {
//         videos = videos.data || videos.videos || videos.results || [];
//       }
//       return Array.isArray(videos) ? videos : [];
//     } catch (error) {
//       console.error(`❌ Error fetching videos by age group ${ageGroup}:`, error);
//       return [];
//     }
//   },

//   // Get single video by ID
//   async getById(id) {
//     try {
//       if (!id) throw new Error('Video ID is required');
      
//       console.log(`🎬 Fetching video ${id}...`);
//       const response = await axiosInstance.get(`/videos/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Error fetching video with ID ${id}:`, error);
//       throw error;
//     }
//   },

//   // Create new video
//   async create(videoData) {
//     try {
//       if (!videoData.title || !videoData.youtube_url) {
//         throw new Error('Title and YouTube URL are required fields');
//       }

//       const videoId = extractVideoId(videoData.youtube_url);
//       const dataToSend = {
//         title: videoData.title,
//         youtube_url: videoData.youtube_url,
//         thumbnail: videoData.thumbnail || (videoId ? getYouTubeThumbnail(videoId) : ''),
//         description: videoData.description || '',
//         category: videoData.category || '',
//         duration: videoData.duration || '',
//         age_group: videoData.age_group || '',
//         status: videoData.status || 'active',
//       };

//       console.log("🎬 Creating video...", dataToSend);
//       const response = await axiosInstance.post('/videos', dataToSend);
//       return response.data;
//     } catch (error) {
//       console.error('❌ Error creating video:', error);
//       throw error;
//     }
//   },

//   // Update video
//   async update(id, videoData) {
//     try {
//       if (!id) throw new Error('Video ID is required');

//       const videoId = extractVideoId(videoData.youtube_url);
//       const dataToSend = {
//         title: videoData.title,
//         youtube_url: videoData.youtube_url,
//         thumbnail: videoData.thumbnail || (videoId ? getYouTubeThumbnail(videoId) : ''),
//         description: videoData.description || '',
//         category: videoData.category || '',
//         duration: videoData.duration || '',
//         age_group: videoData.age_group || '',
//         status: videoData.status || 'active',
//       };

//       console.log(`🎬 Updating video ${id}...`, dataToSend);
//       const response = await axiosInstance.put(`/videos/${id}`, dataToSend);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Error updating video with ID ${id}:`, error);
//       throw error;
//     }
//   },

//   // Partial update (PATCH)
//   async patch(id, videoData) {
//     try {
//       if (!id) throw new Error('Video ID is required');

//       const dataToSend = {};
//       if (videoData.title !== undefined) dataToSend.title = videoData.title;
//       if (videoData.youtube_url !== undefined) {
//         dataToSend.youtube_url = videoData.youtube_url;
//         const videoId = extractVideoId(videoData.youtube_url);
//         if (videoId) {
//           dataToSend.thumbnail = videoData.thumbnail || getYouTubeThumbnail(videoId);
//         }
//       }
//       if (videoData.thumbnail !== undefined) dataToSend.thumbnail = videoData.thumbnail;
//       if (videoData.description !== undefined) dataToSend.description = videoData.description;
//       if (videoData.category !== undefined) dataToSend.category = videoData.category;
//       if (videoData.duration !== undefined) dataToSend.duration = videoData.duration;
//       if (videoData.age_group !== undefined) dataToSend.age_group = videoData.age_group;
//       if (videoData.status !== undefined) dataToSend.status = videoData.status;

//       console.log(`🎬 Patching video ${id}...`, dataToSend);
//       const response = await axiosInstance.patch(`/videos/${id}`, dataToSend);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Error patching video with ID ${id}:`, error);
//       throw error;
//     }
//   },

//   // Delete video
//   async delete(id) {
//     try {
//       if (!id) throw new Error('Video ID is required');
      
//       console.log(`🗑️ Deleting video ${id}...`);
//       const response = await axiosInstance.delete(`/videos/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Error deleting video with ID ${id}:`, error);
//       throw error;
//     }
//   },

//   // Increment video views
//   async incrementViews(id) {
//     try {
//       if (!id) throw new Error('Video ID is required');
      
//       const response = await axiosInstance.patch(`/videos/${id}/views`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Error incrementing views for video ${id}:`, error);
//       throw error;
//     }
//   },

//   // Toggle like/unlike
//   async toggleLike(id) {
//     try {
//       if (!id) throw new Error('Video ID is required');
      
//       const response = await axiosInstance.post(`/videos/${id}/like`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Error toggling like for video ${id}:`, error);
//       throw error;
//     }
//   },

//   // Search videos
//   async search(query) {
//     try {
//       if (!query || query.trim().length === 0) {
//         return this.getAll();
//       }
      
//       const response = await axiosInstance.get('/videos', { 
//         params: { search: query.trim() } 
//       });
      
//       let videos = response.data;
//       if (videos && !Array.isArray(videos)) {
//         videos = videos.data || videos.videos || videos.results || [];
//       }
//       return Array.isArray(videos) ? videos : [];
//     } catch (error) {
//       console.error('❌ Error searching videos:', error);
//       return [];
//     }
//   },

//   // Bulk delete videos
//   async bulkDelete(ids) {
//     try {
//       if (!ids || ids.length === 0) {
//         throw new Error('At least one video ID is required');
//       }
      
//       const response = await axiosInstance.post('/videos/bulk-delete', { ids });
//       return response.data;
//     } catch (error) {
//       console.error('❌ Error bulk deleting videos:', error);
//       throw error;
//     }
//   },

//   // Get video statistics
//   async getStats() {
//     try {
//       const response = await axiosInstance.get('/videos/stats');
//       return response.data;
//     } catch (error) {
//       console.error('❌ Error fetching video statistics:', error);
//       return { total: 0, byCategory: {}, byAgeGroup: {} };
//     }
//   },
// };

// // ============================================
// // UTILITY FUNCTIONS
// // ============================================

// // Extract YouTube video ID from URL
// function extractVideoId(url) {
//   if (!url) return null;
//   const patterns = [
//     /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
//     /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
//     /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
//     /^([a-zA-Z0-9_-]{11})$/
//   ];
//   for (const pattern of patterns) {
//     const match = url.match(pattern);
//     if (match) return match[1];
//   }
//   return null;
// }

// // Get YouTube thumbnail URL
// function getYouTubeThumbnail(videoId, quality = 'mqdefault') {
//   if (!videoId) return null;
//   return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
// }

// // Export individual functions for flexibility
// export const {
//   getAll,
//   getById,
//   create,
//   update,
//   patch,
//   delete: deleteVideo,
//   getByCategory,
//   getByAgeGroup,
//   incrementViews,
//   toggleLike,
//   search,
//   bulkDelete,
//   getStats,
// } = videoService;

// // Export axios instance for custom requests
// export { axiosInstance };

// export default videoService;









// services/videoService.js

import axios from 'axios';



// Environment-aware API URL configuration

const getApiUrl = () => {

  // Check for various environment variable patterns

  const env = typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env
    ? globalThis.process.env
    : undefined;

  if (env) {

    if (env.REACT_APP_API_URL) {

      return env.REACT_APP_API_URL;

    }

    if (env.VITE_API_URL) {

      return env.VITE_API_URL;

    }

    if (env.NEXT_PUBLIC_API_URL) {

      return env.NEXT_PUBLIC_API_URL;

    }

  }

  

  if (typeof import.meta !== 'undefined' && import.meta.env) {

    if (import.meta.env.REACT_APP_API_URL) {

      return import.meta.env.REACT_APP_API_URL;

    }

    if (import.meta.env.VITE_API_URL) {

      return import.meta.env.VITE_API_URL;

    }

  }

  

  // Fallback URLs based on environment

  if (typeof window !== 'undefined' && window.location) {

    const { hostname } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {

      return 'http://localhost:5000/api';

    }

    // For production, use relative path or configured URL

    return '/api';

  }

  

  return 'http://localhost:5000/api';

};



const API_URL = getApiUrl();



// Create axios instance with default config

const axiosInstance = axios.create({

  baseURL: API_URL,

  timeout: 10000,

  headers: {

    'Content-Type': 'application/json',

  },

});



// Request interceptor to add auth token

axiosInstance.interceptors.request.use(

  (config) => {

    // Get token from localStorage or sessionStorage

    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (token) {

      config.headers.Authorization = `Bearer ${token}`;

    }

    return config;

  },

  (error) => {

    return Promise.reject(error);

  }

);



// Response interceptor for error handling

axiosInstance.interceptors.response.use(

  (response) => {

    return response;

  },

  (error) => {

    // Handle specific error codes

    if (error.response) {

      switch (error.response.status) {

        case 401:

          // Unauthorized - redirect to login

          console.error('Unauthorized access. Please login again.');

          // Clear tokens and redirect

          localStorage.removeItem('authToken');

          sessionStorage.removeItem('authToken');

          if (typeof window !== 'undefined') {

            window.location.href = '/login';

          }

          break;

        case 403:

          console.error('Forbidden access.');

          break;

        case 404:

          console.error('Resource not found.');

          break;

        case 500:

          console.error('Server error.');

          break;

        default:

          console.error('An error occurred:', error.message);

      }

    } else if (error.request) {

      console.error('Network error - No response received.');

    } else {

      console.error('Error setting up request:', error.message);

    }

    return Promise.reject(error);

  }

);



// Video service with enhanced functionality

export const videoService = {

  // Get all videos with optional filtering

  async getAll(params = {}) {

    try {

      const response = await axiosInstance.get('/videos', { params });

      return response.data;

    } catch (error) {

      console.error('Error fetching videos:', error);

      throw error;

    }

  },



  // Get videos by category

  async getByCategory(category) {

    try {

      const response = await axiosInstance.get('/videos', { 

        params: { category } 

      });

      return response.data;

    } catch (error) {

      console.error('Error fetching videos by category:', error);

      throw error;

    }

  },



  // Get videos by age group

  async getByAgeGroup(ageGroup) {

    try {

      const response = await axiosInstance.get('/videos', { 

        params: { age_group: ageGroup } 

      });

      return response.data;

    } catch (error) {

      console.error('Error fetching videos by age group:', error);

      throw error;

    }

  },



  // Get single video by ID

  async getById(id) {

    if (!id) {

      throw new Error('Video ID is required');

    }

    try {

      const response = await axiosInstance.get(`/videos/${id}`);

      return response.data;

    } catch (error) {

      console.error(`Error fetching video with ID ${id}:`, error);

      throw error;

    }

  },



  // Create new video

  async create(videoData) {

    try {

      // Validate required fields

      if (!videoData.title || !videoData.youtube_url) {

        throw new Error('Title and YouTube URL are required fields');

      }



      const dataToSend = {

        title: videoData.title,

        youtube_url: videoData.youtube_url,

        thumbnail: videoData.thumbnail || '',

        description: videoData.description || '',

        category: videoData.category || '',

        duration: videoData.duration || '',

        age_group: videoData.age_group || '',

        created_at: videoData.created_at || new Date().toISOString(),

        updated_at: videoData.updated_at || new Date().toISOString(),

        views: videoData.views || 0,

        likes: videoData.likes || 0,

        status: videoData.status || 'active',

      };



      const response = await axiosInstance.post('/videos', dataToSend);

      return response.data;

    } catch (error) {

      console.error('Error creating video:', error);

      throw error;

    }

  },



  // Update video

  async update(id, videoData) {

    if (!id) {

      throw new Error('Video ID is required');

    }

    try {

      const dataToSend = {

        title: videoData.title,

        youtube_url: videoData.youtube_url,

        thumbnail: videoData.thumbnail || '',

        description: videoData.description || '',

        category: videoData.category || '',

        duration: videoData.duration || '',

        age_group: videoData.age_group || '',

        updated_at: new Date().toISOString(),

        status: videoData.status || 'active',

      };

      const response = await axiosInstance.put(`/videos/${id}`, dataToSend);

      return response.data;

    } catch (error) {

      console.error(`Error updating video with ID ${id}:`, error);

      throw error;

    }

  },



  // Partial update (PATCH)

  async patch(id, videoData) {

    if (!id) {

      throw new Error('Video ID is required');

    }

    try {

      const dataToSend = {};

      

      // Only include fields that are provided

      if (videoData.title !== undefined) dataToSend.title = videoData.title;

      if (videoData.youtube_url !== undefined) dataToSend.youtube_url = videoData.youtube_url;

      if (videoData.thumbnail !== undefined) dataToSend.thumbnail = videoData.thumbnail;

      if (videoData.description !== undefined) dataToSend.description = videoData.description;

      if (videoData.category !== undefined) dataToSend.category = videoData.category;

      if (videoData.duration !== undefined) dataToSend.duration = videoData.duration;

      if (videoData.age_group !== undefined) dataToSend.age_group = videoData.age_group;

      if (videoData.status !== undefined) dataToSend.status = videoData.status;

      

      dataToSend.updated_at = new Date().toISOString();

      

      const response = await axiosInstance.patch(`/videos/${id}`, dataToSend);

      return response.data;

    } catch (error) {

      console.error(`Error patching video with ID ${id}:`, error);

      throw error;

    }

  },



  // Delete video (DELETE method) - ADD THIS

  async delete(id) {

    if (!id) {

      throw new Error('Video ID is required');

    }

    try {

      const response = await axiosInstance.delete(`/videos/${id}`);

      return response.data;

    } catch (error) {

      console.error(`Error deleting video with ID ${id}:`, error);

      throw error;

    }

  },



  // Delete video (alias for delete)

  async remove(id) {

    if (!id) {

      throw new Error('Video ID is required');

    }

    try {

      const response = await axiosInstance.delete(`/videos/${id}`);

      return response.data;

    } catch (error) {

      console.error(`Error deleting video with ID ${id}:`, error);

      throw error;

    }

  },



  // Increment video views

  async incrementViews(id) {

    if (!id) {

      throw new Error('Video ID is required');

    }

    try {

      const response = await axiosInstance.patch(`/videos/${id}/views`);

      return response.data;

    } catch (error) {

      console.error(`Error incrementing views for video ${id}:`, error);

      throw error;

    }

  },



  // Toggle like/unlike

  async toggleLike(id) {

    if (!id) {

      throw new Error('Video ID is required');

    }

    try {

      const response = await axiosInstance.post(`/videos/${id}/like`);

      return response.data;

    } catch (error) {

      console.error(`Error toggling like for video ${id}:`, error);

      throw error;

    }

  },



  // Search videos

  async search(query) {

    if (!query || query.trim().length === 0) {

      return this.getAll();

    }

    try {

      const response = await axiosInstance.get('/videos', { 

        params: { search: query.trim() } 

      });

      return response.data;

    } catch (error) {

      console.error('Error searching videos:', error);

      throw error;

    }

  },



  // Bulk delete videos

  async bulkDelete(ids) {

    if (!ids || ids.length === 0) {

      throw new Error('At least one video ID is required');

    }

    try {

      const response = await axiosInstance.post('/videos/bulk-delete', { ids });

      return response.data;

    } catch (error) {

      console.error('Error bulk deleting videos:', error);

      throw error;

    }

  },



  // Get video statistics

  async getStats() {

    try {

      const response = await axiosInstance.get('/videos/stats');

      return response.data;

    } catch (error) {

      console.error('Error fetching video statistics:', error);

      throw error;

    }

  },



  // Upload video with progress tracking

  async uploadWithProgress(formData, onProgress) {

    try {

      const response = await axiosInstance.post('/videos/upload', formData, {

        headers: {

          'Content-Type': 'multipart/form-data',

        },

        onUploadProgress: (progressEvent) => {

          if (onProgress) {

            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

            onProgress(percentCompleted);

          }

        },

      });

      return response.data;

    } catch (error) {

      console.error('Error uploading video:', error);

      throw error;

    }

  },

};



// Export individual functions for flexibility

export const {

  getAll,

  getById,

  create,

  update,

  patch,

  remove,

  delete: deleteVideo, // Renamed to avoid reserved word issues

  getByCategory,

  getByAgeGroup,

  incrementViews,

  toggleLike,

  search,

  bulkDelete,

  getStats,

  uploadWithProgress,

} = videoService;



// Export axios instance for custom requests

export { axiosInstance };



export default videoService;






