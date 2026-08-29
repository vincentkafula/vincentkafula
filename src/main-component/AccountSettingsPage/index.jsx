import React, { Fragment, useState } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import DashboardTopbar from '../../components/ops-dashboards/DashboardTopbar';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { authApi, getAuth, setAuth } from '../../api/authApi';
import { DashCard, DashHeader, DashButton, DashInput, DashLabel } from '../../components/ops-dashboards/AdvancedDashboardKit';

const AccountSettingsPage = () => {
    const auth = getAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ display_name: auth?.display_name || '', email: auth?.email || '' });
    const [savingProfile, setSavingProfile] = useState(false);

    const [pw, setPw] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [savingPw, setSavingPw] = useState(false);

    const saveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const { token, user } = await authApi.updateMe(profile);
            setAuth({ token, ...user });
            toast.success('Profile updated');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSavingProfile(false);
        }
    };

    const savePassword = async (e) => {
        e.preventDefault();
        if (pw.new_password !== pw.confirm_password) {
            toast.error("New passwords don't match");
            return;
        }
        if (pw.new_password.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }
        setSavingPw(true);
        try {
            const { token, user } = await authApi.updateMe({
                current_password: pw.current_password,
                new_password: pw.new_password,
            });
            setAuth({ token, ...user });
            setPw({ current_password: '', new_password: '', confirm_password: '' });
            toast.success('Password changed');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSavingPw(false);
        }
    };

    return (
        <Fragment>
            <Navbar2 />
            <DashboardTopbar />
            <PageTitle pageTitle={'Account Settings'} pagesub={'Settings'} />
            <div className="container" style={{ padding: '60px 15px 100px', maxWidth: '760px' }}>
                <DashHeader
                    title="Account Settings"
                    subtitle={`Signed in as ${auth?.display_name} (${auth?.role})`}
                    right={<Link to={`/dashboard/${auth?.role}`} style={{ fontSize: '13px', color: '#12351b', fontWeight: 600 }}>← Back to dashboard</Link>}
                />

                <DashCard style={{ marginBottom: '22px' }}>
                    <h3 style={{ marginTop: 0, fontSize: '17px' }}>Profile</h3>
                    <form onSubmit={saveProfile}>
                        <div style={{ marginBottom: '14px' }}>
                            <DashLabel>Display Name</DashLabel>
                            <DashInput value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
                        </div>
                        <div style={{ marginBottom: '18px' }}>
                            <DashLabel>Email (used for password reset)</DashLabel>
                            <DashInput type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="you@example.com" />
                        </div>
                        <DashButton type="submit" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save Profile'}</DashButton>
                    </form>
                </DashCard>

                <DashCard>
                    <h3 style={{ marginTop: 0, fontSize: '17px' }}>Change Password</h3>
                    <form onSubmit={savePassword}>
                        <div style={{ marginBottom: '14px' }}>
                            <DashLabel>Current Password</DashLabel>
                            <DashInput type="password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                            <div>
                                <DashLabel>New Password</DashLabel>
                                <DashInput type="password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} />
                            </div>
                            <div>
                                <DashLabel>Confirm New Password</DashLabel>
                                <DashInput type="password" value={pw.confirm_password} onChange={(e) => setPw({ ...pw, confirm_password: e.target.value })} />
                            </div>
                        </div>
                        <DashButton type="submit" disabled={savingPw}>{savingPw ? 'Saving…' : 'Change Password'}</DashButton>
                    </form>
                </DashCard>
            </div>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default AccountSettingsPage;
