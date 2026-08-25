import React, { useState, useMemo } from 'react'
import SimpleReactValidator from 'simple-react-validator';
import Navbar2 from '../../components/Navbar2/Navbar2'
import PageTitle from '../../components/pagetitle/PageTitle'
import Footer from '../../components/footer/Footer'
import Scrollbar from '../../components/scrollbar/scrollbar'
import vImg from '../../images/volunteer.jpg'
import TeamSection from '../../components/TeamSection/TeamSection';
import eczData from '../../data/ecz-locations.json'

const titleCase = (str) => str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());

const VolunteerPage = (props) => {

    const [forms, setForms] = useState({
        name: '',
        province: '',
        district: '',
        constituency: '',
        ward: '',
        pollingStation: '',
        email: '',
        subject: '',
        file: '',
        message: ''
    });
    const [validator] = useState(new SimpleReactValidator({
        className: 'errorMessage'
    }));

    const provinces = useMemo(() => Object.keys(eczData).sort(), []);

    const districts = useMemo(() => {
        if (!forms.province || !eczData[forms.province]) return [];
        return Object.keys(eczData[forms.province]).sort();
    }, [forms.province]);

    const constituencies = useMemo(() => {
        if (!forms.province || !forms.district) return [];
        const d = eczData[forms.province]?.[forms.district];
        return d ? Object.keys(d).sort() : [];
    }, [forms.province, forms.district]);

    const wards = useMemo(() => {
        if (!forms.province || !forms.district || !forms.constituency) return [];
        const c = eczData[forms.province]?.[forms.district]?.[forms.constituency];
        return c ? Object.keys(c).sort() : [];
    }, [forms.province, forms.district, forms.constituency]);

    const pollingStations = useMemo(() => {
        if (!forms.province || !forms.district || !forms.constituency || !forms.ward) return [];
        const stations = eczData[forms.province]?.[forms.district]?.[forms.constituency]?.[forms.ward];
        return stations ? [...stations].sort() : [];
    }, [forms.province, forms.district, forms.constituency, forms.ward]);

    const changeHandler = e => {
        const { name, value } = e.target;
        let updated = { ...forms, [name]: value };

        // reset dependent fields when a parent location field changes
        if (name === 'province') {
            updated = { ...updated, district: '', constituency: '', ward: '', pollingStation: '' };
        } else if (name === 'district') {
            updated = { ...updated, constituency: '', ward: '', pollingStation: '' };
        } else if (name === 'constituency') {
            updated = { ...updated, ward: '', pollingStation: '' };
        } else if (name === 'ward') {
            updated = { ...updated, pollingStation: '' };
        }

        setForms(updated);
        if (validator.allValid()) {
            validator.hideMessages();
        } else {
            validator.showMessages();
        }
    };

    const submitHandler = e => {
        e.preventDefault();
        if (validator.allValid()) {
            validator.hideMessages();
            setForms({
                name: '',
                province: '',
                district: '',
                constituency: '',
                ward: '',
                pollingStation: '',
                email: '',
                subject: '',
                file: '',
                message: ''
            })
        } else {
            validator.showMessages();
        }
    };

    return (
        <div className="volunteer-page">
            <Navbar2 />
            <PageTitle pageTitle={'Volunteer'} pagesub={'Volunteer'} />
            <div className="volunteer-area">
                <div className="volunteer-wrap">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-10">
                                <div className="volunteer-item">
                                    <div className="volunteer-img-wrap">
                                        <div className="volunter-img">
                                            <img src={vImg} alt="" />
                                        </div>
                                    </div>
                                </div>
                                <div className="volunteer-contact">
                                    <div className="volunteer-contact-form">
                                        <h2>Become a Volunteer</h2>
                                        <form onSubmit={(e) => submitHandler(e)} className="contact-validation-active" id="contact-form-main">
                                            <div className="row">
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                                    <div className="form-field">
                                                        <input
                                                            value={forms.name}
                                                            type="text"
                                                            name="name"
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}
                                                            placeholder="Your Name" />
                                                        {validator.message('name', forms.name, 'required|alpha_space')}
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                                    <div className="form-field">
                                                        <select
                                                            value={forms.province}
                                                            name="province"
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}>
                                                            <option value="">Select Province</option>
                                                            {provinces.map((p) => (
                                                                <option key={p} value={p}>{titleCase(p)}</option>
                                                            ))}
                                                        </select>
                                                        {validator.message('province', forms.province, 'required')}
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group clearfix">
                                                    <div className="form-field">
                                                        <select
                                                            value={forms.district}
                                                            name="district"
                                                            disabled={!forms.province}
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}>
                                                            <option value="">Select District</option>
                                                            {districts.map((d) => (
                                                                <option key={d} value={d}>{titleCase(d)}</option>
                                                            ))}
                                                        </select>
                                                        {validator.message('district', forms.district, 'required')}
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                                    <div className="form-field">
                                                        <select
                                                            value={forms.constituency}
                                                            name="constituency"
                                                            disabled={!forms.district}
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}>
                                                            <option value="">Select Constituency</option>
                                                            {constituencies.map((c) => (
                                                                <option key={c} value={c}>{titleCase(c)}</option>
                                                            ))}
                                                        </select>
                                                        {validator.message('constituency', forms.constituency, 'required')}
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group clearfix">
                                                    <div className="form-field">
                                                        <select
                                                            value={forms.ward}
                                                            name="ward"
                                                            disabled={!forms.constituency}
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}>
                                                            <option value="">Select Ward</option>
                                                            {wards.map((w) => (
                                                                <option key={w} value={w}>{titleCase(w)}</option>
                                                            ))}
                                                        </select>
                                                        {validator.message('ward', forms.ward, 'required')}
                                                    </div>
                                                </div>
                                                <div className="col-lg-12 col-12 form-group">
                                                    <div className="form-field">
                                                        <select
                                                            value={forms.pollingStation}
                                                            name="pollingStation"
                                                            disabled={!forms.ward}
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}>
                                                            <option value="">Select Polling Station</option>
                                                            {pollingStations.map((s) => (
                                                                <option key={s} value={s}>{titleCase(s)}</option>
                                                            ))}
                                                        </select>
                                                        {validator.message('pollingStation', forms.pollingStation, 'required')}
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group clearfix">
                                                    <div className="form-field">
                                                        <input
                                                            value={forms.email}
                                                            type="email"
                                                            name="email"
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}
                                                            placeholder="Your Email" />
                                                        {validator.message('email', forms.email, 'required|email')}
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                                    <div className="form-field">
                                                        <input
                                                            value={forms.subject}
                                                            type="text"
                                                            name="subject"
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}
                                                            placeholder="Your subject" />
                                                        {validator.message('subject', forms.subject, 'required|alpha_space')}
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group form-group-in">
                                                    <label htmlFor="file">Upload Your CV</label>
                                                    <input
                                                        value={forms.file}
                                                        type="file"
                                                        name="file"
                                                        id='file'
                                                        onBlur={(e) => changeHandler(e)}
                                                        onChange={(e) => changeHandler(e)}
                                                        placeholder="Your Email" />
                                                    {validator.message('file', forms.file, 'required|file')}
                                                    <i className="ti-cloud-up"></i>
                                                </div>
                                                <div className="col-lg-12 col-12 form-group">
                                                    <textarea
                                                        onBlur={(e) => changeHandler(e)}
                                                        onChange={(e) => changeHandler(e)}
                                                        value={forms.message}
                                                        type="text"
                                                        name="message"
                                                        placeholder="Message">
                                                    </textarea>
                                                    {validator.message('message', forms.message, 'required')}
                                                </div>
                                                <div className="submit-area col-lg-12 col-12">
                                                    <button type="submit" className="theme-btn submit-btn">Send Message</button>
                                                    <div id="loader">
                                                        <i className="ti-reload"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="clearfix error-handling-messages">
                                                <div id="success">Thank you</div>
                                                <div id="error"> Error occurred while sending email. Please try again later.
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <TeamSection tmClass={'s2'}/>
            </div>
            <Footer />
            <Scrollbar />
        </div>

    )
}

export default VolunteerPage;
