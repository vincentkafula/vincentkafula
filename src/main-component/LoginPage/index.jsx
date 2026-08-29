import React, { useState } from 'react';
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useNavigate, Link } from "react-router-dom";
import { authApi, setAuth } from '../../api/authApi';

import './style.scss';

const demoAccounts = [
    { role: 'Partner', username: 'partner' },
    { role: 'Operation Management', username: 'opmanagement' },
    { role: 'Operation Office', username: 'operationoffice' },
    { role: 'Manager', username: 'manager' },
    { role: 'Teams', username: 'teams' },
    { role: 'Foreman', username: 'foreman' },
    { role: 'Day Admin', username: 'dayadmin' },
    { role: 'Store', username: 'store' },
    { role: 'Head Office', username: 'headoffice' },
    { role: 'Team Member', username: 'teammember' },
    { role: 'News Manager', username: 'newsmanager' },
    { role: 'Shop Manager', username: 'shopmanager' },
];
const DEMO_PASSWORD = 'Demo@2026';

const LoginPage = () => {
    const push = useNavigate();
    const [value, setValue] = useState({ username: '', password: '' });
    const [submitting, setSubmitting] = useState(false);

    const changeHandler = (e) => {
        setValue({ ...value, [e.target.name]: e.target.value });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        if (!value.username || !value.password) {
            toast.error('Username and password are required');
            return;
        }
        setSubmitting(true);
        try {
            const { token, user } = await authApi.login(value.username, value.password);
            setAuth({ token, ...user });
            toast.success(`Welcome, ${user.display_name}`);
            push(`/dashboard/${user.role}`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const fillDemo = (username) => {
        setValue({ username, password: DEMO_PASSWORD });
    };

    return (
        <Grid className="loginWrapper">
            <Grid className="loginForm">
                <h2>Sign In</h2>
                <p>Sign in to your dashboard</p>
                <form onSubmit={submitForm}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                className="inputOutline"
                                fullWidth
                                value={value.username}
                                variant="outlined"
                                name="username"
                                label="Username"
                                InputLabelProps={{ shrink: true }}
                                onChange={changeHandler}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                className="inputOutline"
                                fullWidth
                                value={value.password}
                                variant="outlined"
                                name="password"
                                type="password"
                                label="Password"
                                InputLabelProps={{ shrink: true }}
                                onChange={changeHandler}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Grid className="formFooter">
                                <Button fullWidth className="cBtnTheme" type="submit" disabled={submitting}>
                                    {submitting ? 'Signing in...' : 'Login'}
                                </Button>
                            </Grid>
                            <p style={{ marginTop: '14px', fontSize: '13px' }}>
                                <Link to="/forgot-password">Forgot your password?</Link>
                            </p>
                        </Grid>
                    </Grid>
                </form>

                <div className="demo-accounts" style={{ marginTop: '30px', paddingTop: '25px', borderTop: '1px solid #eee' }}>
                    <p style={{ fontWeight: 600, marginBottom: '6px' }}>Demo Accounts</p>
                    <p style={{ fontSize: '13px', color: '#777', marginBottom: '15px' }}>
                        Password for every demo account: <code>{DEMO_PASSWORD}</code>. Click a role to fill in its username.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {demoAccounts.map((acc) => (
                            <Button
                                key={acc.username}
                                variant="outlined"
                                size="small"
                                onClick={() => fillDemo(acc.username)}
                                style={{ textTransform: 'none' }}
                            >
                                {acc.role}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="shape-img">
                    <i className="fi flaticon-honeycomb"></i>
                </div>
            </Grid>
        </Grid>
    )
};

export default LoginPage;
