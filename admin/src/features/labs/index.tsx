'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface Lab {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'suspended';
  commercialRegistration: string;
  commissionRate: number;
  integrationActive: boolean;
  createdAt: string;
}

interface CreateAccountForm { email: string; password: string; labId: string; labName: string }

const STATUS_CYCLE: Record<Lab['status'], Lab['status']> = {
  pending: 'active',
  active: 'suspended',
  suspended: 'active',
};

const STATUS_LABEL: Record<Lab['status'], string> = {
  pending: 'Activate',
  active: 'Suspend',
  suspended: 'Reactivate',
};

const STATUS_COLOR: Record<Lab['status'], string> = {
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

export function LabsManagement() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [commercialReg, setCommercialReg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState<CreateAccountForm | null>(null);
  const [accEmail, setAccEmail] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accSubmitting, setAccSubmitting] = useState(false);
  const [accError, setAccError] = useState('');
  const [accSuccess, setAccSuccess] = useState('');

  const fetchLabs = () => {
    setLoading(true);
    apiClient
      .get('/admin/labs')
      .then((r) => {
        const payload = r.data;
        const list: Lab[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        setLabs(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLabs(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Lab name is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post('/admin/labs', {
        name: name.trim(),
        commercialRegistration: commercialReg.trim(),
      });
      setName('');
      setCommercialReg('');
      setShowForm(false);
      fetchLabs();
    } catch {
      setError('Failed to create lab');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm) return;
    setAccSubmitting(true);
    setAccError('');
    setAccSuccess('');
    try {
      await apiClient.post(`/admin/labs/${accountForm.labId}/users`, {
        email: accEmail.trim(),
        password: accPassword,
      });
      setAccSuccess(`Account created: ${accEmail}`);
      setAccEmail('');
      setAccPassword('');
    } catch {
      setAccError('Failed to create account');
    } finally {
      setAccSubmitting(false);
    }
  };

  const handleStatusChange = async (lab: Lab) => {
    const next = STATUS_CYCLE[lab.status];
    setUpdatingId(lab.id);
    try {
      await apiClient.patch(`/admin/labs/${lab.id}/status`, { status: next });
      setLabs((prev) => prev.map((l) => l.id === lab.id ? { ...l, status: next } : l));
    } catch {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading labs...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lab Partner Management</h1>
        <button
          onClick={() => { setShowForm(true); setError(''); }}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Create Lab
        </button>
      </div>

      {/* Create Lab Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create New Lab</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lab name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commercial Registration</label>
                <input
                  type="text"
                  value={commercialReg}
                  onChange={(e) => setCommercialReg(e.target.value)}
                  placeholder="Registration number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50 hover:opacity-90"
                >
                  {submitting ? 'Creating…' : 'Create Lab'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Lab Account Modal */}
      {accountForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-1">Create Lab Account</h2>
            <p className="text-sm text-gray-500 mb-4">
              Lab staff login for <strong>{accountForm.labName}</strong>
            </p>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={accEmail}
                  onChange={(e) => setAccEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={accPassword}
                  onChange={(e) => setAccPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {accError && <p className="text-red-500 text-sm">{accError}</p>}
              {accSuccess && <p className="text-green-600 text-sm">{accSuccess}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={accSubmitting}
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50 hover:opacity-90"
                >
                  {accSubmitting ? 'Creating…' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setAccountForm(null)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Lab Name</th>
              <th className="px-4 py-3 text-left">Reg. No.</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Commission</th>
              <th className="px-4 py-3 text-left">Integration</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {labs.map((lab) => (
              <tr key={lab.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{lab.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{lab.commercialRegistration || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[lab.status]}`}>
                    {lab.status}
                  </span>
                </td>
                <td className="px-4 py-3">{lab.commissionRate}%</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${lab.integrationActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {lab.integrationActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(lab.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(lab)}
                      disabled={updatingId === lab.id}
                      className="px-3 py-1 rounded-lg border border-gray-300 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                      {updatingId === lab.id ? '…' : STATUS_LABEL[lab.status]}
                    </button>
                    <button
                      onClick={() => { setAccountForm({ labId: lab.id, labName: lab.name, email: '', password: '' }); setAccEmail(''); setAccPassword(''); setAccError(''); setAccSuccess(''); }}
                      className="px-3 py-1 rounded-lg border border-blue-300 text-blue-700 text-xs font-medium hover:bg-blue-50"
                    >
                      Create Account
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {labs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No labs registered yet. Click the Create Lab button to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
