import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import eczData from '../../data/ecz-locations.json';
import { registrationsApi, readFileAsBase64 } from '../../api/registrationsApi';
import { RegistrationHero } from './RegistrationPage';
import './registration.css';

const COOP_SIZE = 20;
const MEMBER_NO_RE = /^BOZ-\d{6}$/;
const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const top = () => window.scrollTo({ top: 300, behavior: 'smooth' });

// ---------- shared pieces ----------
const Layout = ({ title, intro, steps, step, children }) => {
    useEffect(() => { document.title = `${title} | Vincent Kafula — Build One Zambia`; }, [title]);
    return (
        <Fragment>
            <Navbar2 />
            <main className="rg">
                <RegistrationHero />
                <section className="rg-form-wrap">
                    <div className="container">
                        <div className="rg-form">
                            <Link to="/register" className="rg-back"><i className="fa fa-chevron-left" aria-hidden="true"></i> All registration types</Link>
                            <h2>{title}</h2>
                            <p>{intro}</p>
                            {steps && (
                                <ol className="rg-steps" aria-label="Progress">
                                    {steps.map((s, i) => (
                                        <li key={s} className={i < step ? 'done' : i === step ? 'active' : ''} aria-current={i === step ? 'step' : undefined}>{s}</li>
                                    ))}
                                </ol>
                            )}
                            {children}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

const Field = ({ label, hint, full, children }) => (
    <div className={`rg-field${full ? ' full' : ''}`}>
        <label>{label}{children}</label>
        {hint && <div className="hint">{hint}</div>}
    </div>
);

const LocationFields = ({ value, onChange }) => {
    const provinces = Object.keys(eczData);
    const districts = value.province ? Object.keys(eczData[value.province] || {}) : [];
    const constituencies = value.district ? Object.keys(eczData[value.province]?.[value.district] || {}) : [];
    const wards = value.constituency ? Object.keys(eczData[value.province]?.[value.district]?.[value.constituency] || {}) : [];
    const set = (key, v) => {
        const reset = { province: ['district', 'constituency', 'ward'], district: ['constituency', 'ward'], constituency: ['ward'], ward: [] }[key];
        const next = { ...value, [key]: v };
        reset.forEach((k) => { next[k] = ''; });
        onChange(next);
    };
    const select = (key, label, options) => (
        <Field label={label}>
            <select value={value[key]} onChange={(e) => set(key, e.target.value)} disabled={!options.length}>
                <option value="">Select {label.toLowerCase()}</option>
                {options.map((o) => <option key={o} value={o}>{titleCase(o)}</option>)}
            </select>
        </Field>
    );
    return (
        <>
            {select('province', 'Province', provinces)}
            {select('district', 'District', districts)}
            {select('constituency', 'Constituency', constituencies)}
            {select('ward', 'Ward', wards)}
        </>
    );
};

const FileField = ({ label, hint, file, onFile }) => (
    <Field label={label} hint={file ? `Selected: ${file.name}` : hint} full>
        <input type="file" accept=".pdf,.doc,.docx,image/png,image/jpeg"
            onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size > 5 * 1024 * 1024) { alert('Files must be smaller than 5 MB.'); e.target.value = ''; return; }
                onFile(f || null);
            }} />
    </Field>
);

const toDoc = async (kind, file) => (file ? { kind, file_name: file.name, mime_type: file.type, data_base64: await readFileAsBase64(file) } : null);

// Sends the emailed code and collects it. `target` is { email } or { membership_no }.
const VerifyStep = ({ target, code, setCode, children }) => {
    const [sentTo, setSentTo] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const send = async () => {
        setBusy(true); setErr('');
        try { const r = await registrationsApi.sendCode(target); setSentTo(r.sent_to); } catch (e) { setErr(e.message); } finally { setBusy(false); }
    };
    return (
        <div>
            {children}
            <div className="rg-note">
                <strong><i className="fa fa-lock" aria-hidden="true"></i> Two-factor verification.</strong>{' '}
                We will email a 6-digit code to {target.email ? 'your email address' : 'the email address registered with this membership number'}. Enter it below to submit.
            </div>
            <button type="button" className="rg-btn secondary small" onClick={send} disabled={busy}>
                <i className="fa fa-envelope" aria-hidden="true"></i> {sentTo ? 'Send a new code' : 'Send verification code'}
            </button>
            {sentTo && <p style={{ marginTop: 10 }}>Code sent to <strong>{sentTo}</strong>. It expires in 10 minutes.</p>}
            {err && <div className="rg-error" role="alert">{err}</div>}
            <div className="rg-field" style={{ marginTop: 16 }}>
                <label>Verification code
                    <input className="rg-otp" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" />
                </label>
            </div>
        </div>
    );
};

