import React, { useState } from 'react';

const DEFAULT_TASKS = [
    "Report for roll call at the designated depot/site at the start of the shift and confirm team attendance.",
    "Carry out the assigned task using proper safety practices and equipment throughout the shift.",
    "Keep the work area clean, orderly, and safe for the public and team members.",
    "Record materials issued, used, and returned (bags and gloves) on the Shift Slip.",
    "Report any incidents, delays, or interruptions during the shift, noting the time and cause.",
    "Return to the depot at the end of the shift for equipment return and sign-off.",
    "Note any suggestions for improving performance on future shifts.",
];

const emptyTaskSheet = () => ({
    shiftTitle: '',
    shiftTime: 'AM Roll Call (07:30) — full shift',
    day: '',
    date: '',
    tasks: [...DEFAULT_TASKS],
    gloves: '',
    bags: '',
    minutes: '',
    otherMaterials: '',
    special: '',
});

export { emptyTaskSheet };

const TaskSheetModal = ({ open, onClose, onSave, initial, defaultTitle, defaultDate }) => {
    const [data, setData] = useState(initial || emptyTaskSheet());

    // Re-seed from parent-provided defaults the first time the modal opens with an empty title.
    React.useEffect(() => {
        if (open) {
            setData((d) => ({
                ...d,
                shiftTitle: d.shiftTitle || defaultTitle || '',
                date: d.date || defaultDate || '',
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    if (!open) return null;

    const change = (field, value) => setData((d) => ({ ...d, [field]: value }));

    const changeTask = (i, value) => {
        const tasks = [...data.tasks];
        tasks[i] = value;
        setData((d) => ({ ...d, tasks }));
    };
    const removeTask = (i) => {
        const tasks = data.tasks.filter((_, idx) => idx !== i);
        setData((d) => ({ ...d, tasks }));
    };
    const addTask = () => setData((d) => ({ ...d, tasks: [...d.tasks, ''] }));

    const save = () => {
        const tasks = data.tasks.map((t) => t.trim()).filter(Boolean);
        if (!data.shiftTitle.trim() || tasks.length === 0) {
            window.alert('Please give the shift a title and at least one specific task before saving.');
            return;
        }

        const lines = [];
        lines.push(`Shift: ${data.shiftTitle} — ${data.shiftTime}`);
        if (data.day || data.date) lines.push(`Day/Date: ${[data.day, data.date].filter(Boolean).join(' / ')}`);
        lines.push('');
        lines.push('Specific tasks:');
        tasks.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
        const materialsBits = [];
        if (data.gloves) materialsBits.push(`${data.gloves} gloves`);
        if (data.bags) materialsBits.push(`${data.bags} bags`);
        if (data.otherMaterials) materialsBits.push(data.otherMaterials);
        if (materialsBits.length) {
            lines.push('');
            lines.push(`Materials needed: ${materialsBits.join(', ')}`);
        }
        if (data.minutes) lines.push(`Estimated time on the job: ${data.minutes} minutes`);
        if (data.special) {
            lines.push('');
            lines.push(`Special instructions: ${data.special}`);
        }

        onSave(lines.join('\n'), { ...data, tasks });
    };

    return (
        <div className={`qb-modal-overlay qb-open`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="qb-modal-dialog" role="dialog" aria-modal="true">
                <div className="qb-modal-head">
                    <div>
                        <h2>Task Sheet</h2>
                        <span className="qb-modal-sub">Attached document · fill in before submitting the quotation request</span>
                    </div>
                    <button className="qb-modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
                </div>

                <div className="qb-modal-body">
                    <div className="qb-ts-meta-grid">
                        <div className="qb-ts-field">
                            <label>Shift title</label>
                            <input value={data.shiftTitle} onChange={(e) => change('shiftTitle', e.target.value)} placeholder="e.g. Grounds clean-up" />
                        </div>
                        <div className="qb-ts-field">
                            <label>Shift session</label>
                            <select value={data.shiftTime} onChange={(e) => change('shiftTime', e.target.value)}>
                                <option>AM Roll Call (07:30) — full shift</option>
                                <option>PM Roll Call (12:30) — full shift</option>
                                <option>Full day (AM + PM)</option>
                            </select>
                        </div>
                        <div className="qb-ts-field">
                            <label>Day</label>
                            <input value={data.day} onChange={(e) => change('day', e.target.value)} placeholder="e.g. Wednesday" />
                        </div>
                        <div className="qb-ts-field">
                            <label>Date</label>
                            <input type="date" value={data.date} onChange={(e) => change('date', e.target.value)} />
                        </div>
                    </div>

                    <div className="qb-ts-ref-block">
                        <div className="qb-ts-ref-columns">
                            <div>
                                <h4>Objectives of the shift</h4>
                                <ol>
                                    <li>Complete the assigned task to the required standard within the shift.</li>
                                    <li>Keep the work site clean, safe, and orderly throughout the shift.</li>
                                    <li>Train team members in proper reporting and site leadership.</li>
                                    <li>Track materials (bags, gloves) accurately from issue to return.</li>
                                </ol>
                            </div>
                            <div>
                                <h4>General instructions for the shift</h4>
                                <ol>
                                    <li>Prepare for the shift the day before — confirm team, location, and task list.</li>
                                    <li>Report at roll call (07:30 or 12:30) and collect equipment using the Shift Slip.</li>
                                    <li>Carry out the specific tasks below and report on them via the Jobsheet at the end of the shift.</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className="qb-ts-section-title">Specific tasks <span className="qb-ts-section-hint">— edit to match this job, or add your own</span></div>
                    <div>
                        {data.tasks.map((t, i) => (
                            <div className="qb-ts-task-row" key={i}>
                                <div className="qb-ts-task-num">{i + 1}.</div>
                                <textarea rows={2} value={t} onChange={(e) => changeTask(i, e.target.value)} />
                                <button type="button" className="qb-ts-task-remove" aria-label="Remove task" onClick={() => removeTask(i)}>×</button>
                            </div>
                        ))}
                    </div>
                    <button type="button" className="qb-ts-add-task" onClick={addTask}>+ Add task</button>

                    <div className="qb-ts-section-title">Materials needed <span className="qb-ts-section-hint">— estimate for this job</span></div>
                    <div className="qb-ts-materials-grid">
                        <div className="qb-ts-field">
                            <label>Gloves needed</label>
                            <input inputMode="numeric" value={data.gloves} onChange={(e) => change('gloves', e.target.value)} placeholder="e.g. 4" />
                        </div>
                        <div className="qb-ts-field">
                            <label>Bags needed</label>
                            <input inputMode="numeric" value={data.bags} onChange={(e) => change('bags', e.target.value)} placeholder="e.g. 10" />
                        </div>
                        <div className="qb-ts-field">
                            <label>Estimated minutes on the job</label>
                            <input inputMode="numeric" value={data.minutes} onChange={(e) => change('minutes', e.target.value)} placeholder="e.g. 240" />
                        </div>
                    </div>
                    <div className="qb-ts-field">
                        <label>Other materials (specify type &amp; quantity)</label>
                        <input value={data.otherMaterials} onChange={(e) => change('otherMaterials', e.target.value)} placeholder="e.g. 2 extra bibs, 1 extra broom" />
                    </div>

                    <div className="qb-ts-section-title">Special instructions for the shift</div>
                    <div className="qb-ts-field">
                        <label>Access instructions, hazards, on-site contact, timing constraints…</label>
                        <textarea value={data.special} onChange={(e) => change('special', e.target.value)} />
                    </div>
                </div>

                <div className="qb-modal-foot">
                    <span className="qb-modal-foot-label">Task Sheet · Build One Zambia</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="qb-btn" type="button" onClick={onClose}>Cancel</button>
                        <button className="qb-btn qb-primary" type="button" onClick={save}>Save &amp; insert task detail</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskSheetModal;
