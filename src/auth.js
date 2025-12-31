// Simple auth and role management (renderer side)
export const Roles = {
  ADMIN: 'Administrator',
  SUPERVISOR: 'Supervisor',
  CASHIER: 'Cashier',
};

// In a real app, you would verify credentials against the DB.
// Here we provide a mock login function for UI demonstration.
export function login(username, password) {
  // Mock users
  const users = {
    admin: { role: Roles.ADMIN },
    supervisor: { role: Roles.SUPERVISOR },
    cashier: { role: Roles.CASHIER },
  };
  if (users[username]) {
    // No password check for demo purposes
    return { username, role: users[username].role };
  }
  return null;
}