const Actions = ({ step, last, busy, onBack, onNext }) => (
    <div className="rg-actions">
        {step > 0 ? <button type="button" className="rg-btn secondary" onClick={onBack} disabled={busy}>Back</button> : <span />}
        <button type="button" className="rg-btn" onClick={onNext} disabled={busy}>
            {busy ? 'Please wait…' : last ? 'Submit' : 'Continue'} {!busy && <i className="fa fa-arrow-right" aria-hidden="true"></i>}
        </button>
    </div>
);

const Success = ({ title, reference, children }) => (
    <div className="rg-success" role="status">
        <i className="fa fa-check-circle" aria-hidden="true"></i>
        <h3 style={{ marginTop: 14 }}>{title}</h3>
        <div className="rg-ref">{reference}</div>
        {children}
        <div style={{ marginTop: 20 }}><Link className="rg-btn small" to="/register">Back to registration</Link></div>
    </div>
);

const ageOf = (dob) => {
    const d = new Date(dob); if (Number.isNaN(d.getTime())) return -1;
    const n = new Date(); let a = n.getFullYear() - d.getFullYear();
    if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a -= 1;
    return a;
};

// ---------- Membership ----------
export const MembershipForm = () => {
    const steps = ['Personal information', 'Location details', 'Document upload', 'Verification'];
    const [step, setStep] = useState(0);
    const [f, setF] = useState({ first_name: '', last_name: '', date_of_birth: '', nrc_number: '', phone: '', email: '' });
    const [loc, setLoc] = useState({ province: '', district: '', constituency: '', ward: '' });
    const [files, setFiles] = useState({ nrc_front: null, nrc_back: null, photo: null });
    const [decl, setDecl] = useState({ citizen: false, principles: false, privacy: false });
    const [code, setCode] = useState('');
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(null);
    const ch = (e) => setF({ ...f, [e.target.name]: e.target.value });

    const validate = () => {
        if (step === 0) {
            if (!f.first_name.trim() || !f.last_name.trim()) return 'Enter your first and last name.';
            const age = ageOf(f.date_of_birth);
            if (age < 0) return 'Enter your date of birth.';
            if (age < 18) return 'Membership is open to Zambians aged 18 or older.';
            if (!/^\d{6}\/\d{2}\/\d$/.test(f.nrc_number.trim())) return 'Enter your NRC number in the format 123456/78/1.';
            if (!/^[+\d\s()-]{9,20}$/.test(f.phone.trim())) return 'Enter a valid phone number.';
            if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return 'Enter a valid email address.';
        }
        if (step === 1 && (!loc.province || !loc.district || !loc.constituency || !loc.ward)) return 'Select your province, district, constituency and ward.';
        if (step === 2 && !files.nrc_front) return 'Upload a copy of the front of your NRC.';
        if (step === 3) {
            if (!decl.citizen || !decl.principles || !decl.privacy) return 'Please confirm all the declarations.';
            if (code.length !== 6) return 'Enter the 6-digit verification code sent to your email.';
        }
        return '';
    };

    const next = async () => {
        const v = validate(); setErr(v); if (v) return;
        if (step < 3) { setStep(step + 1); top(); return; }
        setBusy(true);
        try {
            const documents = (await Promise.all(Object.entries(files).map(([k, file]) => toDoc(k, file)))).filter(Boolean);
            const r = await registrationsApi.membership({ ...f, ...loc, documents, otp: code,
                declaration_citizen: decl.citizen, declaration_principles: decl.principles, declaration_privacy: decl.privacy });
            setDone(r.membership_no); top();
        } catch (e) { setErr(e.message); } finally { setBusy(false); }
    };

    if (done) {
        return (
            <Layout title="Membership Registration" intro="">
                <Success title="Thank you for registering. Your membership number is:" reference={done}>
                    <p>We have emailed it to you. Keep it safe: you will need it to join a cooperative or apply for an internship. Your registration will now be reviewed.</p>
                </Success>
            </Layout>
        );
    }

    return (
        <Layout title="Membership Registration" intro="Register as an individual member. Membership is open to every Zambian aged 18 or older, regardless of tribe, race, colour or creed, who accepts Build One Zambia’s principles, policies and programmes." steps={steps} step={step}>
            {step === 0 && (
                <div className="rg-grid">
                    <Field label="First name"><input name="first_name" value={f.first_name} onChange={ch} autoComplete="given-name" /></Field>
                    <Field label="Last name"><input name="last_name" value={f.last_name} onChange={ch} autoComplete="family-name" /></Field>
                    <Field label="Date of birth"><input type="date" name="date_of_birth" value={f.date_of_birth} onChange={ch} /></Field>
                    <Field label="NRC number" hint="Format: 123456/78/1"><input name="nrc_number" value={f.nrc_number} onChange={ch} placeholder="123456/78/1" /></Field>
                    <Field label="Phone number"><input type="tel" name="phone" value={f.phone} onChange={ch} autoComplete="tel" placeholder="+260 9XX XXX XXX" /></Field>
                    <Field label="Email address" hint="Your verification code will be sent here."><input type="email" name="email" value={f.email} onChange={ch} autoComplete="email" /></Field>
                </div>
            )}
            {step === 1 && <div className="rg-grid"><LocationFields value={loc} onChange={setLoc} /></div>}
            {step === 2 && (
                <div className="rg-grid">
                    <FileField label="NRC: front (required)" hint="PDF or photo, up to 5 MB" file={files.nrc_front} onFile={(x) => setFiles({ ...files, nrc_front: x })} />
                    <FileField label="NRC: back (optional)" hint="PDF or photo, up to 5 MB" file={files.nrc_back} onFile={(x) => setFiles({ ...files, nrc_back: x })} />
                    <FileField label="Passport-size photo (optional)" hint="JPG or PNG, up to 5 MB" file={files.photo} onFile={(x) => setFiles({ ...files, photo: x })} />
                    <p className="full rg-note">Your documents are stored securely and are only seen by the people who review registrations.</p>
                </div>
            )}
            {step === 3 && (
                <VerifyStep target={{ email: f.email.trim() }} code={code} setCode={setCode}>
                    <label className="rg-check"><input type="checkbox" checked={decl.citizen} onChange={(e) => setDecl({ ...decl, citizen: e.target.checked })} /> I am a Zambian citizen aged 18 or older.</label>
                    <label className="rg-check"><input type="checkbox" checked={decl.principles} onChange={(e) => setDecl({ ...decl, principles: e.target.checked })} /> I accept the principles, policies and programmes of Build One Zambia.</label>
                    <label className="rg-check"><input type="checkbox" checked={decl.privacy} onChange={(e) => setDecl({ ...decl, privacy: e.target.checked })} /> I agree that my details and documents may be used to process my membership, as described in the <Link to="/privacy">privacy policy</Link>.</label>
                </VerifyStep>
            )}
            {err && <div className="rg-error" role="alert">{err}</div>}
            <Actions step={step} last={step === 3} busy={busy} onBack={() => { setErr(''); setStep(step - 1); }} onNext={next} />
        </Layout>
    );
};

