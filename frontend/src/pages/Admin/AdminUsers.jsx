import { useState, useEffect, useCallback } from 'react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  
  // Statistics - For ALL users
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    admins: 0,
    users: 0,
    loggedInToday: 0,
    loggedInThisWeek: 0,
    neverLoggedIn: 0,
    recentUsers: 0
  });
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch ALL users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      const usersData = Array.isArray(response.data)
        ? response.data
        : (response.data?.users || response.data?.data || []);
      
      // Store all users for statistics
      setAllUsers(usersData);
      
      // Calculate statistics from ALL users
      const total = usersData.length;
      const active = usersData.filter(u => u.status === 'active').length;
      const inactive = usersData.filter(u => u.status === 'inactive').length;
      const pending = usersData.filter(u => u.status === 'pending' || !u.email_verified).length;
      const admins = usersData.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
      const regularUsers = usersData.filter(u => u.role === 'user').length;
      
      // Login statistics - from ALL users
      const today = new Date().toDateString();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const loggedInToday = usersData.filter(u => {
        if (!u.last_login) return false;
        return new Date(u.last_login).toDateString() === today;
      }).length;
      
      const loggedInThisWeek = usersData.filter(u => {
        if (!u.last_login) return false;
        return new Date(u.last_login) >= weekAgo;
      }).length;
      
      const neverLoggedIn = usersData.filter(u => !u.last_login).length;
      
      // Recent users (joined in last 7 days)
      const recentUsers = usersData.filter(u => {
        const created = new Date(u.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created >= weekAgo;
      }).length;
      
      setStats({
        total,
        active,
        inactive,
        pending,
        admins,
        users: regularUsers,
        loggedInToday,
        loggedInThisWeek,
        neverLoggedIn,
        recentUsers
      });
      
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        fetchUsers();
      }
    });

    return () => {
      active = false;
    };
  }, [fetchUsers]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active',
      password: '',
    });
    setFormError('');
    setFormSuccess('');
    setEditingUser(null);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  // Open edit modal
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
      status: user.status || 'active',
      password: '',
    });
    setShowModal(true);
  };

  // View user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  // Handle form submit (edit only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      await api.put(`/users/${editingUser.id}`, formData);
      setFormSuccess('User updated successfully!');
      setTimeout(() => {
        setShowModal(false);
        fetchUsers();
        resetForm();
      }, 1000);
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setFormError(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Filter users - Show ALL users for admin view
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get role badge color
  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-blue-100 text-blue-800 border-blue-200',
      user: 'bg-green-100 text-green-800 border-green-200',
    };
    return badges[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircleIcon className="w-3 h-3" /> };
      case 'inactive':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircleIcon className="w-3 h-3" /> };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <ClockIcon className="w-3 h-3" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: null };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-500 mt-1">View and manage all users in the system</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">Loading users list...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait while user records are being retrieved</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 mt-1">View and manage all users in the system</p>
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

      {/* Statistics Cards - All Users */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <UserGroupIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">{stats.recentUsers}</span>
            <span className="text-gray-400 ml-1">new this week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 font-medium">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
            </span>
            <span className="text-gray-400 ml-1">of total users</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Logged In Today</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.loggedInToday}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <ArrowRightOnRectangleIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <CalendarIcon className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-blue-500 font-medium">{stats.loggedInThisWeek}</span>
            <span className="text-gray-400 ml-1">this week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Never Logged In</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{stats.neverLoggedIn}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <ArrowLeftOnRectangleIcon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500 font-medium">
              {stats.total > 0 ? Math.round((stats.neverLoggedIn / stats.total) * 100) : 0}%
            </span>
            <span className="text-gray-400 ml-1">of total users</span>
          </div>
        </div>
      </div>

      {/* Additional Stats - Second Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Admins</p>
          <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
          <p className="text-xs text-gray-400 mt-1">Administrators</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Regular Users</p>
          <p className="text-2xl font-bold text-green-600">{stats.users}</p>
          <p className="text-xs text-gray-400 mt-1">Standard users</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting activation</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Recent Users</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.recentUsers}</p>
          <p className="text-xs text-gray-400 mt-1">Joined in last 7 days</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Grid View - Shows ALL users */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const statusBadge = getStatusBadge(user.status);
              const isCurrentUser = user.id === currentUser?.id;
              
              return (
                <div 
                  key={user.id} 
                  className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-md transition-all hover:border-orange-300 group ${isCurrentUser ? 'border-blue-300' : 'border-gray-200'}`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {user.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center">
                            <EnvelopeIcon className="w-3 h-3 mr-1" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-1.5 bg-gray-100 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <MagnifyingGlassIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 bg-gray-100 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {!isCurrentUser && (
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 bg-gray-100 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Role</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize border ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize border flex items-center gap-1 ${statusBadge.color}`}>
                          {statusBadge.icon}
                          {user.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Last Login</span>
                        <span className="text-gray-700">{formatDate(user.last_login)}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Phone</span>
                          <span className="text-gray-700">{user.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </span>
                      <ArrowRightOnRectangleIcon className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      ) : (
        /* Table View - Shows ALL users */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => {
                    const statusBadge = getStatusBadge(user.status);
                    const isCurrentUser = user.id === currentUser?.id;
                    
                    return (
                      <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${isCurrentUser ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.name}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <EnvelopeIcon className="w-3 h-3 mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.phone ? (
                            <div className="text-sm text-gray-500 flex items-center">
                              <PhoneIcon className="w-3 h-3 mr-1" />
                              {user.phone}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not provided</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border flex items-center gap-1 w-fit ${statusBadge.color}`}>
                            {statusBadge.icon}
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(user.last_login)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <MagnifyingGlassIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          {!isCurrentUser && (
                            <button
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteModal(true);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7">
                      <div className="text-center py-12">
                        <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No users found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedUser.name}</h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize border ${getRoleBadge(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize border flex items-center gap-1 ${getStatusBadge(selectedUser.status).color}`}>
                  {getStatusBadge(selectedUser.status).icon}
                  {selectedUser.status}
                </span>
              </div>
              {selectedUser.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-700">{selectedUser.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Joined</span>
                <span className="text-gray-700">{new Date(selectedUser.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Login</span>
                <span className="text-gray-700">{formatDate(selectedUser.last_login)}</span>
              </div>
              {selectedUser.last_login && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Login IP</span>
                  <span className="text-gray-700">{selectedUser.last_login_ip || 'N/A'}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
              <button
                onClick={() => {
                  setShowUserDetail(false);
                  handleEdit(selectedUser);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <PencilIcon className="w-4 h-4 inline mr-2" />
                Edit Profile
              </button>
              <button
                onClick={() => setShowUserDetail(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm flex items-start space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 text-sm flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-colors shadow-lg hover:shadow-orange-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update User'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete User</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(userToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;