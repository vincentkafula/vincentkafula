import React, { useState } from 'react';
import Grid from "@mui/material/Grid";
import SimpleReactValidator from "simple-react-validator";
import { toast } from "react-toastify";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";

import './style.scss';

const CheckWrap = (props) => {

    const push = useNavigate()

    const [value, setValue] = useState({
        email: 'user@gmail.com',
        password: '123456',
        card_holder: 'Jhon Doe',
        card_number: '589622144',
        cvv: '856226',
        expire_date: '',
        remember: false,
    });

    const changeHandler = (e) => {
        setValue({ ...value, [e.target.name]: e.target.value });
        validator.showMessages();
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
                card_holder: '',
                card_number: '',
                cvv: '',
                expire_date: '',
                remember: false
            });
            validator.hideMessages();

            const userRegex = /^user+.*/gm;
            const email = value.email;

            if (email.match(userRegex)) {
                toast.success('Order Recived sucessfully!');
                push('/order_received');
            } else {
                toast.info('user not existed!');
                alert('user not existed! credential is : user@*****.com | vendor@*****.com | admin@*****.com');
            }
        } else {
            validator.showMessages();
            toast.error('Empty field is not allowed!');
        }
    };
    return (
        <div className="cardbp mt-20">
            <div>
                <form onSubmit={submitForm}>

                    <div className="row g-3">

                        <div className="col-md-6 col-12">
                            <TextField
                                fullWidth
                                label="Card holder Name"
                                name="card_holder"
                                value={value.card_holder}
                                onChange={changeHandler}
                                type="text"
                                InputLabelProps={{ shrink: true }}
                                className="formInput radiusNone"
                            />
                        </div>

                        <div className="col-md-6 col-12">
                            <TextField
                                fullWidth
                                label="Card Number"
                                name="card_number"
                                value={value.card_number}
                                onChange={changeHandler}
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                className="formInput radiusNone"
                            />
                        </div>

                        <div className="col-md-6 col-12">
                            <TextField
                                fullWidth
                                label="CVV"
                                name="cvv"
                                value={value.cvv}
                                onChange={changeHandler}
                                type="text"
                                InputLabelProps={{ shrink: true }}
                                className="formInput radiusNone"
                            />
                        </div>

                        <div className="col-md-6 col-12">
                            <TextField
                                fullWidth
                                label="Expire Date"
                                name="expire_date"
                                value={value.expire_date}
                                onChange={changeHandler}
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                className="formInput radiusNone"
                            />
                        </div>

                        <div className="col-12">
                            <div className="formFooter mt-20">
                                <button className="mt-20 ml-15 theme-btn" type="submit">
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>

    )
};

export default CheckWrap;