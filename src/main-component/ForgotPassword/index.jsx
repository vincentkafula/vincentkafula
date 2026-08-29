import React, {useState} from 'react';
import Grid from "@mui/material/Grid";
import {toast} from "react-toastify";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {Link, useNavigate} from "react-router-dom";
import { authApi } from '../../api/authApi';

import './style.scss';

const ForgotPassword = () => {

    const push = useNavigate()

    const [value, setValue] = useState({
        username: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const changeHandler = (e) => {
        setValue({...value, [e.target.name]: e.target.value});
    };

    const submitForm = async (e) => {
        e.preventDefault();
        if (!value.username) {
            toast.error('Please enter your username');
            return;
        }
        setSubmitting(true);
        try {
            const result = await authApi.forgotPassword(value.username);
            toast.success(result.message || 'If that account exists, a reset link has been sent.');
            setValue({ username: '' });
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
                <h2>Forgot Password</h2>
                <p>Enter your username and we'll email you a reset link (if an email is on file for your account)</p>
                <form onSubmit={submitForm}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                className="inputOutline"
                                fullWidth
                                placeholder="Username"
                                value={value.username}
                                variant="outlined"
                                name="username"
                                label="Username"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={changeHandler}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Grid className="formFooter">
                                <Button fullWidth className="cBtn cBtnLarge cBtnTheme" type="submit" disabled={submitting}>
                                    {submitting ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                            </Grid>
                            <p className="noteHelp">Already have an account? <Link to="/login">Return to Sign In</Link>
                            </p>
                        </Grid>
                    </Grid>
                </form>
                <div className="shape-img">
                    <i className="fi flaticon-honeycomb"></i>
                </div>
            </Grid>
        </Grid>
    )
};

export default ForgotPassword;
