import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  LanguageIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  CameraIcon,
  ArrowUpTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';



const AdminSettings = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const [activeTab, setActiveTab] = useState('profile');



  const { user, refreshUserData } = useAuth();
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@kahaniland.com',
    role: user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Administrator',
    bio: 'Managing KahaniLand stories and content',
    avatar: user?.profile_image || localStorage.getItem('admin_avatar') || '',
  });

  // Sync profile data when auth user changes
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        role: user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : prev.role,
        avatar: user.profile_image || localStorage.getItem('admin_avatar') || prev.avatar,
      }));
    } else {
      const saved = localStorage.getItem('admin_avatar');
      if (saved) {
        setProfileData((prev) => ({ ...prev, avatar: saved }));
      }
    }
  }, [user]);



  // Password Settings

  const [passwordData, setPasswordData] = useState({

    currentPassword: '',

    newPassword: '',

    confirmPassword: '',

  });



  // Notification Settings

  const [notificationSettings, setNotificationSettings] = useState({

    emailNotifications: true,

    storyAlerts: true,

    videoAlerts: true,

    contactAlerts: true,

    newsletterAlerts: false,

    systemUpdates: true,

  });



  // Appearance Settings

  const [appearanceSettings, setAppearanceSettings] = useState({

    theme: 'light',

    sidebarCollapsed: false,

    fontSize: 'medium',

  });



  // Language Settings

  const [languageSettings, setLanguageSettings] = useState({

    language: 'en',

    dateFormat: 'MM/DD/YYYY',

    timezone: 'UTC+5:30',

  });



  const [isEditing, setIsEditing] = useState(false);

  const [editProfileData, setEditProfileData] = useState({});



  const showNotification = (type, message) => {

    setNotification({ show: true, type, message });

    setTimeout(() => {

      setNotification({ show: false, type: '', message: '' });

    }, 3000);

  };



  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please select a valid image file (PNG, JPG, JPEG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'Image size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;

        // Instant local persistence
        localStorage.setItem('admin_avatar', base64Data);
        setProfileData((prev) => ({ ...prev, avatar: base64Data }));
        setEditProfileData((prev) => ({ ...prev, avatar: base64Data }));

        // Save to backend database
        try {
          await api.put('/auth/profile', {
            name: profileData.name,
            profile_image: base64Data,
          });
          if (refreshUserData) await refreshUserData();
        } catch (apiErr) {
          console.warn('Backend profile update note:', apiErr.message);
        }

        showNotification('success', 'Profile photo updated successfully!');
        setUploadingPhoto(false);
      };

      reader.onerror = () => {
        showNotification('error', 'Failed to read the selected photo');
        setUploadingPhoto(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to upload photo');
      setUploadingPhoto(false);
    }
  };

  // Handle photo removal
  const handleRemovePhoto = async () => {
    localStorage.removeItem('admin_avatar');
    setProfileData((prev) => ({ ...prev, avatar: '' }));
    setEditProfileData((prev) => ({ ...prev, avatar: '' }));

    try {
      await api.put('/auth/profile', {
        name: profileData.name,
        profile_image: null,
      });
      if (refreshUserData) await refreshUserData();
    } catch (_) {}

    showNotification('success', 'Profile photo removed');
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      // Simulate API call

      await new Promise(resolve => setTimeout(resolve, 1500));

      setProfileData(editProfileData);

      setIsEditing(false);

      showNotification('success', 'Profile updated successfully!');

    } catch  {

      showNotification('error', 'Failed to update profile');

    } finally {

      setLoading(false);

    }

  };



  // Handle password update

  const handlePasswordUpdate = async (e) => {

    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {

      showNotification('error', 'Passwords do not match');

      return;

    }

    if (passwordData.newPassword.length < 6) {

      showNotification('error', 'Password must be at least 6 characters');

      return;

    }

    setLoading(true);

    try {

      await new Promise(resolve => setTimeout(resolve, 1500));

      setPasswordData({

        currentPassword: '',

        newPassword: '',

        confirmPassword: '',

      });

      showNotification('success', 'Password updated successfully!');

    } catch  {

      showNotification('error', 'Failed to update password');

    } finally {

      setLoading(false);

    }

  };



  // Handle notification settings update

  const handleNotificationUpdate = async () => {

    setLoading(true);

    try {

      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification('success', 'Notification settings updated!');

    } catch {

      showNotification('error', 'Failed to update settings');

    } finally {

      setLoading(false);

    }

  };



  // Handle appearance update

  const handleAppearanceUpdate = async () => {

    setLoading(true);

    try {

      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification('success', 'Appearance settings updated!');

    } catch  {

      showNotification('error', 'Failed to update settings');

    } finally {

      setLoading(false);

    }

  };



  // Handle language update

  const handleLanguageUpdate = async () => {

    setLoading(true);

    try {

      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification('success', 'Language settings updated!');

    } catch  {

      showNotification('error', 'Failed to update settings');

    } finally {

      setLoading(false);

    }

  };



  const tabs = [

    { id: 'profile', label: 'Profile', icon: UserIcon },

    { id: 'security', label: 'Security', icon: ShieldCheckIcon },

    { id: 'notifications', label: 'Notifications', icon: BellIcon },

    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },

    { id: 'language', label: 'Language', icon: LanguageIcon },

  ];



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

      <div className="flex items-center gap-4">

        <button

          onClick={() => navigate('/admin')}

          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"

        >

          <ArrowLeftIcon className="w-6 h-6" />

        </button>

        <div>

          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>

          <p className="text-gray-500 mt-1">Manage your account and preferences</p>

        </div>

      </div>



      {/* Tabs */}

      <div className="border-b border-gray-200">

        <nav className="flex space-x-8 overflow-x-auto">

          {tabs.map((tab) => {

            const Icon = tab.icon;

            return (

              <button

                key={tab.id}

                onClick={() => setActiveTab(tab.id)}

                className={`

                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap

                  ${activeTab === tab.id 

                    ? 'border-green-500 text-green-600' 

                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'

                  }

                `}

              >

                <Icon className="w-5 h-5" />

                {tab.label}

              </button>

            );

          })}

        </nav>

      </div>



      {/* Tab Content */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

        {/* Profile Tab */}

        {activeTab === 'profile' && (

          <div>

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-xl font-bold text-gray-800">Profile Settings</h2>

              {!isEditing && (

                <button

                  onClick={() => {

                    setEditProfileData(profileData);

                    setIsEditing(true);

                  }}

                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"

                >

                  <PencilIcon className="w-5 h-5" />

                  Edit Profile

                </button>

              )}

            </div>



            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              {/* Avatar Image / Initial with Camera Badge */}
              <div className="relative group flex-shrink-0">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md shadow-emerald-600/10"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md border-4 border-white">
                    {profileData.name.charAt(0)}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md border-2 border-white transition-transform hover:scale-110 focus:outline-none"
                  title="Upload a photo"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Details & Upload Action Buttons */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-800 truncate">{profileData.name}</h3>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full capitalize">
                    {profileData.role}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-3.5 truncate">{profileData.email}</p>

                {/* Upload Action Group */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                    <span>{uploadingPhoto ? 'Uploading...' : 'Upload a photo'}</span>
                  </button>

                  {profileData.avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploadingPhoto}
                      className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}

                  <span className="text-[11px] text-gray-400">
                    JPG, PNG, GIF or WEBP (Max 5MB)
                  </span>
                </div>
              </div>
            </div>



            {isEditing ? (

              <form onSubmit={handleProfileUpdate} className="space-y-4">

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    Full Name

                  </label>

                  <input

                    type="text"

                    value={editProfileData.name || ''}

                    onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                    required

                  />

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    Email Address

                  </label>

                  <input

                    type="email"

                    value={editProfileData.email || ''}

                    onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                    required

                  />

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    Bio

                  </label>

                  <textarea

                    value={editProfileData.bio || ''}

                    onChange={(e) => setEditProfileData({ ...editProfileData, bio: e.target.value })}

                    rows="3"

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                    placeholder="Tell us about yourself"

                  />

                </div>



                <div className="flex justify-end gap-3 pt-4 border-t">

                  <button

                    type="button"

                    onClick={() => {

                      setIsEditing(false);

                      setEditProfileData(profileData);

                    }}

                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"

                  >

                    Cancel

                  </button>

                  <button

                    type="submit"

                    disabled={loading}

                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"

                  >

                    {loading ? (

                      <span className="flex items-center gap-2">

                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                        Saving...

                      </span>

                    ) : (

                      <>

                        <CheckCircleIcon className="w-5 h-5" />

                        Save Changes

                      </>

                    )}

                  </button>

                </div>

              </form>

            ) : (

              <div className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>

                    <label className="block text-sm font-medium text-gray-500">Full Name</label>

                    <p className="text-gray-800">{profileData.name}</p>

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-500">Email</label>

                    <p className="text-gray-800">{profileData.email}</p>

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-500">Role</label>

                    <p className="text-gray-800">{profileData.role}</p>

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-500">Bio</label>

                    <p className="text-gray-800">{profileData.bio || 'No bio added'}</p>

                  </div>

                </div>

              </div>

            )}

          </div>

        )}



        {/* Security Tab */}

        {activeTab === 'security' && (

          <div>

            <h2 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h2>

            

            <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-4">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">

                  Current Password

                </label>

                <div className="relative">

                  <input

                    type={showPassword ? 'text' : 'password'}

                    value={passwordData.currentPassword}

                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"

                    required

                  />

                  <button

                    type="button"

                    onClick={() => setShowPassword(!showPassword)}

                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"

                  >

                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}

                  </button>

                </div>

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">

                  New Password

                </label>

                <input

                  type={showPassword ? 'text' : 'password'}

                  value={passwordData.newPassword}

                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                  required

                  minLength="6"

                />

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">

                  Confirm New Password

                </label>

                <input

                  type={showPassword ? 'text' : 'password'}

                  value={passwordData.confirmPassword}

                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                  required

                />

              </div>



              <div className="pt-4">

                <button

                  type="submit"

                  disabled={loading}

                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"

                >

                  {loading ? (

                    <span className="flex items-center gap-2">

                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                      Updating...

                    </span>

                  ) : (

                    <>

                      <KeyIcon className="w-5 h-5" />

                      Update Password

                    </>

                  )}

                </button>

              </div>

            </form>



            <div className="mt-8 pt-8 border-t">

              <h3 className="text-lg font-bold text-gray-800 mb-4">Two-Factor Authentication</h3>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">

                <div>

                  <p className="font-medium text-gray-800">2FA Status</p>

                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>

                </div>

                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">

                  Enable 2FA

                </button>

              </div>

            </div>

          </div>

        )}



        {/* Notifications Tab */}

        {activeTab === 'notifications' && (

          <div>

            <h2 className="text-xl font-bold text-gray-800 mb-6">Notification Preferences</h2>

            

            <div className="space-y-4">

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">

                <div>

                  <p className="font-medium text-gray-800">Email Notifications</p>

                  <p className="text-sm text-gray-500">Receive notifications via email</p>

                </div>

                <label className="relative inline-flex items-center cursor-pointer">

                  <input

                    type="checkbox"

                    checked={notificationSettings.emailNotifications}

                    onChange={() => setNotificationSettings({

                      ...notificationSettings,

                      emailNotifications: !notificationSettings.emailNotifications

                    })}

                    className="sr-only peer"

                  />

                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>

                </label>

              </div>



              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">

                <div>

                  <p className="font-medium text-gray-800">Story Alerts</p>

                  <p className="text-sm text-gray-500">Get notified when new stories are added</p>

                </div>

                <label className="relative inline-flex items-center cursor-pointer">

                  <input

                    type="checkbox"

                    checked={notificationSettings.storyAlerts}

                    onChange={() => setNotificationSettings({

                      ...notificationSettings,

                      storyAlerts: !notificationSettings.storyAlerts

                    })}

                    className="sr-only peer"

                  />

                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>

                </label>

              </div>



              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">

                <div>

                  <p className="font-medium text-gray-800">Video Alerts</p>

                  <p className="text-sm text-gray-500">Get notified when new videos are uploaded</p>

                </div>

                <label className="relative inline-flex items-center cursor-pointer">

                  <input

                    type="checkbox"

                    checked={notificationSettings.videoAlerts}

                    onChange={() => setNotificationSettings({

                      ...notificationSettings,

                      videoAlerts: !notificationSettings.videoAlerts

                    })}

                    className="sr-only peer"

                  />

                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>

                </label>

              </div>



              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">

                <div>

                  <p className="font-medium text-gray-800">Contact Messages</p>

                  <p className="text-sm text-gray-500">Get notified when new contact messages arrive</p>

                </div>

                <label className="relative inline-flex items-center cursor-pointer">

                  <input

                    type="checkbox"

                    checked={notificationSettings.contactAlerts}

                    onChange={() => setNotificationSettings({

                      ...notificationSettings,

                      contactAlerts: !notificationSettings.contactAlerts

                    })}

                    className="sr-only peer"

                  />

                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>

                </label>

              </div>



              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">

                <div>

                  <p className="font-medium text-gray-800">Newsletter Alerts</p>

                  <p className="text-sm text-gray-500">Get notified about newsletter subscribers</p>

                </div>

                <label className="relative inline-flex items-center cursor-pointer">

                  <input

                    type="checkbox"

                    checked={notificationSettings.newsletterAlerts}

                    onChange={() => setNotificationSettings({

                      ...notificationSettings,

                      newsletterAlerts: !notificationSettings.newsletterAlerts

                    })}

                    className="sr-only peer"

                  />

                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>

                </label>

              </div>



              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">

                <div>

                  <p className="font-medium text-gray-800">System Updates</p>

                  <p className="text-sm text-gray-500">Get notified about system updates and maintenance</p>

                </div>

                <label className="relative inline-flex items-center cursor-pointer">

                  <input

                    type="checkbox"

                    checked={notificationSettings.systemUpdates}

                    onChange={() => setNotificationSettings({

                      ...notificationSettings,

                      systemUpdates: !notificationSettings.systemUpdates

                    })}

                    className="sr-only peer"

                  />

                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>

                </label>

              </div>

            </div>



            <div className="mt-6 pt-6 border-t">

              <button

                onClick={handleNotificationUpdate}

                disabled={loading}

                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"

              >

                {loading ? (

                  <span className="flex items-center gap-2">

                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                    Saving...

                  </span>

                ) : (

                  <>

                    <CheckCircleIcon className="w-5 h-5" />

                    Save Notification Settings

                  </>

                )}

              </button>

            </div>

          </div>

        )}



        {/* Appearance Tab */}

        {activeTab === 'appearance' && (

          <div>

            <h2 className="text-xl font-bold text-gray-800 mb-6">Appearance Settings</h2>

            

            <div className="space-y-4">

              <div className="p-4 bg-gray-50 rounded-lg">

                <label className="block text-sm font-medium text-gray-700 mb-2">

                  Theme

                </label>

                <div className="flex gap-4">

                  {['light', 'dark', 'system'].map((theme) => (

                    <button

                      key={theme}

                      onClick={() => setAppearanceSettings({ ...appearanceSettings, theme })}

                      className={`px-4 py-2 rounded-lg capitalize transition-colors ${

                        appearanceSettings.theme === theme

                          ? 'bg-green-500 text-white'

                          : 'bg-white border border-gray-300 hover:bg-gray-50'

                      }`}

                    >

                      {theme}

                    </button>

                  ))}

                </div>

              </div>



              <div className="p-4 bg-gray-50 rounded-lg">

                <label className="block text-sm font-medium text-gray-700 mb-2">

                  Sidebar

                </label>

                <button

                  onClick={() => setAppearanceSettings({

                    ...appearanceSettings,

                    sidebarCollapsed: !appearanceSettings.sidebarCollapsed

                  })}

                  className={`px-4 py-2 rounded-lg transition-colors ${

                    appearanceSettings.sidebarCollapsed

                      ? 'bg-green-500 text-white'

                      : 'bg-white border border-gray-300 hover:bg-gray-50'

                  }`}

                >

                  {appearanceSettings.sidebarCollapsed ? 'Collapsed' : 'Expanded'}

                </button>

              </div>



              <div className="p-4 bg-gray-50 rounded-lg">

                <label className="block text-sm font-medium text-gray-700 mb-2">

                  Font Size

                </label>

                <div className="flex gap-4">

                  {['small', 'medium', 'large'].map((size) => (

                    <button

                      key={size}

                      onClick={() => setAppearanceSettings({ ...appearanceSettings, fontSize: size })}

                      className={`px-4 py-2 rounded-lg capitalize transition-colors ${

                        appearanceSettings.fontSize === size

                          ? 'bg-green-500 text-white'

                          : 'bg-white border border-gray-300 hover:bg-gray-50'

                      }`}

                    >

                      {size}

                    </button>

                  ))}

                </div>

              </div>

            </div>



            <div className="mt-6 pt-6 border-t">

              <button

                onClick={handleAppearanceUpdate}

                disabled={loading}

                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"

              >

                {loading ? (

                  <span className="flex items-center gap-2">

                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                    Saving...

                  </span>

                ) : (

                  <>

                    <CheckCircleIcon className="w-5 h-5" />

                    Save Appearance Settings

                  </>

                )}

              </button>

            </div>

          </div>

        )}



        {/* Language Tab */}

        {activeTab === 'language' && (

          <div>

            <h2 className="text-xl font-bold text-gray-800 mb-6">Language & Region</h2>

            

            <div className="space-y-4 max-w-md">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">

                  Language

                </label>

                <select

                  value={languageSettings.language}

                  onChange={(e) => setLanguageSettings({ ...languageSettings, language: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                >

                  <option value="en">English</option>

                  <option value="hi">Hindi</option>

                  <option value="es">Spanish</option>

                  <option value="fr">French</option>

                  <option value="de">German</option>

                </select>

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">

                  Date Format

                </label>

                <select

                  value={languageSettings.dateFormat}

                  onChange={(e) => setLanguageSettings({ ...languageSettings, dateFormat: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                >

                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>

                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>

                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>

                </select>

              </div>



              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">

                  Timezone

                </label>

                <select

                  value={languageSettings.timezone}

                  onChange={(e) => setLanguageSettings({ ...languageSettings, timezone: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                >

                  <option value="UTC+5:30">UTC+5:30 (India)</option>

                  <option value="UTC+0">UTC+0 (London)</option>

                  <option value="UTC-5">UTC-5 (New York)</option>

                  <option value="UTC+8">UTC+8 (Singapore)</option>

                  <option value="UTC-8">UTC-8 (Los Angeles)</option>

                </select>

              </div>

            </div>



            <div className="mt-6 pt-6 border-t">

              <button

                onClick={handleLanguageUpdate}

                disabled={loading}

                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"

              >

                {loading ? (

                  <span className="flex items-center gap-2">

                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                    Saving...

                  </span>

                ) : (

                  <>

                    <CheckCircleIcon className="w-5 h-5" />

                    Save Language Settings

                  </>

                )}

              </button>

            </div>

          </div>

        )}

      </div>

    </div>

  );

};



export default AdminSettings;
