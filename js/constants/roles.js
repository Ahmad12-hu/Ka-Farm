// KA Farm - Role Constants
// Centralized role definitions to ensure consistency across the application

// User roles (for authentication and RBAC)
export const USER_ROLES = {
  TERRAIN: "Terrain",
  BUREAU: "Bureau",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

// All valid user roles
export const ALL_USER_ROLES = [
  USER_ROLES.TERRAIN,
  USER_ROLES.BUREAU,
  USER_ROLES.ADMIN,
  USER_ROLES.SUPER_ADMIN,
];

// Employee roles (job positions in the farm)
export const EMPLOYEE_ROLES = [
  "Ouvrier agricole",
  "Chef d'Exploitation",
  "Chef d'équipe pépinière",
  "Ouvrière Maraîchère",
  "Technicien Irrigation",
  "Arroseur principal",
  "Maraîcher",
  "Maraîchère",
  "Responsable Stocks",
  "Responsable terrain",
];

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.TERRAIN]: {
    canEditCrops: true,
    canEditFinances: false,
    canEnterSales: true,
    canManageTasks: true,
    canManageEmployees: false,
    canManageStocks: false,
    canViewFinances: true,
    canViewEmployees: true,
    canManageHarvests: true,
  },
  [USER_ROLES.BUREAU]: {
    canEditCrops: true,
    canEditFinances: true,
    canEnterSales: true,
    canManageTasks: true,
    canManageEmployees: true,
    canManageStocks: true,
    canViewFinances: true,
    canViewEmployees: true,
    canManageHarvests: true,
  },
  [USER_ROLES.ADMIN]: {
    canEditCrops: true,
    canEditFinances: true,
    canEnterSales: true,
    canManageTasks: true,
    canManageEmployees: true,
    canManageStocks: true,
    canViewFinances: true,
    canViewEmployees: true,
    canManageHarvests: true,
    isAdmin: true,
  },
  [USER_ROLES.SUPER_ADMIN]: {
    canEditCrops: true,
    canEditFinances: true,
    canEnterSales: true,
    canManageTasks: true,
    canManageEmployees: true,
    canManageStocks: true,
    canViewFinances: true,
    canViewEmployees: true,
    canManageHarvests: true,
    isAdmin: true,
  },
};

// Helper function to check if a role is valid
export function isValidUserRole(role) {
  return ALL_USER_ROLES.includes(role);
}

// Helper function to check if user is admin
export function isAdminRole(role) {
  return role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN;
}
