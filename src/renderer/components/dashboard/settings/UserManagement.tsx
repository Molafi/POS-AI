import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

interface UserData {
  id: string;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface UserManagementProps {
  onSave: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onSave }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('cashier');
  const [newPin, setNewPin] = useState('');

  const fetchUsers = async () => {
    const response = await api.get<UserData[]>('/settings/users');
    if (response.success && response.data) {
      setUsers(response.data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async () => {
    if (!newUsername || !newName) return;

    await api.post('/settings/users', {
      username: newUsername,
      name: newName,
      role: newRole,
      pin: newPin,
    });

    setNewUsername('');
    setNewName('');
    setNewRole('cashier');
    setNewPin('');
    setShowAdd(false);
    fetchUsers();
    onSave();
  };

  const deleteUser = async (id: string) => {
    await api.delete(`/settings/users/${id}`);
    fetchUsers();
    onSave();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-heading font-semibold text-apex-text-primary">User Management</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1.5 bg-apex-accent text-white rounded-lg text-xs font-medium hover:bg-apex-accent-hover transition-colors"
        >
          + Add User
        </button>
      </div>

      {showAdd && (
        <div className="p-4 bg-apex-elevated/50 border border-apex-border rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-apex-text-muted">Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="mt-1 w-full px-3 py-1.5 bg-apex-elevated border border-apex-border rounded text-sm text-apex-text-primary focus:border-apex-accent outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-apex-text-muted">Full Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1 w-full px-3 py-1.5 bg-apex-elevated border border-apex-border rounded text-sm text-apex-text-primary focus:border-apex-accent outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-apex-text-muted">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="mt-1 w-full px-3 py-1.5 bg-apex-elevated border border-apex-border rounded text-sm text-apex-text-primary focus:border-apex-accent outline-none"
              >
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-apex-text-muted">PIN (4 digits)</label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="mt-1 w-full px-3 py-1.5 bg-apex-elevated border border-apex-border rounded text-sm text-apex-text-primary focus:border-apex-accent outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addUser} className="px-3 py-1.5 bg-apex-accent text-white rounded text-xs font-medium">
              Save
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 bg-apex-elevated text-apex-text-secondary rounded text-xs">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="border border-apex-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-apex-elevated/50 text-apex-text-secondary border-b border-apex-border">
              <th className="px-4 py-2.5 text-left font-medium">Name</th>
              <th className="px-4 py-2.5 text-left font-medium">Username</th>
              <th className="px-4 py-2.5 text-center font-medium">Role</th>
              <th className="px-4 py-2.5 text-center font-medium">Status</th>
              <th className="px-4 py-2.5 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-apex-border/50">
                <td className="px-4 py-2.5 font-medium">{user.name}</td>
                <td className="px-4 py-2.5 text-apex-text-secondary">{user.username}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-apex-accent/10 text-apex-accent capitalize">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${user.isActive ? 'bg-apex-success/10 text-apex-success' : 'bg-apex-text-muted/10 text-apex-text-muted'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-apex-danger/60 hover:text-apex-danger text-xs transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-apex-text-muted">No users configured</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
