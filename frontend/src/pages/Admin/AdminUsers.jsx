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
  CalendarIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ShieldCheckIcon
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
      superadmin: 'bg-rose-50 text-rose-700 border-rose-200/80',
      admin: 'bg-purple-50 text-purple-700 border-purple-200/80',
      user: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    };
    return badges[role] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', icon: <CheckCircleIcon className="w-3.5 h-3.5" /> };
      case 'inactive':
        return { color: 'bg-rose-50 text-rose-700 border-rose-200/80', icon: <XCircleIcon className="w-3.5 h-3.5" /> };
      case 'pending':
        return { color: 'bg-amber-50 text-amber-700 border-amber-200/80', icon: <ClockIcon className="w-3.5 h-3.5" /> };
      default:
        return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: null };
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">User Directory</h1>
          <p className="text-slate-500 mt-1 text-sm">View, filter, and manage registered members and administrative permissions</p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Squares2X2Icon className="w-4 h-4" />
            Grid
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableCellsIcon className="w-4 h-4" />
            Table
          </button>
        </div>
      </div>

      {/* Statistics Cards - Primary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 border-t-4 border-t-blue-500 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <UserGroupIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
            <ArrowTrendingUpIcon className="w-3.5 h-3.5 mr-1" />
            <span>+{stats.recentUsers} this week</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 border-t-4 border-t-emerald-500 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Accounts</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1.5">{stats.active}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold mr-1">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
            </span>
            <span>of total users</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 border-t-4 border-t-indigo-500 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Logged In Today</p>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-1.5">{stats.loggedInToday}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-500 mr-1" />
            <span className="font-semibold text-indigo-600 mr-1">{stats.loggedInThisWeek}</span>
            <span>active this week</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 border-t-4 border-t-amber-500 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Never Logged In</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-700 mt-1.5">{stats.neverLoggedIn}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span className="text-amber-600 font-semibold mr-1">
              {stats.total > 0 ? Math.round((stats.neverLoggedIn / stats.total) * 100) : 0}%
            </span>
            <span>dormant accounts</span>
          </div>
        </div>
      </div>

      {/* Additional Stats - Second Row Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Admins</p>
            <p className="text-lg font-bold text-slate-900">{stats.admins}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Regular Users</p>
            <p className="text-lg font-bold text-slate-900">{stats.users}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
            <ClockIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pending</p>
            <p className="text-lg font-bold text-slate-900">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">New (7 Days)</p>
            <p className="text-lg font-bold text-slate-900">{stats.recentUsers}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm cursor-pointer"
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
              const isAdmin = user.role === 'admin' || user.role === 'superadmin';
              
              return (
                <div 
                  key={user.id} 
                  className={`bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md overflow-hidden flex flex-col justify-between ${
                    isCurrentUser ? 'border-emerald-400 ring-1 ring-emerald-400/30' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0 ${
                          isAdmin 
                            ? 'bg-gradient-to-tr from-purple-600 to-indigo-500' 
                            : 'bg-gradient-to-tr from-emerald-500 to-teal-500'
                        }`}>
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                            <span className="truncate">{user.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                                You
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-slate-500 truncate flex items-center mt-0.5">
                            <EnvelopeIcon className="w-3 h-3 mr-1 flex-shrink-0 text-slate-400" />
                            <span className="truncate">{user.email}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-1.5 bg-slate-100/70 hover:bg-slate-200/70 text-slate-600 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <MagnifyingGlassIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 bg-slate-100/70 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {!isCurrentUser && (
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 bg-slate-100/70 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Role</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold capitalize border ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Status</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold capitalize border flex items-center gap-1 ${statusBadge.color}`}>
                          {statusBadge.icon}
                          {user.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Last Active</span>
                        <span className="text-slate-700 font-medium">{formatDate(user.last_login)}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Phone</span>
                          <span className="text-slate-700 font-medium">{user.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="text-slate-300">ID #{user.id}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
              <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-semibold text-base">No users found</p>
              <p className="text-slate-400 text-xs mt-1">Try adjusting your search or status filter</p>
            </div>
          )}
        </div>
      ) : (
        /* Table View - Shows ALL users */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/70 border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => {
                    const statusBadge = getStatusBadge(user.status);
                    const isCurrentUser = user.id === currentUser?.id;
                    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
                    
                    return (
                      <tr key={user.id} className={`hover:bg-slate-50/60 transition-colors ${isCurrentUser ? 'bg-emerald-50/20' : ''}`}>
                        <td className="px-5 py-4 text-xs font-semibold text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0 ${
                              isAdmin ? 'bg-gradient-to-tr from-purple-600 to-indigo-500' : 'bg-gradient-to-tr from-emerald-500 to-teal-500'
                            }`}>
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                                {user.name}
                                {isCurrentUser && (
                                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-full font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 flex items-center mt-0.5">
                                <EnvelopeIcon className="w-3 h-3 mr-1 text-slate-400" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {user.phone ? (
                            <div className="text-xs text-slate-600 flex items-center font-medium">
                              <PhoneIcon className="w-3 h-3 mr-1 text-slate-400" />
                              {user.phone}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">None</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border flex items-center gap-1 w-fit ${statusBadge.color}`}>
                            {statusBadge.icon}
                            {user.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                          {formatDate(user.last_login)}
                        </td>
                        <td className="px-5 py-4 text-right space-x-1.5">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <MagnifyingGlassIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          {!isCurrentUser && (
                            <button
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400 text-sm">
                      No users match your filters
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