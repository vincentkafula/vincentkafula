import React from 'react';

// A small shared UI kit so the newer dashboards (News, Shop, Settings, Account
// management) look like one coherent, more modern admin system rather than
// each page inventing its own styles.

export const DashCard = ({ children, style }) => (
    <div
        style={{
            background: '#fff',
            border: '1px solid #eef0ec',
            borderRadius: '14px',
            boxShadow: '0 6px 24px rgba(18,53,27,0.06)',
            padding: '22px',
            ...style,
        }}
    >
        {children}
    </div>
);

export const DashStat = ({ label, value, accent = '#12351b' }) => (
    <div
        style={{
            background: '#fff',
            border: '1px solid #eef0ec',
            borderRadius: '14px',
            padding: '18px 20px',
            boxShadow: '0 4px 16px rgba(18,53,27,0.05)',
        }}
    >
        <div style={{ fontSize: '26px', fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '13px', color: '#7a8a7d', marginTop: '4px', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{label}</div>
    </div>
);

export const DashHeader = ({ title, subtitle, right }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px', marginBottom: '26px' }}>
        <div>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#12351b' }}>{title}</h2>
            {subtitle && <p style={{ margin: '6px 0 0', color: '#7a8a7d', fontSize: '14px' }}>{subtitle}</p>}
        </div>
        {right && <div>{right}</div>}
    </div>
);

export const DashButton = ({ children, variant = 'primary', style, ...props }) => {
    const variants = {
        primary: { background: '#12351b', color: '#fff', border: '1px solid #12351b' },
        outline: { background: '#fff', color: '#12351b', border: '1px solid #cfd8d0' },
        danger: { background: '#fff', color: '#c0392b', border: '1px solid #f0c4bd' },
        subtle: { background: '#f3f6f3', color: '#12351b', border: '1px solid #e3e9e3' },
    };
    return (
        <button
            {...props}
            style={{
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: props.disabled ? 'not-allowed' : 'pointer',
                opacity: props.disabled ? 0.6 : 1,
                transition: 'transform 0.05s ease',
                ...variants[variant],
                ...style,
            }}
        >
            {children}
        </button>
    );
};

export const DashBadge = ({ children, tone = 'neutral' }) => {
    const tones = {
        neutral: { background: '#f0f2f0', color: '#556157' },
        success: { background: '#e6f4ea', color: '#1e7d34' },
        warning: { background: '#fff4e0', color: '#a3690f' },
        danger: { background: '#fdecea', color: '#c0392b' },
    };
    return (
        <span
            style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                ...tones[tone],
            }}
        >
            {children}
        </span>
    );
};

export const DashInput = (props) => (
    <input
        {...props}
        style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #dde3dd',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            ...(props.style || {}),
        }}
    />
);

export const DashTextarea = (props) => (
    <textarea
        {...props}
        style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #dde3dd',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            resize: 'vertical',
            ...(props.style || {}),
        }}
    />
);

export const DashSelect = (props) => (
    <select
        {...props}
        style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #dde3dd',
            fontSize: '14px',
            outline: 'none',
            background: '#fff',
            boxSizing: 'border-box',
            ...(props.style || {}),
        }}
    >
        {props.children}
    </select>
);

export const DashLabel = ({ children }) => (
    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#556157', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {children}
    </label>
);

export const DashGrid = ({ children, min = '220px', style }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}, 1fr))`, gap: '16px', ...style }}>
        {children}
    </div>
);
