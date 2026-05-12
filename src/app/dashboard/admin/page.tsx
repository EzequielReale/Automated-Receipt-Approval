'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../../../lib/types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icons } from '../../../components/ui/Icons';
import { Badge } from '../../../components/ui/Badge';
import { Select } from '../../../components/ui/Select';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'EMPLOYEE' as UserRole });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const { data } = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchUsers();
    };
    load();
  }, [fetchUsers]);

  const handleOpenModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ email: user.email, password: '', role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ email: '', password: '', role: 'EMPLOYEE' });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = editingUser ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save user');

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      } else {
        const json = await res.json();
        alert(json.error || 'Failed to delete user');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-red-100 rounded-xl">
            <Icons.User className="w-8 h-8 text-red-600" />
          </div>
          User Management
        </h2>
        <Button 
          onClick={() => handleOpenModal()} 
          variant="primary"
          leftIcon={<Icons.Check className="w-5 h-5" />}
          className="shadow-lg shadow-blue-200"
        >
          Add New User
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden shadow-2xl border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">User Email</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'REVIEWER' ? 'warning' : 'success'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenModal(user)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Icons.Edit className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Icons.Trash className="w-5 h-5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all">
                <Icons.Cancel className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
              
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  Password {editingUser && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  required={!editingUser}
                />
              </div>

              <Select
                label="Assigned Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                options={[
                  { value: 'EMPLOYEE', label: 'Employee' },
                  { value: 'REVIEWER', label: 'Reviewer' },
                  { value: 'ADMIN', label: 'Administrator' },
                ]}
                className="font-bold"
              />

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  loading={isLoading} 
                  className="flex-[2] py-3 text-lg font-bold shadow-lg shadow-blue-200"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
