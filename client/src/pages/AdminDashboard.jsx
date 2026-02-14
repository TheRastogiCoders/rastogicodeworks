import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Plus,
  Trash2,
  Search,
  ChevronDown,
  ArrowRight,
  Briefcase,
  Calendar,
  Download
} from 'lucide-react';
import { downloadInvoicePdf } from '../utils/invoicePdf.js';

const emptyItem = { description: '', quantity: 1, price: 0 };

function calculateInvoiceTotals(items) {
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0,
  );
  return { subtotal, total: subtotal };
}

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview'); // overview | invoices | clients | settings

  // Invoice creation form state
  const [clientName, setClientName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [notes, setNotes] = useState('');

  // Invoice management state
  const [invoices, setInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');

  const totals = useMemo(() => calculateInvoiceTotals(items), [items]);

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === 'quantity' || field === 'price'
                  ? value === ''
                    ? ''
                    : Number(value)
                  : value,
            }
          : item,
      ),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setClientName('');
    setBillingAddress('');
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setDueDate('');
    setItems([{ ...emptyItem }]);
    setNotes('');
  };

  const handleCreateInvoice = (e) => {
    e?.preventDefault?.();
    if (!clientName.trim()) return;

    const payload = {
      clientName: clientName.trim(),
      billingAddress: billingAddress.trim() || undefined,
      invoiceDate,
      dueDate,
      items: items.filter((i) => i.description || i.quantity || i.price),
      notes,
    };

    setLoading(true);
    setError('');

    fetch(`${API_BASE}/api/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to create invoice');
        }
        return res.json();
      })
      .then((data) => {
        setInvoices((prev) => [data.invoice, ...prev]);
        resetForm();
        setActiveSection('invoices');
      })
      .catch((err) => {
        setError(err.message || 'Something went wrong while creating the invoice.');
      })
      .finally(() => setLoading(false));
  };

  const updateInvoiceStatus = (id, status) => {
    setInvoices((prev) => prev.map((inv) => (inv._id === id ? { ...inv, status } : inv)));

    fetch(`${API_BASE}/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    }).catch(() => {
      // If request fails, revert status change optimistically
      setInvoices((prev) => prev.map((inv) => (inv._id === id ? { ...inv, status: inv.status } : inv)));
    });
  };

  const deleteInvoice = (id) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Delete this invoice? This cannot be undone.')) {
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));

      fetch(`${API_BASE}/api/invoices/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      }).catch(() => {
        // If delete fails, this invoice will just be re-fetched on next load
      });
    }
  };

  const filteredInvoices = useMemo(
    () =>
      statusFilter === 'all'
        ? invoices
        : invoices.filter((inv) => inv.status === statusFilter),
    [invoices, statusFilter],
  );

  const overviewStats = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paidRevenue = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    const pendingRevenue = totalRevenue - paidRevenue;
    const unpaidCount = invoices.filter((inv) => inv.status !== 'paid').length;
    const paidCount = invoices.filter((inv) => inv.status === 'paid').length;
    const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length;
    const pendingPercentage = totalRevenue > 0 ? Math.round((pendingRevenue / totalRevenue) * 100) : 0;
    const averageInvoice = invoices.length > 0 ? totalRevenue / invoices.length : 0;

    return {
      totalInvoices: invoices.length,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      unpaidCount,
      paidCount,
      overdueCount,
      pendingPercentage,
      averageInvoice,
    };
  }, [invoices]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    window.location.href = '/login';
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      await downloadInvoicePdf({
        clientName: clientName || 'Client Name',
        billingAddress: billingAddress.trim() || undefined,
        invoiceDate,
        dueDate,
        items,
        notes,
        totals,
        invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      });
    } catch (err) {
      setError(err?.message || 'Failed to generate PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');

    fetch(`${API_BASE}/api/invoices`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to load invoices');
        }
        return res.json();
      })
      .then((data) => {
        setInvoices(data.invoices || []);
      })
      .catch((err) => {
        setError(err.message || 'Something went wrong while loading invoices.');
      })
      .finally(() => setLoading(false));
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'create', label: 'Create Invoice', icon: FilePlus },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="admin-dashboard min-h-screen flex flex-col font-sans text-primary-900 antialiased bg-gradient-to-br from-primary-50/40 via-white to-primary-50/20">
      {/* Top bar — responsive pill nav: compact on xs/sm, full on md+ */}
      <header className="sticky top-0 z-40 shrink-0 flex justify-center pt-[max(12px,env(safe-area-inset-top))] sm:pt-[max(14px,env(safe-area-inset-top))] md:pt-4 lg:pt-6 pb-2 sm:pb-3 md:pb-4 lg:pb-6 px-2 sm:px-3 md:px-4 bg-gradient-to-b from-primary-50/30 to-transparent">
        <nav className="relative w-full max-w-7xl min-h-[56px] h-[56px] sm:min-h-[64px] sm:h-[64px] md:min-h-[72px] md:h-[72px] lg:min-h-[84px] lg:h-[84px] xl:h-[96px] pl-2 pr-2 sm:pl-4 sm:pr-4 md:pl-6 md:pr-6 lg:pl-8 lg:pr-8 rounded-full flex items-center justify-between gap-1 sm:gap-2 md:gap-4 bg-white/90 sm:bg-white/80 border border-primary-200/60 sm:border-white/60 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 overflow-hidden max-w-[95vw] sm:max-w-[95%]">
          {/* Left: Logo + Brand — scales down on small screens */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0 min-w-0 max-w-[45%] sm:max-w-[50%] md:max-w-none group">
            <img
              src="/transparent_logo.png"
              alt="Rastogi Codeworks"
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 object-contain flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
            />
            <span className="flex flex-col min-w-0">
              <span className="font-brand font-semibold text-[10px] min-[380px]:text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl tracking-tight truncate italic text-primary-950">
                Rastogi Codeworks
              </span>
              <span className="text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary-600 mt-0.5 truncate">Admin</span>
            </span>
          </Link>

          {/* Middle: Nav links — desktop only */}
          <ul className="hidden lg:flex items-center gap-1 xl:gap-2 flex-shrink min-w-0">
            {navItems.map(({ id, label, icon: Icon }) => (
              <li key={id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-full text-sm xl:text-base font-medium transition-colors duration-200 ease-out whitespace-nowrap ${
                    activeSection === id
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-slate-600 hover:text-primary-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* Right: Actions — desktop md+ */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0 pl-2">
            <button
              type="button"
              onClick={() => setActiveSection('create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 lg:px-5 lg:py-3 rounded-full font-semibold text-sm lg:text-base transition-all duration-300 hover:scale-[1.02] active:scale-95 whitespace-nowrap text-white bg-primary-500 hover:bg-primary-400 shadow-md shadow-primary-500/20"
            >
              <Plus className="w-4 h-4 shrink-0" />
              New Invoice
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 lg:px-5 lg:py-3 rounded-full text-sm lg:text-base font-semibold transition-colors duration-200 whitespace-nowrap text-slate-600 hover:text-primary-700 hover:bg-slate-50"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Logout
            </button>
          </div>

          {/* Mobile/Tablet: icon nav + New + Logout — 44px touch targets, scrollable */}
          <div className="flex lg:hidden items-center gap-1 sm:gap-1.5 shrink-0 overflow-x-auto overflow-y-hidden scrollbar-hide min-h-[44px]">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-full transition-colors shrink-0 touch-manipulation ${
                  activeSection === id ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:text-primary-700 hover:bg-slate-50'
                }`}
                title={label}
                aria-label={label}
              >
                <Icon className="w-5 h-5 sm:w-5 sm:h-5" />
              </button>
            ))}
            <div className="w-px h-6 bg-slate-200 mx-0.5 shrink-0" aria-hidden />
            <button
              type="button"
              onClick={() => setActiveSection('create')}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-full text-xs font-semibold text-white bg-primary-500 hover:bg-primary-400 shadow-md shadow-primary-500/20 shrink-0 touch-manipulation"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden min-[400px]:inline">New</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-full text-slate-600 hover:text-primary-700 hover:bg-slate-50 transition-colors shrink-0 touch-manipulation"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <main className="flex-1 min-w-0 overflow-y-auto admin-scroll">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 md:py-10">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
              <div className="min-w-0">
                <h1 className="section-heading text-primary-950 mb-2 text-2xl sm:text-3xl md:text-4xl">
                  {activeSection === 'overview' && 'Dashboard'}
                  {activeSection === 'create' && 'New Invoice'}
                  {activeSection === 'invoices' && 'Invoices & Payments'}
                  {activeSection === 'clients' && 'Clients'}
                  {activeSection === 'settings' && 'Settings'}
                </h1>
                <p className="section-sub text-primary-700/90 max-w-2xl">
                  {activeSection === 'overview' && 'Welcome back. Here is what’s happening with your business today.'}
                  {activeSection === 'create' && 'Create and send professional invoices to your clients in seconds.'}
                  {activeSection === 'invoices' && 'Manage your billing history, track payments, and handle overdue accounts.'}
                  {activeSection === 'clients' && 'Manage your client relationships and project details.'}
                  {activeSection === 'settings' && 'Configure your workspace preferences and billing details.'}
                </p>
              </div>
              
              {activeSection === 'invoices' && (
                 <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-full bg-white/80 border border-primary-200/60 shadow-sm w-full sm:w-auto">
                    {['all', 'unpaid', 'paid', 'overdue'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all capitalize ${
                          statusFilter === filter
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-primary-700/80 hover:bg-primary-50'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                 </div>
              )}
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 flex items-center gap-3 mb-8 animate-fade-in">
                <div className="p-2 bg-red-100 rounded-full shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Overview Section — real data, modern layout */}
            {activeSection === 'overview' && (
              <div className="space-y-8 animate-fade-in-up">
                {/* Stats Grid — real metrics from API */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
                  <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={loading ? '—' : `Rs. ${overviewStats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    helper={loading ? 'Loading…' : `${overviewStats.totalInvoices} invoice${overviewStats.totalInvoices !== 1 ? 's' : ''} generated`}
                  />
                  <StatCard
                    icon={CheckCircle}
                    label="Paid Revenue"
                    value={loading ? '—' : `Rs. ${overviewStats.paidRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    helper={loading ? 'Loading…' : `${overviewStats.paidCount} cleared`}
                    tone="success"
                  />
                  <StatCard
                    icon={Clock}
                    label="Pending Amount"
                    value={loading ? '—' : `Rs. ${overviewStats.pendingRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    helper={loading ? 'Loading…' : `${overviewStats.unpaidCount} awaiting payment`}
                    tone="warning"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Average Invoice"
                    value={loading ? '—' : overviewStats.totalInvoices ? `Rs. ${overviewStats.averageInvoice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Rs. 0.00'}
                    helper="Per invoice"
                  />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Recent Activity — real invoice list */}
                  <div className="lg:col-span-2 admin-card-glass rounded-2xl overflow-hidden flex flex-col min-h-[280px] sm:min-h-[320px]">
                    <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-primary-100 flex items-center justify-between gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-primary-950 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-500" />
                        Recent Activity
                      </h2>
                      <button
                        type="button"
                        onClick={() => setActiveSection('invoices')}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
                      >
                        View all <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                      {loading ? (
                        <div className="flex-1 flex items-center justify-center py-12">
                          <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                        </div>
                      ) : invoices.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                            <FilePlus className="w-7 h-7 text-primary-500" />
                          </div>
                          <p className="font-semibold text-primary-950 text-lg">No invoices yet</p>
                          <p className="text-primary-600/80 text-sm max-w-xs mt-1 mb-5">Create your first invoice to see real data here.</p>
                          <button
                            type="button"
                            onClick={() => setActiveSection('create')}
                            className="inline-flex items-center gap-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2.5 shadow-md shadow-primary-500/20 transition-all"
                          >
                            <Plus className="w-4 h-4" /> Create Invoice
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto -mx-4 sm:mx-0 admin-scroll">
                          <table className="w-full min-w-[400px] text-left text-sm">
                            <thead className="bg-primary-50/50 border-b border-primary-100">
                              <tr>
                                <th className="px-4 sm:px-6 py-2 sm:py-3 font-semibold text-primary-700 text-xs uppercase tracking-wider">Client</th>
                                <th className="px-4 sm:px-6 py-2 sm:py-3 font-semibold text-primary-700 text-xs uppercase tracking-wider">Date</th>
                                <th className="px-4 sm:px-6 py-2 sm:py-3 font-semibold text-primary-700 text-xs uppercase tracking-wider text-right">Amount</th>
                                <th className="px-4 sm:px-6 py-2 sm:py-3 font-semibold text-primary-700 text-xs uppercase tracking-wider text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-100/50">
                              {invoices.slice(0, 5).map((inv) => (
                                <tr key={inv._id} className="hover:bg-primary-50/30 transition-colors">
                                  <td className="px-4 sm:px-6 py-2 sm:py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                                        {inv.clientName.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-primary-950">{inv.clientName}</p>
                                        <p className="text-xs text-primary-500">#{String(inv._id).slice(-6)}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 sm:px-6 py-2 sm:py-3 text-primary-600 whitespace-nowrap">
                                    {new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                  </td>
                                  <td className="px-4 sm:px-6 py-2 sm:py-3 text-right font-semibold text-primary-950 whitespace-nowrap">
                                    Rs. {(inv.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="px-4 sm:px-6 py-2 sm:py-3 text-center">
                                    <StatusPill status={inv.status} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Billing Health — real pending % from data */}
                  <div className="bg-primary-900 text-white rounded-2xl p-6 shadow-xl shadow-primary-900/20 relative overflow-hidden flex flex-col min-h-[320px] border border-primary-800/50">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="relative z-10 flex flex-col flex-1">
                      <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center mb-4 border border-white/10">
                        <TrendingUp className="w-5 h-5 text-primary-300" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">Billing Health</h3>
                      {loading ? (
                        <p className="text-primary-200 text-sm mb-4">Loading…</p>
                      ) : (
                        <>
                          <p className="text-primary-200 text-sm mb-4">
                            {overviewStats.totalRevenue === 0
                              ? 'No revenue yet. Create invoices to see your billing health here.'
                              : overviewStats.pendingPercentage <= 20
                                ? 'Your pending revenue is within a healthy range. Keep it under 20% for strong cash flow.'
                                : `${overviewStats.pendingPercentage}% of revenue is pending. Aim for under 20% for healthier cash flow.`}
                          </p>
                          {overviewStats.totalRevenue > 0 && (
                            <div className="mb-5">
                              <div className="flex justify-between text-xs text-primary-300 mb-1">
                                <span>Pending share</span>
                                <span className="font-semibold text-white">{overviewStats.pendingPercentage}%</span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary-400 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(overviewStats.pendingPercentage, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                          <ul className="space-y-2.5 text-sm text-primary-200 flex-1">
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                              Use early payment discounts
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                              Follow up on overdue invoices
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                              Reconcile weekly
                            </li>
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Create Invoice Section */}
            {activeSection === 'create' && (
              <div className="grid lg:grid-cols-12 gap-5 sm:gap-8 animate-fade-in-up">
                {/* Form Side */}
                <div className="lg:col-span-7 space-y-6 min-w-0">
                  <form onSubmit={handleCreateInvoice} className="admin-card-glass rounded-2xl p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-primary-100">
                      <div className="flex items-center gap-4">
                        <img
                          src="/transparent_logo.png"
                          alt="Rastogi Codeworks"
                          className="h-12 w-12 object-contain shrink-0"
                        />
                        <div>
                          <h2 className="text-xl font-bold text-primary-950">Invoice Details</h2>
                          <p className="text-xs font-medium text-primary-600 mt-0.5">Rastogi Codeworks</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full border border-primary-200">Draft</span>
                    </div>

                    <div className="space-y-8">
                      {/* Client Info */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Client Name</label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              placeholder="e.g. Acme Corp"
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Billing Address</label>
                          <textarea
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                            placeholder="Street, City, State, PIN, Country"
                            rows={2}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:col-span-2">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Issued</label>
                            <input
                              type="date"
                              value={invoiceDate}
                              onChange={(e) => setInvoiceDate(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium text-slate-900"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Due</label>
                            <input
                              type="date"
                              value={dueDate}
                              onChange={(e) => setDueDate(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium text-slate-900"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Line Items — table-style alignment */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Line Items</label>
                          <button
                            type="button"
                            onClick={addItem}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 bg-primary-50 px-3 py-2 rounded-lg border border-primary-200/60 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Item
                          </button>
                        </div>

                        {/* Table header — hidden on small, visible md+ */}
                        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 rounded-t-xl bg-primary-50/60 border border-primary-200/60 border-b-0 text-[10px] font-bold uppercase tracking-wider text-primary-700">
                          <div className="col-span-6">Description</div>
                          <div className="col-span-2 text-center">Qty</div>
                          <div className="col-span-2 text-right">Unit Price</div>
                          <div className="col-span-2 text-right">Amount</div>
                        </div>
                        
                        <div className="space-y-3">
                          {items.map((item, index) => (
                            <div key={index} className="group relative grid grid-cols-12 gap-3 items-center p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all">
                              <div className="col-span-12 md:col-span-6 space-y-1">
                                <label className="md:hidden text-[10px] font-bold uppercase text-slate-400 ml-1">Description</label>
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                  placeholder="Item details"
                                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none text-sm font-medium"
                                />
                              </div>
                              <div className="col-span-4 md:col-span-2 space-y-1">
                                <label className="md:hidden text-[10px] font-bold uppercase text-slate-400 ml-1">Qty</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none text-sm font-medium text-center tabular-nums"
                                />
                              </div>
                              <div className="col-span-4 md:col-span-2 space-y-1">
                                <label className="md:hidden text-[10px] font-bold uppercase text-slate-400 ml-1">Unit Price</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.price}
                                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none text-sm font-medium text-right tabular-nums"
                                />
                              </div>
                              <div className="col-span-4 md:col-span-2 flex items-center justify-end min-h-[42px]">
                                <span className="text-sm font-bold text-slate-900 tabular-nums">
                                  Rs. {((Number(item.quantity) || 0) * (Number(item.price) || 0)).toFixed(2)}
                                </span>
                              </div>
                              
                              {items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="absolute -top-2 -right-2 p-1.5 bg-white border border-red-100 text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Notes & Terms</label>
                        <textarea
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Thank you for your business. Payment is due within 7 days."
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 resize-none"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold text-primary-700/80 hover:text-primary-800 hover:bg-primary-50 transition-all order-2 sm:order-1"
                      >
                        Clear
                      </button>
                      <div className="flex flex-col min-[400px]:flex-row items-stretch min-[400px]:items-center gap-2 sm:gap-3 flex-wrap order-1 sm:order-2">
                        <button
                          type="button"
                          onClick={handleDownloadPdf}
                          disabled={pdfLoading}
                          className="px-6 py-3 rounded-full border border-primary-200 text-primary-700 text-sm font-semibold hover:bg-primary-50 hover:border-primary-300 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {pdfLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                              Generating PDF…
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" /> Download PDF
                            </>
                          )}
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-8 py-3 rounded-full bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Save Invoice
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Preview Side */}
                <div className="lg:col-span-5 space-y-6 min-w-0">
                  <div className="sticky top-20 sm:top-24 lg:top-24">
                    <div className="admin-card-glass rounded-2xl overflow-hidden border border-primary-200/60">
                      <div className="bg-primary-900 p-5 sm:p-6 lg:p-8 text-white relative overflow-hidden border-b border-primary-800/50">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                        <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-widest text-primary-300 mb-2">Invoice For</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white truncate">{clientName || 'Client Name'}</h3>
                            {billingAddress.trim() && (
                              <p className="text-primary-200 text-sm mt-1 whitespace-pre-line">{billingAddress.trim()}</p>
                            )}
                            <p className="text-primary-200 text-sm mt-1">ID: #INV-{new Date().getTime().toString().slice(-6)}</p>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <p className="text-xs font-bold uppercase tracking-widest text-primary-300 mb-1">Amount Due</p>
                            <p className="text-2xl sm:text-3xl font-bold text-primary-300 tabular-nums">Rs. {totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5 sm:p-6 lg:p-8">
                        {billingAddress.trim() && (
                          <div className="mb-6">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary-600/80 mb-1">Billing Address</p>
                            <p className="text-sm text-primary-800/80 whitespace-pre-line">{billingAddress.trim()}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-primary-600/80 mb-1">Issued Date</p>
                            <p className="font-semibold text-primary-950">{invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-primary-600/80 mb-1">Due Date</p>
                            <p className="font-semibold text-primary-950">{dueDate ? new Date(dueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}</p>
                          </div>
                        </div>

                        <div className="space-y-0 mb-8">
                          <p className="text-xs font-bold uppercase tracking-wider text-primary-600/80 border-b border-primary-100 pb-2 mb-3">Summary</p>
                          <div className="flex items-center justify-between py-2.5 text-sm">
                            <span className="text-primary-700/80">Subtotal</span>
                            <span className="font-semibold text-primary-950 tabular-nums">Rs. {totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex items-center justify-between py-3 mt-1 border-t-2 border-primary-200 text-base">
                            <span className="font-bold text-primary-950">Total</span>
                            <span className="font-bold text-primary-600 tabular-nums">Rs. {totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>

                        {notes && (
                          <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary-600/80 mb-1">Notes</p>
                            <p className="text-sm text-primary-800/80 italic">{notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-primary-50/30 p-4 text-center border-t border-primary-100">
                        <p className="text-xs text-primary-600/80">This is a preview of how the invoice will appear to the client.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoices List Section */}
            {activeSection === 'invoices' && (
              <div className="admin-card-glass rounded-2xl overflow-hidden animate-fade-in-up">
                {filteredInvoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
                      <Search className="w-10 h-10 text-primary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-950 mb-2">No invoices found</h3>
                    <p className="text-primary-700/80 max-w-md mx-auto mb-8">
                      We couldn't find any invoices matching your current filters. Try changing the status filter or create a new invoice.
                    </p>
                    <button
                      onClick={() => setActiveSection('create')}
                      className="px-6 py-3 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25"
                    >
                      Create First Invoice
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto admin-scroll -mx-3 sm:mx-0">
                    <table className="w-full min-w-[640px] text-left border-collapse">
                      <thead>
                        <tr className="bg-primary-50/80 border-b border-primary-200/60 text-xs font-bold uppercase tracking-wider text-primary-700">
                          <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5">Client Details</th>
                          <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 whitespace-nowrap">Invoice Date</th>
                          <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 whitespace-nowrap">Due Date</th>
                          <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-right whitespace-nowrap">Amount</th>
                          <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-center">Status</th>
                          <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary-100/50">
                        {filteredInvoices.map((inv) => (
                          <tr key={inv._id} className="group hover:bg-primary-50/30 transition-colors">
                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm border border-primary-200/50">
                                  {inv.clientName.charAt(0).toUpperCase()}
                                </div>
                                <div>
<p className="font-bold text-primary-950 text-sm">{inv.clientName}</p>
                                <p className="text-xs text-primary-600/70 font-mono mt-0.5">#{String(inv._id).slice(-6)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 whitespace-nowrap">
                              <span className="text-sm font-medium text-primary-700/80">
                                {new Date(inv.invoiceDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 whitespace-nowrap">
                              <span className="text-sm font-medium text-primary-700/80">
                                {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-right whitespace-nowrap">
                              <span className="text-sm font-bold text-primary-950">
                                Rs. {(inv.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-center">
                              <div className="inline-flex justify-center">
                                <StatusPill status={inv.status} />
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <div className="relative group/dropdown">
                                  <select
                                    value={inv.status}
                                    onChange={(e) => updateInvoiceStatus(inv._id, e.target.value)}
                                    className="appearance-none bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-primary-500 cursor-pointer hover:bg-slate-50"
                                  >
                                    <option value="unpaid">Mark Unpaid</option>
                                    <option value="paid">Mark Paid</option>
                                    <option value="overdue">Mark Overdue</option>
                                  </select>
                                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                                </div>
                                <button
                                  onClick={() => deleteInvoice(inv._id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Invoice"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Empty States for other sections */}
            {(activeSection === 'clients' || activeSection === 'settings') && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] admin-card-glass rounded-2xl animate-fade-in-up">
                 <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6">
                    {activeSection === 'clients' ? <Users className="w-10 h-10 text-primary-500" /> : <Settings className="w-10 h-10 text-primary-500" />}
                 </div>
                 <h2 className="text-2xl font-bold text-primary-950 mb-2">Coming Soon</h2>
                 <p className="text-primary-700/80 max-w-md text-center mb-8">
                   We are working hard to bring you advanced {activeSection} management features. Stay tuned for updates!
                 </p>
                 <button 
                   onClick={() => setActiveSection('overview')}
                   className="px-6 py-2.5 rounded-full border border-primary-200 text-primary-700 font-semibold hover:bg-primary-50 transition-all"
                 >
                   Back to Dashboard
                 </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper, trend, trendUp, tone = 'default' }) {
  const toneStyles =
    tone === 'success'
      ? { bg: 'bg-primary-50/60', border: 'border-primary-200', iconBg: 'bg-primary-100', iconColor: 'text-primary-600' }
      : tone === 'warning'
      ? { bg: 'bg-amber-50/50', border: 'border-amber-200', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' }
      : { bg: 'bg-white', border: 'border-primary-200/60', iconBg: 'bg-primary-50', iconColor: 'text-primary-600' };

  return (
    <div className={`admin-card-glass rounded-2xl border ${toneStyles.border} ${toneStyles.bg} p-4 sm:p-6 group min-w-0`}>
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${toneStyles.iconBg} flex items-center justify-center ${toneStyles.iconColor} transition-transform group-hover:scale-105 duration-300 shrink-0`}>
          {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6" />}
        </div>
        {trend && (
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shrink-0 ${trendUp ? 'bg-primary-100 text-primary-700' : 'bg-red-100 text-red-700'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
            {trend}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-medium text-primary-700/80 mb-1 truncate">{label}</p>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-950 tracking-tight mb-2 break-words">{value}</h3>
        {helper && <p className="text-xs text-primary-600/70 font-medium truncate">{helper}</p>}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  let styles = 'bg-primary-100/60 text-primary-700 border-primary-200';
  let dotColor = 'bg-primary-500';
  if (status === 'paid') {
    styles = 'bg-primary-50 text-primary-700 border-primary-200';
    dotColor = 'bg-primary-500';
  }
  if (status === 'overdue') {
    styles = 'bg-red-50 text-red-700 border-red-200';
    dotColor = 'bg-red-500';
  }
  if (status === 'unpaid') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  }
  const label = status === 'paid' ? 'Paid' : status === 'overdue' ? 'Overdue' : status === 'unpaid' ? 'Unpaid' : status;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}
