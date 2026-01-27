import React, { useEffect, useState } from 'react';
import {
    Shield,
    Users,
    DollarSign,
    TrendingUp,
    Video,
    Crown,
    Search,
    RefreshCw,
    Loader2,
    ChevronLeft,
    Edit,
    Trash2,
    X,
    Save
} from 'lucide-react';
import {
    getAdminStats,
    getAllUsers,
    getAllEarnings,
    updateUserSubscription,
    deleteUser,
    AdminStats,
    UserWithProfile,
    EarningsRecord
} from '../services/adminService';

interface Props {
    onBack: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onBack }) => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<UserWithProfile[]>([]);
    const [earnings, setEarnings] = useState<EarningsRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTier, setFilterTier] = useState<'all' | 'free' | 'premium'>('all');

    // User management state
    const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editCredits, setEditCredits] = useState(0);
    const [editTier, setEditTier] = useState<'free' | 'premium'>('free');
    const [selectedBundle, setSelectedBundle] = useState<string>('custom');
    const [actionLoading, setActionLoading] = useState(false);

    // Credit bundles
    const creditBundles = [
        { id: 'starter', name: '🟢 Starter', credits: 500, price: 60 },
        { id: 'pro', name: '🔵 Pro', credits: 1500, price: 180 },
        { id: 'growth', name: '🟣 Growth', credits: 3000, price: 360 },
        { id: 'agency', name: '🔴 Agency', credits: 6000, price: 720 },
        { id: 'custom', name: 'Custom Amount', credits: 0, price: 0 }
    ];

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsData, usersData, earningsData] = await Promise.all([
                getAdminStats(),
                getAllUsers(),
                getAllEarnings()
            ]);

            setStats(statsData);
            setUsers(usersData);
            setEarnings(earningsData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTier = filterTier === 'all' || user.subscription_tier === filterTier;
        return matchesSearch && matchesTier;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleEditUser = (user: UserWithProfile) => {
        setSelectedUser(user);
        setEditCredits(user.credits);
        setEditTier(user.subscription_tier);
        setSelectedBundle('custom');
        setShowEditModal(true);
    };

    const handleBundleChange = (bundleId: string) => {
        setSelectedBundle(bundleId);
        const bundle = creditBundles.find(b => b.id === bundleId);
        if (bundle && bundleId !== 'custom') {
            setEditCredits(bundle.credits);
            setEditTier('premium');
        }
    };

    const handleDeleteUser = (user: UserWithProfile) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const confirmEdit = async () => {
        if (!selectedUser) return;
        setActionLoading(true);

        const success = await updateUserSubscription(selectedUser.id, editTier, editCredits);

        if (success) {
            await loadDashboardData();
            setShowEditModal(false);
            setSelectedUser(null);
        } else {
            alert('Failed to update user');
        }

        setActionLoading(false);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;
        setActionLoading(true);

        const success = await deleteUser(selectedUser.id);

        if (success) {
            await loadDashboardData();
            setShowDeleteModal(false);
            setSelectedUser(null);
        } else {
            alert('Failed to delete user');
        }

        setActionLoading(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Admin Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shrink-0"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Back</span>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                <Shield className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />
                                <span className="text-[10px] md:text-xs font-black text-indigo-500 uppercase tracking-widest">Admin Control Panel</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tight">
                                VIRAL<span className="text-slate-600">LINK</span> DASHBOARD
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={loadDashboardData}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="font-bold uppercase tracking-widest hidden sm:inline">Refresh</span>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Total Users */}
                    <div className="glass-card rounded-3xl p-1 border-white/5">
                        <div className="bg-slate-950/40 rounded-[1.4rem] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-indigo-500/10 rounded-xl">
                                    <Users className="w-6 h-6 text-indigo-400" />
                                </div>
                                <span className="text-3xl font-black">{stats?.total_users || 0}</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Users</h3>
                        </div>
                    </div>

                    {/* Premium Users */}
                    <div className="glass-card rounded-3xl p-1 border-white/5">
                        <div className="bg-slate-950/40 rounded-[1.4rem] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl">
                                    <Crown className="w-6 h-6 text-purple-400" />
                                </div>
                                <span className="text-3xl font-black">{stats?.premium_users || 0}</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Premium Users</h3>
                        </div>
                    </div>

                    {/* Total Earnings */}
                    <div className="glass-card rounded-3xl p-1 border-white/5">
                        <div className="bg-slate-950/40 rounded-[1.4rem] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-500/10 rounded-xl">
                                    <DollarSign className="w-6 h-6 text-green-400" />
                                </div>
                                <span className="text-3xl font-black">{formatCurrency(stats?.total_earnings || 0)}</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Earnings</h3>
                        </div>
                    </div>

                    {/* Monthly Earnings */}
                    <div className="glass-card rounded-3xl p-1 border-white/5">
                        <div className="bg-slate-950/40 rounded-[1.4rem] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                                </div>
                                <span className="text-3xl font-black">{formatCurrency(stats?.earnings_this_month || 0)}</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">This Month</h3>
                        </div>
                    </div>

                    {/* Videos Generated */}
                    <div className="glass-card rounded-3xl p-1 border-white/5">
                        <div className="bg-slate-950/40 rounded-[1.4rem] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-pink-500/10 rounded-xl">
                                    <Video className="w-6 h-6 text-pink-400" />
                                </div>
                                <span className="text-3xl font-black">{stats?.total_videos_generated || 0}</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Videos Created</h3>
                        </div>
                    </div>

                    {/* Free Users */}
                    <div className="glass-card rounded-3xl p-1 border-white/5">
                        <div className="bg-slate-950/40 rounded-[1.4rem] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-slate-500/10 rounded-xl">
                                    <Users className="w-6 h-6 text-slate-400" />
                                </div>
                                <span className="text-3xl font-black">{stats?.free_users || 0}</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Free Users</h3>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="glass-card rounded-3xl p-1 border-white/5">
                    <div className="bg-slate-950/40 rounded-[1.4rem] p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-black italic uppercase">User Management</h2>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Search by email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                {/* Filter */}
                                <select
                                    value={filterTier}
                                    onChange={(e) => setFilterTier(e.target.value as any)}
                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                >
                                    <option value="all">All Tiers</option>
                                    <option value="free">Free</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Email</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tier</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Credits</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Videos</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Spent</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Joined</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{user.email}</span>
                                                    {user.is_admin && (
                                                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-xs font-black uppercase">Admin</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${user.subscription_tier === 'premium'
                                                    ? 'bg-purple-500/20 text-purple-400'
                                                    : 'bg-slate-500/20 text-slate-400'
                                                    }`}>
                                                    {user.subscription_tier}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm font-bold">{user.credits}</td>
                                            <td className="py-4 px-4 text-sm font-bold">{user.total_videos_generated || 0}</td>
                                            <td className="py-4 px-4 text-sm font-bold text-green-400">{formatCurrency(user.total_spent || 0)}</td>
                                            <td className="py-4 px-4 text-sm text-slate-400">{formatDate(user.user_created_at)}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600/30 transition-colors"
                                                        title="Edit user"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        disabled={user.is_admin}
                                                        className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title={user.is_admin ? "Cannot delete admin" : "Delete user"}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 font-bold">No users found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Earnings */}
                <div className="glass-card rounded-3xl p-1 border-white/5">
                    <div className="bg-slate-950/40 rounded-[1.4rem] p-8">
                        <h2 className="text-2xl font-black italic uppercase mb-6">Recent Earnings</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Amount</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tier</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Method</th>
                                        <th className="text-left py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Transaction ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {earnings.slice(0, 10).map((earning) => (
                                        <tr key={earning.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 px-4 text-sm text-slate-400">{formatDate(earning.created_at)}</td>
                                            <td className="py-4 px-4 text-sm font-bold text-green-400">{formatCurrency(earning.amount)}</td>
                                            <td className="py-4 px-4">
                                                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-black uppercase">
                                                    {earning.subscription_tier}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm font-medium">{earning.payment_method}</td>
                                            <td className="py-4 px-4 text-sm text-slate-500 font-mono">{earning.transaction_id || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {earnings.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 font-bold">No earnings recorded yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card rounded-3xl p-1 border-white/10 max-w-md w-full">
                        <div className="bg-slate-950 rounded-[1.4rem] p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black uppercase">Edit User</h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Email</label>
                                    <input
                                        type="text"
                                        value={selectedUser.email}
                                        disabled
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-slate-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Credit Bundle</label>
                                    <select
                                        value={selectedBundle}
                                        onChange={(e) => handleBundleChange(e.target.value)}
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500"
                                    >
                                        {creditBundles.map(bundle => (
                                            <option key={bundle.id} value={bundle.id}>
                                                {bundle.name} {bundle.id !== 'custom' && `(${bundle.credits} credits - $${bundle.price})`}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedBundle !== 'custom' && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            This will set the user to Premium tier with {creditBundles.find(b => b.id === selectedBundle)?.credits} credits
                                        </p>
                                    )}
                                </div>

                                {selectedBundle === 'custom' && (
                                    <>
                                        <div>
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Subscription Tier</label>
                                            <select
                                                value={editTier}
                                                onChange={(e) => setEditTier(e.target.value as 'free' | 'premium')}
                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500"
                                            >
                                                <option value="free">Free</option>
                                                <option value="premium">Premium</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Credits</label>
                                            <input
                                                type="number"
                                                value={editCredits}
                                                onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        onClick={confirmEdit}
                                        disabled={actionLoading}
                                        className="flex-1 py-3 bg-indigo-600 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        disabled={actionLoading}
                                        className="px-6 py-3 bg-white/5 text-slate-400 font-black uppercase tracking-widest text-sm rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete User Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card rounded-3xl p-1 border-red-500/20 max-w-md w-full">
                        <div className="bg-slate-950 rounded-[1.4rem] p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black uppercase text-red-400">Delete User</h3>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <p className="text-slate-300">
                                    Are you sure you want to delete user <strong className="text-white">{selectedUser.email}</strong>?
                                </p>
                                <p className="text-sm text-slate-500">
                                    This action cannot be undone. All user data will be permanently deleted.
                                </p>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={confirmDelete}
                                        disabled={actionLoading}
                                        className="flex-1 py-3 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        Delete User
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        disabled={actionLoading}
                                        className="px-6 py-3 bg-white/5 text-slate-400 font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