// ---------- Cooperative ----------
const useMemberCheck = () => {
    const [results, setResults] = useState({});
    const check = async (no) => {
        const n = no.trim().toUpperCase();
        if (!MEMBER_NO_RE.test(n) || results[n]) return;
        setResults((r) => ({ ...r, [n]: { loading: true } }));
        try {
            const r = await registrationsApi.verifyMember(n);
            setResults((x) => ({ ...x, [n]: r }));
        } catch { setResults((x) => ({ ...x, [n]: undefined })); }
    };
    return [results, check];
};

export const CooperativeForm = () => {
    const steps = ['Cooperative details', 'Chief & chairperson', 'Member verification codes', 'Verification'];
    const [step, setStep] = useState(0);
    const [f, setF] = useState({ name: '', activity: '', chief_name: '', chiefdom: '', chair_membership_no: '', chair_phone: '' });
    const [loc, setLoc] = useState({ province: '', district: '', constituency: '', ward: '' });
    const [members, setMembers] = useState(Array(COOP_SIZE - 1).fill(''));
    const [code, setCode] = useState('');
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(null);
    const [checked, check] = useMemberCheck();
    const ch = (e) => setF({ ...f, [e.target.name]: e.target.value });
    const chair = f.chair_membership_no.trim().toUpperCase();
    const all = useMemo(() => [chair, ...members.map((m) => m.trim().toUpperCase())], [chair, members]);

    const validate = () => {
        if (step === 0) {
            if (!f.name.trim() || !f.activity.trim()) return 'Enter the cooperative name and its main activity.';
            if (!loc.province || !loc.district || !loc.constituency || !loc.ward) return 'Select the province, district, constituency and ward.';
        }
        if (step === 1) {
            if (!f.chief_name.trim()) return 'Enter the name of the chief for the area.';
            if (!MEMBER_NO_RE.test(chair)) return 'Enter the chairperson’s membership number, for example BOZ-123456.';
            if (checked[chair] && checked[chair].valid === false) return 'The chairperson’s membership number was not found.';
            if (!/^[+\d\s()-]{9,20}$/.test(f.chair_phone.trim())) return 'Enter the chairperson’s phone number.';
        }
        if (step === 2) {
            if (all.some((m) => !MEMBER_NO_RE.test(m))) return `Enter all ${COOP_SIZE} membership numbers in the format BOZ-123456.`;
            if (new Set(all).size !== COOP_SIZE) return 'Each member can only be listed once.';
            const bad = all.filter((m) => checked[m] && checked[m].valid === false);
            if (bad.length) return `These membership numbers were not found: ${bad.join(', ')}`;
        }
        if (step === 3 && code.length !== 6) return 'Enter the 6-digit verification code.';
        return '';
    };

    const next = async () => {
        const v = validate(); setErr(v); if (v) return;
        if (step === 1) check(chair);
        if (step < 3) { setStep(step + 1); top(); return; }
        setBusy(true);
        try {
            const r = await registrationsApi.cooperative({ ...f, chair_membership_no: chair, ...loc, member_nos: all, otp: code });
            setDone(r.reference_no); top();
        } catch (e) { setErr(e.message); } finally { setBusy(false); }
    };

    if (done) {
        return (
            <Layout title="Cooperative Registration" intro="">
                <Success title="Your cooperative has been registered. Your reference is:" reference={done}>
                    <p>A confirmation has been emailed to the chairperson. The registration will now be reviewed.</p>
                </Success>
            </Layout>
        );
    }

    const status = (no) => {
        const n = no.trim().toUpperCase();
        if (!n) return null;
        if (!MEMBER_NO_RE.test(n)) return <span className="status bad">Format BOZ-123456</span>;
        const r = checked[n];
        if (!r || r.loading) return <span className="status">Checking…</span>;
        return r.valid ? <span className="status ok"><i className="fa fa-check" aria-hidden="true"></i> {r.name}</span> : <span className="status bad">Not found</span>;
    };

    return (
        <Layout title="Cooperative Registration" intro={`Register a farmer cooperative of ${COOP_SIZE} members. Every member, including the chairperson, must first register as an individual member and use their membership number.`} steps={steps} step={step}>
            {step === 0 && (
                <div className="rg-grid">
                    <Field label="Cooperative name"><input name="name" value={f.name} onChange={ch} /></Field>
                    <Field label="Main activity" hint="For example: maize and vegetables, poultry"><input name="activity" value={f.activity} onChange={ch} /></Field>
                    <LocationFields value={loc} onChange={setLoc} />
                </div>
            )}
            {step === 1 && (
                <div className="rg-grid">
                    <Field label="Name of the chief for the area"><input name="chief_name" value={f.chief_name} onChange={ch} /></Field>
                    <Field label="Chiefdom (optional)"><input name="chiefdom" value={f.chiefdom} onChange={ch} /></Field>
                    <Field label="Chairperson’s membership number" hint={status(f.chair_membership_no) || 'For example BOZ-123456'}>
                        <input name="chair_membership_no" value={f.chair_membership_no} onChange={ch} onBlur={() => check(f.chair_membership_no)} placeholder="BOZ-123456" style={{ textTransform: 'uppercase' }} />
                    </Field>
                    <Field label="Chairperson’s phone number"><input type="tel" name="chair_phone" value={f.chair_phone} onChange={ch} /></Field>
                </div>
            )}
            {step === 2 && (
                <div>
                    <p>Enter the membership numbers of all {COOP_SIZE} members. Member 1 is the chairperson.</p>
                    <div className="rg-members">
                        <div className="rg-member"><span className="num">1</span><input value={chair} readOnly aria-label="Member 1 (chairperson)" />{status(chair)}</div>
                        {members.map((m, i) => (
                            <div className="rg-member" key={i}>
                                <span className="num">{i + 2}</span>
                                <input value={m} placeholder="BOZ-123456" aria-label={`Member ${i + 2} membership number`}
                                    onChange={(e) => { const x = [...members]; x[i] = e.target.value; setMembers(x); }}
                                    onBlur={(e) => check(e.target.value)} />
                                {status(m)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {step === 3 && <VerifyStep target={{ membership_no: chair }} code={code} setCode={setCode}><p>The verification code will be sent to the chairperson.</p></VerifyStep>}
            {err && <div className="rg-error" role="alert">{err}</div>}
            <Actions step={step} last={step === 3} busy={busy} onBack={() => { setErr(''); setStep(step - 1); }} onNext={next} />
        </Layout>
    );
};

// ---------- Internship ----------
export const InternshipForm = () => {
    const steps = ['Membership verification', 'University details', 'Course information', 'Verification'];
    const [step, setStep] = useState(0);
    const [f, setF] = useState({ membership_no: '', institution: '', student_number: '', course: '', year_of_study: '', expected_completion: '', motivation: '' });
    const [files, setFiles] = useState({ student_proof: null, cv: null });
    const [code, setCode] = useState('');
    const [member, setMember] = useState(null);
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(null);
    const ch = (e) => setF({ ...f, [e.target.name]: e.target.value });
    const no = f.membership_no.trim().toUpperCase();

    const next = async () => {
        setErr('');
        if (step === 0) {
            if (!MEMBER_NO_RE.test(no)) { setErr('Enter your membership number, for example BOZ-123456.'); return; }
            setBusy(true);
            try {
                const r = await registrationsApi.verifyMember(no);
                if (!r.valid) { setErr('That membership number was not found. Please register as a member first.'); return; }
                setMember(r.name);
            } catch (e) { setErr(e.message); return; } finally { setBusy(false); }
        }
        if (step === 1 && !f.institution.trim()) { setErr('Enter your university or college.'); return; }
        if (step === 2 && (!f.course.trim() || !f.year_of_study)) { setErr('Enter your course and year of study.'); return; }
        if (step < 3) { setStep(step + 1); top(); return; }
        if (code.length !== 6) { setErr('Enter the 6-digit verification code.'); return; }
        setBusy(true);
        try {
            const documents = (await Promise.all(Object.entries(files).map(([k, file]) => toDoc(k, file)))).filter(Boolean);
            const r = await registrationsApi.internship({ ...f, membership_no: no, documents, otp: code });
            setDone(r.reference_no); top();
        } catch (e) { setErr(e.message); } finally { setBusy(false); }
    };

    if (done) {
        return (
            <Layout title="Internship Application" intro="">
                <Success title="Your internship application has been received. Your reference is:" reference={done}>
                    <p>A confirmation has been emailed to you. Applications are reviewed and successful applicants will be contacted.</p>
                </Success>
            </Layout>
        );
    }

    return (
        <Layout title="Internship Application" intro="Apply for the political internship programme. You must be a registered member to apply." steps={steps} step={step}>
            {step === 0 && (
                <div className="rg-grid">
                    <Field label="Membership number" hint={<>Not a member yet? <Link to="/register/membership">Register as a member first</Link>.</>}>
                        <input name="membership_no" value={f.membership_no} onChange={ch} placeholder="BOZ-123456" style={{ textTransform: 'uppercase' }} />
                    </Field>
                </div>
            )}
            {step === 1 && (
                <div className="rg-grid">
                    {member && <p className="full rg-note"><i className="fa fa-check" aria-hidden="true"></i> Membership verified: {member}</p>}
                    <Field label="University or college"><input name="institution" value={f.institution} onChange={ch} /></Field>
                    <Field label="Student number (optional)"><input name="student_number" value={f.student_number} onChange={ch} /></Field>
                    <FileField label="Proof of registration (optional)" hint="Student card or letter, up to 5 MB" file={files.student_proof} onFile={(x) => setFiles({ ...files, student_proof: x })} />
                </div>
            )}
            {step === 2 && (
                <div className="rg-grid">
                    <Field label="Course or programme"><input name="course" value={f.course} onChange={ch} /></Field>
                    <Field label="Year of study">
                        <select name="year_of_study" value={f.year_of_study} onChange={ch}>
                            <option value="">Select year</option>
                            {['1', '2', '3', '4', '5', '6', 'Graduate'].map((y) => <option key={y} value={y}>{y === 'Graduate' ? 'Recent graduate' : `Year ${y}`}</option>)}
                        </select>
                    </Field>
                    <Field label="Expected completion (optional)" hint="For example: December 2027"><input name="expected_completion" value={f.expected_completion} onChange={ch} /></Field>
                    <FileField label="CV (optional)" hint="PDF or Word, up to 5 MB" file={files.cv} onFile={(x) => setFiles({ ...files, cv: x })} />
                    <Field label="Why would you like to join the internship? (optional)" full><textarea name="motivation" value={f.motivation} onChange={ch} /></Field>
                </div>
            )}
            {step === 3 && <VerifyStep target={{ membership_no: no }} code={code} setCode={setCode} />}
            {err && <div className="rg-error" role="alert">{err}</div>}
            <Actions step={step} last={step === 3} busy={busy} onBack={() => { setErr(''); setStep(step - 1); }} onNext={next} />
        </Layout>
    );
};
