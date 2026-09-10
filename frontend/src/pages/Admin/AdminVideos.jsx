// src/pages/admin/AdminVideos.jsx
import { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  VideoCameraIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { videoService } from '../../services/videoService';
import { useNavigate } from 'react-router-dom';

const AdminVideos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVideoDetail, setShowVideoDetail] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [formData, setFormData] = useState({
    title: '',
    youtube_url: '',
    thumbnail: '',
    description: '',
    category: '',
    age_group: ''
  });

  const videoCategories = ['Educational', 'Entertainment', 'Storytelling', 'Music', 'Art', 'Science', 'Animation', 'Documentary'];
  const ageGroups = ['0-1 years', '1-2 years', '2-4 years', '4-6 years'];

  // YouTube helper functions
  const extractVideoId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getYouTubeThumbnail = (videoId, quality = 'mqdefault') => {
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
  };

  // Auto-fetch thumbnail when YouTube URL changes
  const handleYouTubeUrlChange = (url) => {
    const videoId = extractVideoId(url);
    if (videoId) {
      const thumbnail = getYouTubeThumbnail(videoId);
      setFormData(prev => ({
        ...prev,
        youtube_url: url,
        thumbnail: thumbnail || prev.thumbnail
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        youtube_url: url
      }));
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await videoService.getAll();
      // Process videos to add thumbnail if missing
      const processedVideos = data.map(video => {
        if (!video.thumbnail) {
          const videoId = extractVideoId(video.youtube_url);
          if (videoId) {
            return { ...video, thumbnail: getYouTubeThumbnail(videoId) };
          }
        }
        return video;
      });
      setVideos(processedVideos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      showNotification('error', 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchVideos();
    };
    loadData();
  }, [fetchVideos]);

  const handleViewAllVideos = () => {
    navigate('/all-videos');
  };

  const handleDelete = async (id) => {
    try {
      setDeleteLoading(true);
      await videoService.delete(id);
      await fetchVideos();
      setShowDeleteModal(false);
      setVideoToDelete(null);
      showNotification('success', 'Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      showNotification('error', error.message || 'Failed to delete video');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddVideo = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      youtube_url: '',
      thumbnail: '',
      description: '',
      category: '',
      age_group: ''
    });
    setShowAddModal(true);
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || '',
      youtube_url: video.youtube_url || video.url || '',
      thumbnail: video.thumbnail || '',
      description: video.description || '',
      category: video.category || '',
      age_group: video.age_group || ''
    });
    setShowAddModal(true);
  };

  const handleViewVideo = (video) => {
    setSelectedVideo(video);
    setShowVideoDetail(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!formData.title.trim()) {
        showNotification('error', 'Title is required');
        setIsSubmitting(false);
        return;
      }
      if (!formData.youtube_url.trim()) {
        showNotification('error', 'YouTube URL is required');
        setIsSubmitting(false);
        return;
      }

      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!youtubeRegex.test(formData.youtube_url.trim())) {
        showNotification('error', 'Please enter a valid YouTube URL');
        setIsSubmitting(false);
        return;
      }

      // Extract video ID and auto-set thumbnail if not provided
      const videoId = extractVideoId(formData.youtube_url);
      if (videoId && !formData.thumbnail) {
        setFormData(prev => ({
          ...prev,
          thumbnail: getYouTubeThumbnail(videoId)
        }));
      }

      const videoData = {
        ...formData,
        // Ensure thumbnail is set
        thumbnail: formData.thumbnail || (videoId ? getYouTubeThumbnail(videoId) : '')
      };

      if (editingVideo) {
        await videoService.update(editingVideo.id, videoData);
        showNotification('success', 'Video updated successfully');
      } else {
        await videoService.create(videoData);
        showNotification('success', 'Video created successfully');
      }
      
      await fetchVideos();
      setShowAddModal(false);
      setEditingVideo(null);
      setFormData({
        title: '',
        youtube_url: '',
        thumbnail: '',
        description: '',
        category: '',
        age_group: ''
      });
    } catch (error) {
      console.error('Error saving video:', error);
      let errorMessage = 'Failed to save video. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      showNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'youtube_url') {
      handleYouTubeUrlChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          video.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Videos</h1>
            <p className="text-gray-500 mt-1">Manage your video collection</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">Loading videos...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your video collection</p>
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Videos</h1>
          <p className="text-gray-500 mt-1">Manage your video collection</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {viewMode === 'grid' ? 'Table View' : 'Grid View'}
          </button>
          <button 
            onClick={handleAddVideo}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add New Video</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Videos</p>
          <p className="text-2xl font-bold text-gray-800">{videos.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-bold text-orange-600">
            {new Set(videos.map(v => v.category).filter(Boolean)).size}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Age Groups</p>
          <p className="text-2xl font-bold text-purple-600">
            {new Set(videos.map(v => v.age_group).filter(Boolean)).size}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Views</p>
          <p className="text-2xl font-bold text-blue-600">
            {videos.reduce((sum, v) => sum + (v.views || 0), 0)}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Categories</option>
          {videoCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="text-sm text-gray-500 flex items-center">
          {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        filteredVideos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <VideoCameraIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No videos found</p>
            <button
              onClick={handleAddVideo}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Your First Video
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => {
                // Ensure thumbnail is available
                const videoId = extractVideoId(video.youtube_url);
                const thumbnail = video.thumbnail || (videoId ? getYouTubeThumbnail(videoId) : null);
                
                return (
                  <div 
                    key={video.id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all hover:border-orange-300 group"
                  >
                    <a 
                      href={video.youtube_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block h-48 overflow-hidden relative cursor-pointer"
                    >
                      {thumbnail ? (
                        <img 
                          src={thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/video-placeholder.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                          <VideoCameraIcon className="w-16 h-16 text-orange-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-orange-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        <span className="px-2 py-0.5 bg-black/60 rounded-full text-xs text-white">
                          {video.age_group || 'All Ages'}
                        </span>
                        {video.views > 0 && (
                          <span className="px-2 py-0.5 bg-black/60 rounded-full text-xs text-white">
                            👁️ {video.views}
                          </span>
                        )}
                      </div>
                    </a>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 truncate">{video.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-orange-600 font-medium">{video.category || 'Uncategorized'}</span>
                        <span className="text-xs text-gray-400">{video.duration || 'N/A'}</span>
                      </div>
                      {video.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {video.description}
                        </p>
                      )}
                      <div className="mt-3 pt-3 border-t flex items-center justify-end">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewVideo(video)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditVideo(video)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit Video"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setVideoToDelete(video);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Video"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* "Watch All Videos" Button */}
            {filteredVideos.length > 4 && (
              <div className="mt-8 pb-4 flex justify-center">
                <button
                  onClick={handleViewAllVideos}
                  className="group px-8 py-3 bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 text-white font-bold rounded-full transition-all duration-300 text-base shadow-lg hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  <VideoCameraIcon className="w-5 h-5 group-hover:animate-bounce" />
                  Watch All Videos
                  <span className="text-sm font-normal opacity-75">
                    ({filteredVideos.length} videos)
                  </span>
                </button>
              </div>
            )}
          </>
        )
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVideos.map((video, index) => (
                  <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {video.thumbnail ? (
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                const videoId = extractVideoId(video.youtube_url);
                                if (videoId) {
                                  e.target.src = getYouTubeThumbnail(videoId);
                                }
                              }}
                            />
                          ) : (
                            <VideoCameraIcon className="w-5 h-5 text-gray-400 m-2.5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{video.title}</p>
                          <a 
                            href={video.youtube_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-orange-500 hover:text-orange-600 hover:underline flex items-center"
                          >
                            View on YouTube
                            <ArrowRightIcon className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                        {video.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{video.age_group || 'All'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{video.views || 0}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleViewVideo(video)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleEditVideo(video)}
                        className="p-1 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          setVideoToDelete(video);
                          setShowDeleteModal(true);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredVideos.length === 0 && (
            <div className="text-center py-12">
              <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No videos found</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter video title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube URL *
                </label>
                <input
                  type="url"
                  name="youtube_url"
                  value={formData.youtube_url}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  💡 Thumbnail will be auto-fetched from YouTube
                </p>
              </div>

              {/* Preview of auto-fetched thumbnail */}
              {formData.thumbnail && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail Preview (Auto-fetched)
                  </label>
                  <div className="w-40 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={formData.thumbnail} 
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/video-placeholder.jpg';
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter video description (optional)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select category</option>
                    {videoCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Group
                  </label>
                  <select
                    name="age_group"
                    value={formData.age_group}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select age group</option>
                    {ageGroups.map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{editingVideo ? 'Updating...' : 'Creating...'}</span>
                    </span>
                  ) : (
                    <span>{editingVideo ? 'Update Video' : 'Create Video'}</span>
                  )}
                </button>
              </div>
            </form>
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
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {selectedVideo.category || 'Uncategorized'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {selectedVideo.age_group || 'All Ages'}
                  </span>
                  {selectedVideo.views > 0 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      👁️ {selectedVideo.views} views
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowVideoDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <a 
              href={selectedVideo.youtube_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block relative cursor-pointer group"
            >
              {selectedVideo.thumbnail ? (
                <div className="relative">
                  <img 
                    src={selectedVideo.thumbnail} 
                    alt={selectedVideo.title}
                    className="w-full max-h-80 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      const videoId = extractVideoId(selectedVideo.youtube_url);
                      if (videoId) {
                        e.target.src = getYouTubeThumbnail(videoId);
                      } else {
                        e.target.src = '/images/video-placeholder.jpg';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-10 h-10 text-orange-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center rounded-lg mb-4">
                  <VideoCameraIcon className="w-16 h-16 text-orange-300" />
                </div>
              )}
            </a>

            {selectedVideo.description && (
              <div className="prose max-w-none">
                <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedVideo.description}
                </p>
              </div>
            )}

            {selectedVideo.youtube_url && (
              <div className="mt-4">
                <a 
                  href={selectedVideo.youtube_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <VideoCameraIcon className="w-4 h-4 mr-2" />
                  Watch Video on YouTube
                </a>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
              <button
                onClick={() => {
                  setShowVideoDetail(false);
                  handleEditVideo(selectedVideo);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <PencilIcon className="w-4 h-4 inline mr-2" />
                Edit Video
              </button>
              <button
                onClick={() => {
                  setShowVideoDetail(false);
                  setVideoToDelete(selectedVideo);
                  setShowDeleteModal(true);
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

      {/* Delete Modal */}
      {showDeleteModal && videoToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Video</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{videoToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setVideoToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(videoToDelete.id)}
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
    </div>
  );
};

export default AdminVideos;