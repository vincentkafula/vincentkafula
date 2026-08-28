import React, {useState} from 'react';
import Grid from "@mui/material/Grid";
import SimpleReactValidator from "simple-react-validator";
import {toast} from "react-toastify";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import {Link, useNavigate} from "react-router-dom";

import './style.scss';

const demoAccounts = [
    { label: 'Teams', slug: 'teams' },
    { label: 'Foreman', slug: 'foreman' },
    { label: 'Day Admin', slug: 'day-admin' },
    { label: 'Operation Office', slug: 'operation-office' },
    { label: 'Op. Management', slug: 'op-management' },
    { label: 'Store', slug: 'store' },
    { label: 'Project Manager', slug: 'project-manager' },
    { label: 'Head Office', slug: 'head-office' },
    { label: 'Partner', slug: 'partner' },
    { label: 'Team Member', slug: 'team-member' },
];



const LoginPage = (props) => {

    const push = useNavigate()

    const [value, setValue] = useState({
        email: 'user@gmail.com',
        password: '123456',
        remember: false,
    });

    const changeHandler = (e) => {
        setValue({...value, [e.target.name]: e.target.value});
        validator.showMessages();
    };

    const rememberHandler = () => {
        setValue({...value, remember: !value.remember});
    };

    const [validator] = React.useState(new SimpleReactValidator({
        className: 'errorMessage'
    }));



    const submitForm = (e) => {
        e.preventDefault();
        if (validator.allValid()) {
            setValue({
                email: '',
                password: '',
                remember: false
            });
            validator.hideMessages();

            const userRegex = /^user+.*/gm;
            const email = value.email;

            if (email.match(userRegex)) {
                toast.success('You successfully Login on Vincent Kafula !');
                push('/home');
            }
        } else {
            validator.showMessages();
            toast.error('Empty field is not allowed!');
        }
    };
    return (
        <Grid className="loginWrapper">
            <Grid className="loginForm">
                <h2>Sign In</h2>
                <p>Sign in to your account</p>
                <form onSubmit={submitForm}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                className="inputOutline"
                                fullWidth
                                placeholder="E-mail"
                                value={value.email}
                                variant="outlined"
                                name="email"
                                label="E-mail"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onBlur={(e) => changeHandler(e)}
                                onChange={(e) => changeHandler(e)}
                            />
                            {validator.message('email', value.email, 'required|email')}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                className="inputOutline"
                                fullWidth
                                placeholder="Password"
                                value={value.password}
                                variant="outlined"
                                name="password"
                                type="password"
                                label="Password"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onBlur={(e) => changeHandler(e)}
                                onChange={(e) => changeHandler(e)}
                            />
                            {validator.message('password', value.password, 'required')}
                        </Grid>
                        <Grid item xs={12}>
                            <Grid className="formAction">
                                <FormControlLabel
                                    control={<Checkbox checked={value.remember} onChange={rememberHandler}/>}
                                    label="Remember Me"
                                />
                                <Link to="/forgot-password">Forgot Password?</Link>
                            </Grid>
                            <Grid className="formFooter">
                                <Button fullWidth className="cBtnTheme" type="submit">Login</Button>
                            </Grid>
                            <Grid className="loginWithSocial">
                                <Button className="facebook"><i className="fa fa-facebook"></i></Button>
                                <Button className="twitter"><i className="fa fa-twitter"></i></Button>
                                <Button className="linkedin"><i className="fa fa-linkedin"></i></Button>
                            </Grid>
                            <p className="noteHelp">Don't have an account? <Link to="/register">Create free account</Link>
                            </p>
                        </Grid>
                    </Grid>
                </form>
                <div className="demo-accounts" style={{ marginTop: '30px', paddingTop: '25px', borderTop: '1px solid #eee' }}>
                    <p style={{ fontWeight: 600, marginBottom: '15px' }}>Demo Accounts</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {demoAccounts.map((acc) => (
                            <Button
                                key={acc.slug}
                                variant="outlined"
                                size="small"
                                onClick={() => push(`/dashboard/${acc.slug}`)}
                                style={{ textTransform: 'none' }}
                            >
                                {acc.label}
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