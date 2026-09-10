import { useState, useEffect, useCallback } from 'react';
import {
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  EnvelopeIcon,
  UserIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { contactService } from '../../services/contactService';

const StatCard = ({ title, count, icon: Icon, color, filter, description, onClick, isActive }) => (
  <div 
    onClick={() => onClick(filter)}
    className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md ${
      isActive ? 'ring-2 ring-green-500 border-green-500' : 'border-gray-100'
    }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{count}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <div className={`p-3 ${color} rounded-xl`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    replied: 0
  });

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data = [];
      
      try {
        switch(filterStatus) {
          case 'pending':
            data = await contactService.getPending();
            break;
          case 'replied':
            data = await contactService.getReplied();
            break;
          default:
            data = await contactService.getAll();
            break;
        }
        setContacts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        // Check if it's a 500 error or connection error
        if (err.response?.status === 500 || err.code === 'ERR_NETWORK') {
          setError('Contact service is currently unavailable. Please try again later.');
          setContacts([]);
        } else {
          setError('Failed to load contacts. Please try again.');
          setContacts([]);
        }
        // Don't re-throw, just handle gracefully
      }
      
      // Fetch stats - don't let stats failure affect the main data
      try {
        const statsData = await contactService.getStats();
        setStats({
          total: statsData.total || 0,
          pending: statsData.pending || 0,
          replied: statsData.replied || 0
        });
      } catch (statsError) {
        console.error('Error fetching stats:', statsError);
        // Set default stats on error
        setStats({
          total: contacts.length || 0,
          pending: contacts.filter(c => !c.replied).length || 0,
          replied: contacts.filter(c => c.replied).length || 0
        });
      }
    } catch (error) {
      console.error('Error in fetchContacts:', error);
      setError('Failed to load contacts. Please try again.');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, contacts.length]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (!mounted) return;
      await fetchContacts();
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [filterStatus, fetchContacts]);

  const handleDelete = async (id) => {
    try {
      setDeleteLoading(true);
      await contactService.delete(id);
      await fetchContacts();
      setShowDeleteModal(false);
      setContactToDelete(null);
      showNotification('success', 'Contact deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      if (error.response?.status === 500) {
        showNotification('error', 'Failed to delete contact. Server error.');
      } else {
        showNotification('error', 'Failed to delete contact');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowContactDetail(true);
  };

  const handleFilterClick = (filter) => {
    setFilterStatus(filter);
    setSearchTerm('');
    setError(null);
  };

  const handleRetry = () => {
    fetchContacts();
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleIcon className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Try Again
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
          <h1 className="text-3xl font-bold text-gray-800">Contacts</h1>
          <p className="text-gray-500 mt-1">Manage contact inquiries</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {viewMode === 'grid' ? 'Table View' : 'Grid View'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          title="Total"
          count={stats.total}
          icon={EnvelopeIcon}
          color="bg-blue-500"
          filter="all"
          description="All inquiries"
          onClick={handleFilterClick}
          isActive={filterStatus === 'all'}
        />
        <StatCard
          title="Pending"
          count={stats.pending}
          icon={ClockIcon}
          color="bg-yellow-500"
          filter="pending"
          description="Need attention"
          onClick={handleFilterClick}
          isActive={filterStatus === 'pending'}
        />
        <StatCard
          title="Replied"
          count={stats.replied}
          icon={CheckCircleIcon}
          color="bg-green-500"
          filter="replied"
          description="Resolved"
          onClick={handleFilterClick}
          isActive={filterStatus === 'replied'}
        />
      </div>

      {/* Search Bar - Moved below stats and made more compact */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 relative w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts by name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
          </span>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        filteredContacts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <EnvelopeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No contacts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <div 
                key={contact.id} 
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all hover:border-green-300 group ${
                  contact.status === 'pending' ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-200'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">{contact.name}</h3>
                        <p className="text-xs text-gray-500">{contact.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleViewContact(contact)}
                        className="p-1.5 bg-gray-100 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setContactToDelete(contact);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 bg-gray-100 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Contact"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Subject</span>
                      <span className="text-gray-700 font-medium truncate max-w-[150px]">
                        {contact.subject || 'No subject'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        contact.replied ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {contact.replied ? '✓ Replied' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Received</span>
                      <span className="text-gray-700">{new Date(contact.created_at).toLocaleDateString()}</span>
                    </div>
                    {contact.message && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-600 line-clamp-2">{contact.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.map((contact, index) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{contact.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{contact.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{contact.subject || 'No subject'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        contact.replied ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {contact.replied ? '✓ Replied' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button 
                        onClick={() => handleViewContact(contact)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setContactToDelete(contact);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <EnvelopeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No contacts found</p>
            </div>
          )}
        </div>
      )}

      {/* View Contact Detail Modal */}
      {showContactDetail && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Contact Details</h3>
              </div>
              <button
                onClick={() => setShowContactDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{selectedContact.name}</h4>
                  <p className="text-gray-500">{selectedContact.email}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subject</span>
                  <span className="text-gray-700 font-medium">{selectedContact.subject || 'No subject'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    selectedContact.replied ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedContact.replied ? '✓ Replied' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Received</span>
                  <span className="text-gray-700">{new Date(selectedContact.created_at).toLocaleString()}</span>
                </div>
              </div>

              {selectedContact.message && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-4 border-t mt-4">
              <button
                onClick={() => {
                  setShowContactDetail(false);
                  setContactToDelete(selectedContact);
                  setShowDeleteModal(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => setShowContactDetail(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && contactToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Contact</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the contact from "{contactToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setContactToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(contactToDelete.id)}
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

export default AdminContacts;