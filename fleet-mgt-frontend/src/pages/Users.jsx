import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../axios';
import Pagination from '../components/Pagination';

const ROLE_STYLE = {
    admin:      { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5', icon: '👑' },
    manager:    { bg: '#eff6ff', color: '#0d6efd', border: '#bfdbfe', icon: '👨‍💼' },
    driver:     { bg: '#dcfce7', color: '#16a34a', border: '#86efac', icon: '🚗' },
    accountant: { bg: '#f5f3ff', color: '#6d28d9', border: '#c4b5fd', icon: '📊' },
};

function SortIcon({ col, sortBy, sortDir }) {
    if (sortBy !== col) return <span style={{ color: '#cbd5e1', marginLeft: 4, fontSize: '0.7rem' }}>⇅</span>;
    return <span style={{ color: '#0d6efd', marginLeft: 4, fontSize: '0.75rem' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

function Th({ col, label, sortBy, sortDir, onSort, style }) {
    return (
        <th onClick={() => onSort(col)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', ...style }}>
            {label}<SortIcon col={col} sortBy={sortBy} sortDir={sortDir} />
        </th>
    );
}

export default function Users() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';

    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 15, from: 0, to: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [selectedUser, setSelectedUser] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stats, setStats] = useState({ active: 0, inactive: 0 });

    const filtersRef = useRef({ search: '', role: 'all', sortBy: 'name', sortDir: 'asc', perPage: 15 });
    const searchTimeout = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        fetchUsers(1);
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setSelectedUser(null); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchUsers = useCallback(async (page = 1, perPage = filtersRef.current.perPage) => {
        setLoading(true);
        try {
            const { search, role, sortBy: sb, sortDir: sd } = filtersRef.current;
            const params = { page, per_page: perPage, sort_by: sb, sort_dir: sd };
            if (search) params.search = search;
            if (role !== 'all') params.role = role;
            const response = await api.get('/users', { params });
            const d = response.data;
            const usersData = d.data || d.users || d || [];
            setUsers(Array.isArray(usersData) ? usersData : []);
            if (d.active_count !== undefined) {
                setStats({ active: d.active_count, inactive: d.inactive_count ?? 0 });
            }
            setPagination({
                currentPage: d.current_page ?? 1,
                lastPage: d.last_page ?? 1,
                total: d.total ?? (Array.isArray(usersData) ? usersData.length : 0),
                perPage: d.per_page ?? perPage,
                from: d.from ?? 0,
                to: d.to ?? 0,
            });
            filtersRef.current.perPage = d.per_page ?? perPage;
        } catch (err) {
            console.error(err);
            setError(t('users.load_error'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        filtersRef.current.search = value;
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => fetchUsers(1), 350);
    };

    const handleRoleChange = (role) => {
        setFilterRole(role);
        filtersRef.current.role = role;
        fetchUsers(1);
    };

    const handleSort = (col) => {
        const newDir = filtersRef.current.sortBy === col && filtersRef.current.sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(col); setSortDir(newDir);
        filtersRef.current.sortBy = col;
        filtersRef.current.sortDir = newDir;
        fetchUsers(1);
    };

    const clearAll = () => {
        clearTimeout(searchTimeout.current);
        setSearchTerm(''); setFilterRole('all');
        filtersRef.current.search = ''; filtersRef.current.role = 'all';
        fetchUsers(1);
    };

    const handlePageChange = (page) => { setSelectedUser(null); fetchUsers(page); };
    const handlePerPageChange = (perPage) => { setSelectedUser(null); filtersRef.current.perPage = perPage; fetchUsers(1, perPage); };

    const handleRowClick = (event, user) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setMenuPosition({ x: event.clientX, y: rect.bottom });
        setSelectedUser(user);
    };

    const handleView = () => { if (selectedUser?.id) { navigate(`/users/${selectedUser.id}`); } setSelectedUser(null); };
    const handleEdit = () => { if (selectedUser?.id) { navigate(`/users/${selectedUser.id}/edit`); } setSelectedUser(null); };
    const handleDelete = async () => {
        if (!window.confirm(t('users.delete_confirm', { name: selectedUser.name }))) { setSelectedUser(null); return; }
        try {
            await api.delete(`/users/${selectedUser.id}`);
            setSuccess(t('users.delete_success', { name: selectedUser.name }));
            setSelectedUser(null);
            fetchUsers(pagination.currentPage);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || t('users.delete_error'));
            setSelectedUser(null);
        }
    };

    const thProps = { sortBy, sortDir, onSort: handleSort };
    const hasFilter = searchTerm || filterRole !== 'all';

    const fetchAll = async () => {
        const { search, role, sortBy: sb, sortDir: sd } = filtersRef.current;
        const params = { per_page: 9999, sort_by: sb, sort_dir: sd };
        if (search) params.search = search;
        if (role !== 'all') params.role = role;
        const res = await api.get('/users', { params });
        const d = res.data;
        return Array.isArray(d.data || d.users || d) ? (d.data || d.users || d) : [];
    };

    const roleLabel = (role) => t(`users.badge_${role?.toLowerCase()}`) || role;

    const exportPDF = async () => {
        const all = await fetchAll();
        const doc = new jsPDF({ orientation: 'portrait' });
        doc.setFontSize(14); doc.setFont(undefined, 'bold');
        doc.text(t('users.title'), 14, 15);
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), 14, 22);
        autoTable(doc, {
            startY: 27,
            head: [[t('users.user_col'), t('users.email_col'), t('users.role_col'), t('users.creation_date')]],
            body: all.map(u => [
                u.name,
                u.email,
                roleLabel(u.role),
                u.created_at ? new Date(u.created_at).toLocaleDateString(locale) : '-',
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [102, 126, 234] },
        });
        doc.save(`utilisateurs-${new Date().toISOString().slice(0,10)}.pdf`);
    };

    const exportExcel = async () => {
        const all = await fetchAll();
        const rows = all.map(u => ({
            [t('users.user_col')]:      u.name,
            [t('users.email_col')]:     u.email,
            [t('users.role_col')]:      roleLabel(u.role),
            [t('users.creation_date')]: u.created_at ? new Date(u.created_at).toLocaleDateString(locale) : '-',
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [24, 30, 14, 14].map(w => ({ wch: w }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs');
        XLSX.writeFile(wb, `utilisateurs-${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    return (
        <div className="container mt-4">
            <div className="sticky-page-header" style={{ background: '#fff', borderRadius: '0 0 18px 18px', boxShadow: '0 4px 24px rgba(102,126,234,0.15)', padding: '0.85rem 0', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>👥</div>
                        <div>
                            <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', lineHeight: 1.2 }}>{t('users.title')}</h2>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>{pagination.total} {t('reports.records_count')}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF
                        </button>
                        <button onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Excel
                        </button>
                        <button onClick={() => navigate('/users/create')}
                            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', color: '#fff', borderRadius: '10px', padding: '0.48rem 1.1rem', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 3px 10px rgba(102,126,234,0.3)', whiteSpace: 'nowrap' }}>
                            + {t('users.new_user')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>✓</div>
                    <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>{stats.active}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('users.active')}</div>
                    </div>
                </div>
                <div style={{ flex: 1, minWidth: '140px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>✗</div>
                    <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>{stats.inactive}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('users.inactive')}</div>
                    </div>
                </div>
                <div style={{ flex: 1, minWidth: '140px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>👥</div>
                    <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0d6efd', lineHeight: 1 }}>{stats.active + stats.inactive}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('users.total')}</div>
                    </div>
                </div>
            </div>

            {success && <div className="alert alert-success alert-dismissible fade show mb-3"><span>✅ {success}</span><button type="button" className="btn-close" onClick={() => setSuccess('')} /></div>}
            {error && <div className="alert alert-danger alert-dismissible fade show mb-3"><span>❌ {error}</span><button type="button" className="btn-close" onClick={() => setError('')} /></div>}

            <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '14px' }}>
                <div className="card-body py-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-7">
                            <div className="input-group">
                                <span className="input-group-text bg-white" style={{ border: '2px solid #e9ecef', borderRight: 'none' }}>🔍</span>
                                <input type="text" className="form-control" placeholder={t('users.search_placeholder')}
                                    value={searchTerm} onChange={e => handleSearchChange(e.target.value)}
                                    style={{ border: '2px solid #e9ecef', borderLeft: 'none' }} />
                                {searchTerm && <button className="btn btn-outline-secondary" style={{ border: '2px solid #e9ecef' }} onClick={() => handleSearchChange('')}>✕</button>}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select className="form-select" value={filterRole} onChange={e => handleRoleChange(e.target.value)} style={{ border: '2px solid #e9ecef' }}>
                                <option value="all">{t('users.all_roles')}</option>
                                <option value="admin">{t('users.role_admin_filter')}</option>
                                <option value="manager">{t('users.role_manager_filter')}</option>
                                <option value="driver">{t('users.role_driver_filter')}</option>
                                <option value="accountant">{t('users.role_accountant_filter')}</option>
                            </select>
                        </div>
                        {hasFilter && (
                            <div className="col-md-1">
                                <button className="btn btn-sm btn-outline-danger w-100" style={{ borderRadius: '10px' }} onClick={clearAll}>{t('vehicles.clear_filters')}</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">{t('common.loading')}</span></div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                        <thead className="table-light text-center">
                            <tr>
                                <Th col="name"       label={t('users.user_col')}      {...thProps} />
                                <Th col="email"      label={t('users.email_col')}     {...thProps} />
                                <Th col="role"       label={t('users.role_col')}      {...thProps} />
                                <Th col="created_at" label={t('users.creation_date')} {...thProps} />
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? users.map((user) => {
                                const rs = ROLE_STYLE[user.role?.toLowerCase()] || ROLE_STYLE.driver;
                                const isSelected = selectedUser?.id === user.id;
                                return (
                                    <tr key={user.id} className="text-center"
                                        onClick={(e) => handleRowClick(e, user)}
                                        title={t('vehicles.click_hint')}
                                        style={{ cursor: 'pointer', backgroundColor: isSelected ? '#667eea' : 'transparent', color: isSelected ? 'white' : 'inherit', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isSelected ? 'rgba(255,255,255,0.25)' : 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="fw-semibold">{user.name}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 700, background: isSelected ? 'rgba(255,255,255,0.2)' : rs.bg, color: isSelected ? '#fff' : rs.color, border: `1px solid ${isSelected ? 'rgba(255,255,255,0.3)' : rs.border}` }}>
                                                {rs.icon} {t(`users.badge_${user.role?.toLowerCase()}`) || user.role}
                                            </span>
                                        </td>
                                        <td>{user.created_at ? new Date(user.created_at).toLocaleDateString(locale) : 'N/A'}</td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="4" className="text-center text-muted py-5">
                                    <div className="fs-1 mb-3">👥</div>
                                    <p className="mb-0">{t('users.no_users')}</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} total={pagination.total} perPage={pagination.perPage} from={pagination.from} to={pagination.to} onPageChange={handlePageChange} onPerPageChange={handlePerPageChange} />

            {selectedUser && (
                <div ref={menuRef} style={{ position: 'fixed', top: `${menuPosition.y}px`, left: `${menuPosition.x}px`, zIndex: 1000, transform: 'translateX(-50%)', animation: 'fadeIn 0.2s ease-in-out' }}>
                    <div className="card shadow-lg border-0" style={{ minWidth: '220px', borderRadius: '12px', overflow: 'hidden' }}>
                        <div className="card-header py-2" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                            <small className="fw-bold text-white">{selectedUser.name}</small>
                        </div>
                        <div className="list-group list-group-flush">
                            {[
                                { label: t('common.view'),   sub: t('common.view_details'),      color: '#0d6efd', icon: '👁️', fn: handleView },
                                { label: t('common.edit'),   sub: t('common.edit_info'),          color: '#ffc107', icon: '✏️', fn: handleEdit },
                                { label: t('common.delete'), sub: t('common.delete_permanently'), color: '#dc3545', icon: '🗑️', fn: handleDelete },
                            ].map(({ label, sub, color, icon, fn }) => (
                                <button key={label} onClick={fn} className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3" style={{ border: 'none', cursor: 'pointer' }}>
                                    <div style={{ width: '40px', height: '40px', backgroundColor: color, borderRadius: '8px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                                    <div className="flex-grow-1"><strong className="d-block">{label}</strong><small className="text-muted">{sub}</small></div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity:0; transform:translateX(-50%) translateY(-10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
                .list-group-item-action:hover { background-color:#f8f9fa !important; transform:translateX(3px); transition:all 0.2s ease; }
            `}</style>
        </div>
    );
}
