import React, { useState } from 'react';
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useNavigate, useParams } from "react-router-dom";
import { authApi } from '../../api/authApi';

import '../LoginPage/style.scss';

const ResetPasswordPage = () => {
    const push = useNavigate();
    const { token } = useParams();
    const [value, setValue] = useState({ password: '', confirm: '' });
    const [submitting, setSubmitting] = useState(false);

    const changeHandler = (e) => setValue({ ...value, [e.target.name]: e.target.value });

    const submitForm = async (e) => {
        e.preventDefault();
        if (!value.password || value.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        if (value.password !== value.confirm) {
            toast.error("Passwords don't match");
            return;
        }
        setSubmitting(true);
        try {
            await authApi.resetPassword(token, value.password);
            toast.success('Password updated — you can now log in');
            push('/login');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Grid className="loginWrapper">
            <Grid className="loginForm">
                <h2>Set New Password</h2>
                <p>Choose a new password for your account</p>
                <form onSubmit={submitForm}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                className="inputOutline" fullWidth
                                value={value.password} variant="outlined" name="password" type="password"
                                label="New Password" InputLabelProps={{ shrink: true }} onChange={changeHandler}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                className="inputOutline" fullWidth
                                value={value.confirm} variant="outlined" name="confirm" type="password"
                                label="Confirm New Password" InputLabelProps={{ shrink: true }} onChange={changeHandler}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Grid className="formFooter">
                                <Button fullWidth className="cBtnTheme" type="submit" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Reset Password'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
                <div className="shape-img">
                    <i className="fi flaticon-honeycomb"></i>
                </div>
            </Grid>
        </Grid>
    );
};

export default ResetPasswordPage;
