// src/components/admin/AdminNewsletters.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  EnvelopeIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  CalendarIcon,
  
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  UserPlusIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentArrowDownIcon,
  
} from '@heroicons/react/24/outline';
import { newsletterService } from '../../services/newsletterService';

const AdminNewsletters = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddSubscribersModal, setShowAddSubscribersModal] = useState(false);
  const [showSubscribersList, setShowSubscribersList] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [subscriberEmails, setSubscriberEmails] = useState('');
  const [isAddingSubscribers, setIsAddingSubscribers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    recipientGroup: 'all'
  });
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const loadNewsletters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load newsletters
      const data = await newsletterService.getAll();
      setNewsletters(Array.isArray(data) ? data : []);
      
      // Load subscribers
      try {
        const subsData = await newsletterService.getSubscribers();
        setSubscribers(Array.isArray(subsData) ? subsData : []);
      } catch (subError) {
        console.warn('Could not load subscribers:', subError);
        setSubscribers([]);
      }
    } catch (err) {
      console.error('Error fetching newsletters:', err);
      setError('Failed to load newsletters. Please try again.');
      setNewsletters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNewsletters();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadNewsletters]);

  const handleAddSubscribers = async (e) => {
    e.preventDefault();
    
    if (!subscriberEmails.trim()) {
      showNotification('error', 'Please enter at least one email address');
      return;
    }

    // Parse emails - split by newline, comma, or semicolon
    const emails = subscriberEmails
      .split(/[\n,;]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length === 0) {
      showNotification('error', 'No valid email addresses found');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      showNotification('error', `Invalid email format: ${invalidEmails.join(', ')}`);
      return;
    }

    setIsAddingSubscribers(true);

    try {
      const result = await newsletterService.addSubscribers(emails);
      
      if (result) {
        const addedCount = result.added || result.success?.length || emails.length;
        const skippedCount = result.skipped || 0;
        
        let message = `Successfully added ${addedCount} subscriber(s)`;
        if (skippedCount > 0) {
          message += ` (${skippedCount} skipped - already existed)`;
        }
        showNotification('success', message);
        setSubscriberEmails('');
        setShowAddSubscribersModal(false);
        await loadNewsletters(); // Refresh data
      } else {
        showNotification('error', 'Failed to add subscribers');
      }
    } catch (error) {
      console.error('Error adding subscribers:', error);
      showNotification('error', error.message || 'Failed to add subscribers');
    } finally {
      setIsAddingSubscribers(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await newsletterService.create(formData);
      showNotification('success', 'Newsletter created successfully');
      setShowCreateModal(false);
      setFormData({ title: '', content: '', recipientGroup: 'all' });
      loadNewsletters();
    } catch (error) {
      console.error('Error creating newsletter:', error);
      showNotification('error', 'Failed to create newsletter');
    }
  };

  const handleDelete = async () => {
    if (!selectedNewsletter) return;
    try {
      setDeleteLoading(true);
      await newsletterService.delete(selectedNewsletter.id);
      showNotification('success', 'Newsletter deleted successfully');
      setShowDeleteModal(false);
      setSelectedNewsletter(null);
      loadNewsletters();
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      showNotification('error', 'Failed to delete newsletter');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleView = (newsletter) => {
    setSelectedNewsletter(newsletter);
    setShowViewModal(true);
  };

  const handleEdit = () => {
    showNotification('info', 'Edit functionality coming soon');
  };

  const handleSendNewsletter = async (newsletter) => {
    if (!window.confirm(`Are you sure you want to send "${newsletter.title}" to all subscribers?`)) {
      return;
    }
    
    try {
      await newsletterService.send(newsletter.id);
      showNotification('success', `Newsletter "${newsletter.title}" sent successfully!`);
      loadNewsletters();
    } catch (error) {
      console.error('Error sending newsletter:', error);
      showNotification('error', 'Failed to send newsletter');
    }
  };

  const handleExportSubscribers = async () => {
    try {
      const blob = await newsletterService.exportSubscribers('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotification('success', 'Subscribers exported successfully');
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      showNotification('error', 'Failed to export subscribers');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSubscriberStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-gray-100 text-gray-500';
  };

  // Filter subscribers
  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get subscriber stats
  const activeSubscribers = subscribers.filter(s => s.status === 'active').length;
  const inactiveSubscribers = subscribers.filter(s => s.status === 'inactive').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Newsletter Management</h1>
            <p className="text-gray-500 mt-1">Manage subscribers, campaigns, and email broadcasts</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">Loading newsletters & subscribers...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait while campaigns are retrieved</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ExclamationCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadNewsletters}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200' : 
          notification.type === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
          ) : notification.type === 'error' ? (
            <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
          ) : (
            <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
          )}
          <span className={notification.type === 'success' ? 'text-green-800' : 
            notification.type === 'error' ? 'text-red-800' : 'text-blue-800'}>
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
          <h1 className="text-3xl font-bold text-gray-800">Newsletters</h1>
          <p className="text-gray-500 mt-1">Manage email newsletters and subscribers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddSubscribersModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <UserPlusIcon className="w-5 h-5" />
            Add Subscribers
          </button>
          <button
            onClick={handleExportSubscribers}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Newsletter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Newsletters</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{newsletters.length}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl">
              <EnvelopeIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{subscribers.length}</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{activeSubscribers}</p>
            </div>
            <div className="p-3 bg-green-500 rounded-xl">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Inactive</p>
              <p className="text-2xl font-bold text-gray-500 mt-1">{inactiveSubscribers}</p>
            </div>
            <div className="p-3 bg-gray-500 rounded-xl">
              <XMarkIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Sent</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {newsletters.filter(n => n.status === 'sent').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-500 rounded-xl">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers List Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowSubscribersList(!showSubscribersList)}
          className="flex items-center gap-2 text-gray-700 font-medium hover:text-gray-900 transition-colors"
        >
          <UsersIcon className="w-5 h-5" />
          <span>Subscribers List</span>
          {showSubscribersList ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
          <span className="text-sm text-gray-400 font-normal">
            ({subscribers.length} total)
          </span>
        </button>
      </div>

      {/* Subscribers List */}
      {showSubscribersList && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            {filteredSubscribers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No subscribers found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubscribers.map((sub, index) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{sub.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getSubscriberStatusColor(sub.status)}`}>
                          {sub.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(sub.subscribed_at || sub.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Newsletter List */}
      {newsletters.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <EnvelopeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No newsletters found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Create your first newsletter
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {newsletters.map((newsletter) => (
                  <tr key={newsletter.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{newsletter.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{newsletter.content?.substring(0, 100)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        {newsletter.recipientGroup || 'All'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(newsletter.status)}`}>
                        {newsletter.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(newsletter.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleView(newsletter)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendNewsletter(newsletter)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Send"
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(newsletter)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedNewsletter(newsletter);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Subscribers Modal */}
      {showAddSubscribersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Add Subscribers</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Enter email addresses (one per line, or separated by commas or semicolons)
                </p>
              </div>
              <button
                onClick={() => setShowAddSubscribersModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubscribers}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Addresses <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={subscriberEmails}
                    onChange={(e) => setSubscriberEmails(e.target.value)}
                    rows="8"
                    placeholder="Enter email addresses here...&#10;Example:&#10;user1@email.com&#10;user2@email.com&#10;user3@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    You can enter multiple emails by separating with new lines, commas, or semicolons.
                    Duplicate emails will be automatically skipped.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      <strong>Tip:</strong> You can paste a list of emails from Excel, Google Sheets, or any text file.
                      Example: aarav01@gmail.com, diya02@gmail.com, vivaan03@gmail.com
                    </span>
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Note:</strong> All new subscribers will be added with <strong>"active"</strong> status.
                      Existing emails will be skipped automatically.
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSubscribersModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isAddingSubscribers}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingSubscribers || !subscriberEmails.trim()}
                  className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 ${
                    isAddingSubscribers || !subscriberEmails.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isAddingSubscribers ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="w-5 h-5" />
                      <span>Add Subscribers</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Add Examples */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500 mb-2">Quick Add Examples (click to use):</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSubscriberEmails('aarav01@gmail.com\ndiya02@gmail.com\nvivaan03@gmail.com')}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  Add 3 emails
                </button>
                <button
                  onClick={() => setSubscriberEmails('kiara04@gmail.com, advik05@gmail.com, anaya06@gmail.com')}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  Add 3 (comma separated)
                </button>
                <button
                  onClick={() => setSubscriberEmails('vihaan07@gmail.com; myra08@gmail.com; isha09@gmail.com')}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  Add 3 (semicolon)
                </button>
                <button
                  onClick={() => setSubscriberEmails('rahul@gmail.com\npriya@gmail.com\namit@gmail.com\nsneha@gmail.com\nvikram@gmail.com')}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  Add 5 emails
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Create Newsletter</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Group</label>
                  <select
                    value={formData.recipientGroup}
                    onChange={(e) => setFormData({ ...formData, recipientGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Subscribers</option>
                    <option value="active">Active Users</option>
                    <option value="new">New Users</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Create Newsletter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedNewsletter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-800">{selectedNewsletter.title}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedNewsletter.status)}`}>
                  {selectedNewsletter.status || 'pending'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Recipients</span>
                <span className="text-gray-700">{selectedNewsletter.recipientGroup || 'All'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">{new Date(selectedNewsletter.created_at).toLocaleString()}</span>
              </div>
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedNewsletter.content}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t mt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedNewsletter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Newsletter</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the newsletter "{selectedNewsletter.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedNewsletter(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
    </div>
  );
};

export default AdminNewsletters;