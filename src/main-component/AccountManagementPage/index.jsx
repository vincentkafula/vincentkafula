import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import DashboardTopbar from '../../components/ops-dashboards/DashboardTopbar';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { authApi, getAuth } from '../../api/authApi';
import { DashCard, DashHeader, DashButton, DashBadge, DashInput, DashSelect, DashLabel, DashGrid, DashStat } from '../../components/ops-dashboards/AdvancedDashboardKit';

const ROLE_OPTIONS = [
    ['news-manager', 'News Manager'],
    ['shop-manager', 'Shop Manager'],
    ['head-office', 'Head Office'],
    ['project-manager', 'Project Manager'],
    ['op-management', 'Op. Management'],
    ['operation-office', 'Operation Office'],
    ['partner', 'Partner'],
    ['teams', 'Teams'],
    ['foreman', 'Foreman'],
    ['day-admin', 'Day Admin'],
    ['store', 'Store'],
    ['team-member', 'Team Member'],
];

const emptyForm = { username: '', display_name: '', email: '', role: 'news-manager', password: '' };

const AccountManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [creating, setCreating] = useState(false);
    const self = getAuth();

    const load = () => {
        setLoading(true);
        authApi.listUsers().then(setUsers).catch((err) => toast.error(err.message)).finally(() => setLoading(false));
    };

    useEffect(load, []);

    const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.display_name || !form.password) {
            toast.error('Username, display name, and password are required');
            return;
        }
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setCreating(true);
        try {
            await authApi.createUser(form);
            toast.success(`Account created for ${form.display_name}`);
            setForm(emptyForm);
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCreating(false);
        }
    };

    const remove = async (user) => {
        if (!window.confirm(`Delete the account "${user.username}"?`)) return;
        try {
            await authApi.deleteUser(user.id);
            toast.success('Account deleted');
            load();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <Fragment>
            <Navbar2 />
            <DashboardTopbar />
            <PageTitle pageTitle={'Manage Accounts'} pagesub={'Settings'} />
            <div className="container" style={{ padding: '60px 15px 100px' }}>
                <DashHeader
                    title="Accounts"
                    subtitle="Create and manage dashboard logins for every role, including News and Shop managers."
                    right={<Link to="/dashboard/head-office" style={{ fontSize: '13px', color: '#12351b', fontWeight: 600 }}>← Back to dashboard</Link>}
                />

                <DashGrid min="160px" style={{ marginBottom: '28px' }}>
                    <DashStat label="Total Accounts" value={users.length} />
                    <DashStat label="News Managers" value={users.filter((u) => u.role === 'news-manager').length} />
                    <DashStat label="Shop Managers" value={users.filter((u) => u.role === 'shop-manager').length} />
                </DashGrid>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: '24px', alignItems: 'start' }}>
                    <DashCard>
                        <h3 style={{ marginTop: 0, fontSize: '17px' }}>Create Account</h3>
                        <form onSubmit={submit}>
                            <div style={{ marginBottom: '14px' }}>
                                <DashLabel>Username</DashLabel>
                                <DashInput name="username" value={form.username} onChange={change} placeholder="e.g. newsmanager2" />
                            </div>
                            <div style={{ marginBottom: '14px' }}>
                                <DashLabel>Display Name</DashLabel>
                                <DashInput name="display_name" value={form.display_name} onChange={change} placeholder="Full name" />
                            </div>
                            <div style={{ marginBottom: '14px' }}>
                                <DashLabel>Email (for password reset)</DashLabel>
                                <DashInput type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" />
                            </div>
                            <div style={{ marginBottom: '14px' }}>
                                <DashLabel>Role</DashLabel>
                                <DashSelect name="role" value={form.role} onChange={change}>
                                    {ROLE_OPTIONS.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                                </DashSelect>
                            </div>
                            <div style={{ marginBottom: '18px' }}>
                                <DashLabel>Temporary Password</DashLabel>
                                <DashInput type="text" name="password" value={form.password} onChange={change} placeholder="At least 8 characters" />
                            </div>
                            <DashButton type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create Account'}</DashButton>
                        </form>
                    </DashCard>

                    <DashCard>
                        <h3 style={{ marginTop: 0, fontSize: '17px' }}>All Accounts</h3>
                        {loading ? (
                            <p style={{ color: '#7a8a7d' }}>Loading…</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eef0ec' }}>
                                            <th style={{ padding: '10px' }}>Name</th>
                                            <th style={{ padding: '10px' }}>Username</th>
                                            <th style={{ padding: '10px' }}>Role</th>
                                            <th style={{ padding: '10px' }}>Email</th>
                                            <th style={{ padding: '10px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid #f4f6f4' }}>
                                                <td style={{ padding: '10px', fontWeight: 600 }}>{u.display_name}</td>
                                                <td style={{ padding: '10px', fontFamily: 'monospace' }}>{u.username}</td>
                                                <td style={{ padding: '10px' }}><DashBadge>{u.role}</DashBadge></td>
                                                <td style={{ padding: '10px', color: '#7a8a7d' }}>{u.email || '—'}</td>
                                                <td style={{ padding: '10px' }}>
                                                    {u.username !== self?.username && (
                                                        <DashButton variant="danger" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => remove(u)}>Delete</DashButton>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </DashCard>
                </div>
            </div>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default AccountManagementPage;
