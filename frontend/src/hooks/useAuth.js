// import { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";

// /**
//  * Custom hook to access authentication context
//  * @returns {Object} Auth context value containing user, login, logout, etc.
//  * @throws {Error} If used outside of AuthProvider
//  */
// export const useAuth = () => {
//   const context = useContext(AuthContext);
  
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
  
//   return context;
// };

// // Optional: You can also export specific hooks for more granular control

// /**
//  * Hook to get current user with role checks
//  * @returns {Object} User object with convenient role checking methods
//  */
// export const useCurrentUser = () => {
//   const { user, isAuthenticated } = useAuth();
  
//   return {
//     user,
//     isAuthenticated,
//     isAdmin: user?.role === "admin" || user?.role === "superadmin",
//     isSuperAdmin: user?.role === "superadmin",
//     isUser: user?.role === "user",
//     isActive: user?.status === "active",
//   };
// };

// /**
//  * Hook to get authentication actions
//  * @returns {Object} Authentication action methods
//  */
// export const useAuthActions = () => {
//   const { login, register, logout, updateProfile, changePassword } = useAuth();
  
//   return {
//     login,
//     register,
//     logout,
//     updateProfile,
//     changePassword,
//   };
// };

// /**
//  * Hook to check if user has specific role
//  * @param {string|string[]} roles - Role or array of roles to check
//  * @returns {boolean} True if user has any of the specified roles
//  */
// export const useHasRole = (roles) => {
//   const { user } = useAuth();
  
//   if (!user) return false;
  
//   if (Array.isArray(roles)) {
//     return roles.includes(user.role);
//   }
  
//   return user.role === roles;
// };

// /**
//  * Hook to check permission for specific action
//  * @param {Object} options - Permission options
//  * @param {string} options.minimumRole - Minimum role required
//  * @param {string} options.userId - User ID to check ownership
//  * @returns {Object} Permission check results
//  */
// export const usePermission = (options = {}) => {
//   const { user } = useAuth();
//   const { minimumRole, userId } = options;
  
//   const hasMinimumRole = () => {
//     if (!user) return false;
    
//     const roleHierarchy = {
//       user: 0,
//       admin: 1,
//       superadmin: 2,
//     };
    
//     const userRoleLevel = roleHierarchy[user.role] ?? -1;
//     const requiredLevel = roleHierarchy[minimumRole] ?? -1;
    
//     return userRoleLevel >= requiredLevel;
//   };
  
//   const isOwner = () => {
//     if (!user || !userId) return false;
//     return user.id === userId;
//   };
  
//   const canEdit = () => {
//     // SuperAdmin can edit anything
//     if (user?.role === "superadmin") return true;
    
//     // Admin can edit non-superadmin content
//     if (user?.role === "admin") {
//       // If userId is provided, check ownership
//       if (userId) return isOwner();
//       return true;
//     }
    
//     // Regular users can only edit their own content
//     if (userId) return isOwner();
//     return false;
//   };
  
//   const canDelete = () => {
//     // SuperAdmin can delete anything
//     if (user?.role === "superadmin") return true;
    
//     // Admin can delete non-superadmin content
//     if (user?.role === "admin") {
//       // If userId is provided, check ownership
//       if (userId) return isOwner();
//       return true;
//     }
    
//     // Regular users can only delete their own content
//     if (userId) return isOwner();
//     return false;
//   };
  
//   return {
//     hasMinimumRole: hasMinimumRole(),
//     isOwner: isOwner(),
//     canEdit: canEdit(),
//     canDelete: canDelete(),
//   };
// };

// src/hooks/useAuth.js

// ✅ Import from AuthContext.jsx
import { useAuth } from "../context/AuthContext";

// Re-export the hook for convenience
export { useAuth };

// Or if you want to keep the same structure:
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };