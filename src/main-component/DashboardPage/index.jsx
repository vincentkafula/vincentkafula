import React, { Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import PartnerDashboard from '../PartnerDashboardPage';
import OpManagementDashboard from '../OpManagementDashboardPage';
import OperationOfficeDashboard from '../OperationOfficeDashboardPage';
import ManagerDashboard from '../ManagerDashboardPage';
import TeamsDashboard from '../TeamsDashboardPage';
import DayAdminDashboard from '../DayAdminDashboardPage';
import ForemanDashboard from '../ForemanDashboardPage';
import StoreDashboard from '../StoreDashboardPage';
import RequireDashboardAuth from '../../components/ops-dashboards/RequireDashboardAuth';

const roleLabels = {
    'teams': 'Teams',
    'foreman': 'Foreman',
    'day-admin': 'Day Admin',
    'operation-office': 'Operation Office',
    'op-management': 'Op. Management',
    'store': 'Store',
    'project-manager': 'Project Manager',
    'head-office': 'Head Office',
    'partner': 'Partner',
    'team-member': 'Team Member',
};

// Roles with a real, built-out dashboard. Everything else falls back to the placeholder below.
const builtDashboards = {
    'partner': PartnerDashboard,
    'op-management': OpManagementDashboard,
    'operation-office': OperationOfficeDashboard,
    'project-manager': ManagerDashboard,
    'teams': TeamsDashboard,
    'day-admin': DayAdminDashboard,
    'foreman': ForemanDashboard,
    'store': StoreDashboard,
};

const DashboardPlaceholder = ({ role }) => {
    const label = roleLabels[role] || 'Dashboard';
    return (
        <Fragment>
            <Navbar2 />
            <PageTitle pageTitle={`${label} Dashboard`} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '100px 15px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px' }}>{label} Dashboard</h2>
                <p style={{ maxWidth: '600px', margin: '0 auto 30px', color: '#666' }}>
                    This dashboard is coming soon. Content and tools for the {label} role will be built here.
                </p>
                <Link to="/login" className="theme-btn">Back to Login</Link>
            </div>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

const DashboardPage = () => {
    const { role } = useParams();
    const Built = builtDashboards[role];
    if (Built) {
        return (
            <RequireDashboardAuth>
                <Built />
            </RequireDashboardAuth>
        );
    }
    return <DashboardPlaceholder role={role} />;
};

export default DashboardPage;
