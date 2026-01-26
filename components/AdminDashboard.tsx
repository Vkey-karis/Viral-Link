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
    Calendar,
    Filter
} from 'lucide-react';
import {
    getAdminStats,
    getAllUsers,
    getAllEarnings,
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Admin Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="w-6 h-6 text-indigo-500" />
                                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">Admin Control Panel</span>
                            </div>
                            <h1 className="text-4xl font-black italic uppercase tracking-tight">
                                VIRAL<span className="text-slate-600">LINK</span> DASHBOARD
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={loadDashboardData}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-widest">Refresh</span>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
    );
};

export default AdminDashboard;
