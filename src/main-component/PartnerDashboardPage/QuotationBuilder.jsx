import React, { useMemo, useState } from 'react';
import './quotationBuilder.css';
import TaskSheetModal, { emptyTaskSheet } from './TaskSheetModal';
import JobsheetPreviewModal from './JobsheetPreviewModal';
import SummarySheetPreviewModal from './SummarySheetPreviewModal';
import InvoicePreviewModal from './InvoicePreviewModal';

// Qualified team rates (per shift). Operation Supervisor rate is not yet defined in the
// spec, so it's shown as "TBC" and left out of the indicative total rather than guessed.
const FOREMAN_RATE = 165;
const WORKER_RATE = 110;

const emptyForm = {
    partner_name: '',
    partner_email: '',
    partner_phone: '',
    task_title: '',
    considerations: '',
    location_address: '',
    num_foremen: 1,
    num_workers: 2,
    num_operation_supervisors: 0,
    payment_terms: 'upfront',
    requested_stream: 'school',
};

const streamLabels = {
    pre_school: 'Pre-School',
    school: 'School',
    technical_services: 'Technical Services',
};

const fmt = (n) => 'R ' + (isFinite(n) ? n : 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const todayDisplay = () =>
    new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

const QuotationBuilder = ({ onSubmit, submitting }) => {
    const [form, setForm] = useState(emptyForm);
    const [taskSheetOpen, setTaskSheetOpen] = useState(false);
    const [docModal, setDocModal] = useState(null);
    const [taskSheetComplete, setTaskSheetComplete] = useState(false);
    const [taskSheetSummary, setTaskSheetSummary] = useState('');
    const [taskSheetData, setTaskSheetData] = useState(emptyTaskSheet());
    const [attention, setAttention] = useState(false);

    const change = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const foremen = Number(form.num_foremen) || 0;
    const workers = Number(form.num_workers) || 0;
    const supervisors = Number(form.num_operation_supervisors) || 0;

    const rows = useMemo(() => {
        const r = [];
        if (foremen > 0) r.push({ role: 'Foreman', rate: FOREMAN_RATE, qty: foremen, total: FOREMAN_RATE * foremen });
        if (workers > 0) r.push({ role: 'Worker', rate: WORKER_RATE, qty: workers, total: WORKER_RATE * workers });
        if (supervisors > 0) r.push({ role: 'Operation Supervisor', rate: null, qty: supervisors, total: null });
        return r;
    }, [foremen, workers, supervisors]);

    const indicativeTotal = rows.reduce((sum, r) => sum + (r.total || 0), 0);

    const reset = () => {
        setForm(emptyForm);
        setTaskSheetComplete(false);
        setTaskSheetSummary('');
        setTaskSheetData(emptyTaskSheet());
    };

    const openTaskSheet = () => setTaskSheetOpen(true);
    const closeTaskSheet = () => setTaskSheetOpen(false);

    const saveTaskSheet = (summaryText, data) => {
        setTaskSheetSummary(summaryText);
        setTaskSheetData(data);
        setTaskSheetComplete(true);
        setTaskSheetOpen(false);
    };

    const handleSubmit = () => {
        if (!form.partner_name.trim()) return;
        if (!taskSheetComplete) {
            setAttention(true);
            setTimeout(() => setAttention(false), 900);
            document.getElementById('qb-tasksheet-trigger')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        const combinedDetails = [
            form.task_title && `Task: ${form.task_title}`,
            taskSheetSummary,
            form.considerations && `Considerations: ${form.considerations}`,
        ].filter(Boolean).join('\n\n');

        onSubmit({
            partner_name: form.partner_name,
            partner_email: form.partner_email,
            partner_phone: form.partner_phone,
            task_details: combinedDetails,
            location_address: form.location_address,
            num_foremen: foremen,
            num_workers: workers,
            num_operation_supervisors: supervisors,
            payment_terms: form.payment_terms,
            requested_stream: form.requested_stream,
        }, reset);
    };

    return (
        <div className="qb-app">
            <div className="qb-header">
                <div>
                    <span className="qb-eyebrow">Build One Zambia &middot; Partner Dashboard</span>
                    <h2>Quotation Request Builder</h2>
                </div>
                <div className="qb-header-actions">
                    <button className="qb-btn" type="button" onClick={() => setDocModal('jobsheet')}>View Jobsheet</button>
                    <button className="qb-btn" type="button" onClick={() => setDocModal('summary')}>View Summary Sheet</button>
                    <button className="qb-btn" type="button" onClick={() => setDocModal('invoice')}>View Invoice</button>
                    <button className="qb-btn" type="button" onClick={reset}>Clear form</button>
                    <button className="qb-btn qb-primary" type="button" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Submitting…' : 'Submit quotation request'}
                    </button>
                </div>
            </div>

            <div className="qb-layout">
                {/* ================= FORM SIDE ================= */}
                <div className="qb-form-side">
                    <div className="qb-perf"></div>

                    <div className="qb-section-label">Reference</div>
                    <div className="qb-field">
                        <label>Partner / Organisation Name *</label>
                        <input name="partner_name" value={form.partner_name} onChange={change} placeholder="e.g. Sonstraal Primary School" />
                    </div>
                    <div className="qb-field-row">
                        <div className="qb-field">
                            <label>Email</label>
                            <input name="partner_email" type="email" value={form.partner_email} onChange={change} />
                        </div>
                        <div className="qb-field">
                            <label>Phone</label>
                            <input name="partner_phone" value={form.partner_phone} onChange={change} />
                        </div>
                    </div>

                    <div className="qb-section-label">Task</div>
                    <div className="qb-field">
                        <label>Task title</label>
                        <input name="task_title" value={form.task_title} onChange={change} placeholder="e.g. Grounds clean-up & refuse removal" />
                    </div>
                    <div className="qb-field">
                        <label>
                            Task detail <span className="qb-required-flag">required — opens Task Sheet</span>
                        </label>
                        <button
                            id="qb-tasksheet-trigger"
                            type="button"
                            className={`qb-tasksheet-trigger ${taskSheetComplete ? 'qb-is-complete' : ''} ${attention ? 'qb-attention' : ''}`}
                            onClick={openTaskSheet}
                        >
                            <span className="qb-tasksheet-trigger-icon" aria-hidden="true">📄</span>
                            <span className="qb-tasksheet-trigger-text">
                                {taskSheetComplete
                                    ? `Task Sheet completed — "${taskSheetData.shiftTitle}" (${taskSheetData.tasks.length} task${taskSheetData.tasks.length === 1 ? '' : 's'}). Click to review or edit.`
                                    : 'Click to open the Task Sheet and enter task detail'}
                            </span>
                            <span className="qb-tasksheet-trigger-arrow" aria-hidden="true">→</span>
                        </button>
                    </div>
                    <div className="qb-field">
                        <label>Considerations</label>
                        <textarea name="considerations" value={form.considerations} onChange={change} placeholder="Access, timing, site conditions, safety notes" />
                    </div>
                    <div className="qb-field">
                        <label>Job location (address)</label>
                        <input name="location_address" value={form.location_address} onChange={change} placeholder="Street, area, city" />
                    </div>

                    <div className="qb-section-label">Team Requested</div>
                    <div className="qb-costing-block">
                        <div className="qb-cost-item">
                            <div className="qb-cost-item-name">Foreman — R{FOREMAN_RATE} / shift</div>
                            <div className="qb-cost-item-grid">
                                <div><label>No. required</label><input type="number" min="0" name="num_foremen" value={form.num_foremen} onChange={change} /></div>
                                <div><label>Line total</label><input value={fmt(FOREMAN_RATE * foremen)} readOnly /></div>
                            </div>
                        </div>
                        <div className="qb-cost-item">
                            <div className="qb-cost-item-name">Worker — R{WORKER_RATE} / shift</div>
                            <div className="qb-cost-item-grid">
                                <div><label>No. required</label><input type="number" min="0" name="num_workers" value={form.num_workers} onChange={change} /></div>
                                <div><label>Line total</label><input value={fmt(WORKER_RATE * workers)} readOnly /></div>
                            </div>
                        </div>
                        <div className="qb-cost-item">
                            <div className="qb-cost-item-name">Operation Supervisor — rate TBC</div>
                            <div className="qb-cost-item-grid">
                                <div><label>No. required</label><input type="number" min="0" name="num_operation_supervisors" value={form.num_operation_supervisors} onChange={change} /></div>
                                <div><label>Line total</label><input value="Confirmed by Ops" readOnly /></div>
                            </div>
                        </div>
                    </div>
                    <div className="qb-field-row">
                        <div className="qb-field">
                            <label>Payment terms</label>
                            <select name="payment_terms" value={form.payment_terms} onChange={change}>
                                <option value="upfront">Upfront</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div className="qb-field">
                            <label>Operation stream</label>
                            <select name="requested_stream" value={form.requested_stream} onChange={change}>
                                <option value="pre_school">Pre-School</option>
                                <option value="school">School</option>
                                <option value="technical_services">Technical Services</option>
                            </select>
                        </div>
                    </div>
                    <div className="qb-rate-note">
                        Foreman and Worker line totals are indicative, at standard qualified rates. Operation Supervisor
                        pricing and the final quotation amount are confirmed by the Operation Office during approval.
                    </div>
                </div>

                {/* ================= DOCUMENT PREVIEW SIDE ================= */}
                <div className="qb-doc-side">
                    <div className="qb-doc-scroll">
                        <div className="qb-doc-letterhead">
                            <div className="qb-doc-org-block">
                                <div className="qb-doc-org-mark">VK</div>
                                <div>
                                    <p className="qb-doc-org-name">Vincent Kafula — Build One Zambia</p>
                                    <p className="qb-doc-org-sub">Vision · Integrity · Impact</p>
                                    <div className="qb-doc-org-contact">
                                        37 Chiappini Street, St Andrew's Presbyterian Church, Cape Town<br />
                                        0614615035 &nbsp;&middot;&nbsp; vincent.kafula@gmail.com
                                    </div>
                                </div>
                            </div>
                            <div className="qb-doc-refs">
                                Date: <b>{todayDisplay()}</b><br />
                                Serial No.: <b>Assigned on approval</b><br />
                                From: <b>{form.partner_name || '—'}</b>
                            </div>
                        </div>

                        <h2 className="qb-doc-title"><span className="qb-accent-bar"></span> Quotation Request</h2>

                        <dl className="qb-doc-field-row">
                            <dt>Task title</dt>
                            <dd className={form.task_title ? '' : 'qb-placeholder'}>{form.task_title || 'Not yet entered'}</dd>
                        </dl>
                        <dl className="qb-doc-field-row">
                            <dt>Task detail</dt>
                            <dd className={taskSheetSummary ? '' : 'qb-placeholder'}>{taskSheetSummary || 'Not yet entered'}</dd>
                        </dl>
                        <dl className="qb-doc-field-row">
                            <dt>Considerations</dt>
                            <dd className={form.considerations ? '' : 'qb-placeholder'}>{form.considerations || 'Not yet entered'}</dd>
                        </dl>
                        <dl className="qb-doc-field-row">
                            <dt>Location</dt>
                            <dd className={form.location_address ? '' : 'qb-placeholder'}>{form.location_address || 'Not yet entered'}</dd>
                        </dl>
                        <dl className="qb-doc-field-row">
                            <dt>Payment terms</dt>
                            <dd style={{ textTransform: 'capitalize' }}>{form.payment_terms}</dd>
                        </dl>
                        <dl className="qb-doc-field-row">
                            <dt>Stream</dt>
                            <dd>{streamLabels[form.requested_stream]}</dd>
                        </dl>

                        <div className="qb-doc-costing-title">Team Requested</div>
                        <table className="qb-doc-costing">
                            <thead>
                                <tr>
                                    <th>Role</th>
                                    <th className="qb-num">Rate / shift</th>
                                    <th className="qb-num">Qty</th>
                                    <th className="qb-num">Line total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr className="qb-empty-row"><td colSpan={4}>No team members requested yet</td></tr>
                                ) : rows.map((r) => (
                                    <tr key={r.role}>
                                        <td className="qb-item-name">{r.role}</td>
                                        <td className="qb-num">{r.rate ? fmt(r.rate) : 'TBC'}</td>
                                        <td className="qb-num">{r.qty}</td>
                                        <td className="qb-num">{r.total !== null ? fmt(r.total) : 'Confirmed by Ops'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="qb-doc-totals">
                            <div className="qb-doc-totals-row qb-grand">
                                <span>Indicative labour total</span>
                                <span>{fmt(indicativeTotal)}</span>
                            </div>
                        </div>

                        <div className="qb-doc-conditions">
                            <h4>Quotation conditions</h4>
                            <p>
                                This document reflects your request as entered and is indicative only. The final quotation
                                amount is set by the Operation Office once operational feasibility and scheduling have been
                                confirmed, and is subject to Manager approval before work begins.
                            </p>
                            <h4>Payment conditions</h4>
                            <p>
                                Upfront-terms accounts must settle the invoice before the service is scheduled. Monthly-terms
                                accounts are invoiced at month end, subject to Manager approval of the payment arrangement.
                            </p>
                        </div>

                        <div className="qb-doc-footer">
                            <div className="qb-tagline-af">Vision · Integrity · Impact</div>
                            <div className="qb-tagline-en">Build One Zambia</div>
                        </div>
                    </div>
                </div>
            </div>

            <TaskSheetModal
                open={taskSheetOpen}
                onClose={closeTaskSheet}
                onSave={saveTaskSheet}
                initial={taskSheetData}
                defaultTitle={form.task_title}
                defaultDate=""
            />

            <JobsheetPreviewModal
                open={docModal === 'jobsheet'}
                onClose={() => setDocModal(null)}
                onNavigate={(which) => setDocModal(which)}
            />
            <SummarySheetPreviewModal
                open={docModal === 'summary'}
                onClose={() => setDocModal(null)}
                onNavigate={(which) => setDocModal(which)}
            />
            <InvoicePreviewModal
                open={docModal === 'invoice'}
                onClose={() => setDocModal(null)}
                onNavigate={(which) => setDocModal(which)}
                fromName={form.partner_name}
                taskTitle={form.task_title}
                rows={rows}
                total={indicativeTotal}
            />
        </div>
    );
};

export default QuotationBuilder;
