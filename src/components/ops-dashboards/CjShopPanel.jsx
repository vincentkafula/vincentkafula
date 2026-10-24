import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { shopApi, formatMoney } from '../../api/shopApi';
import { productsApi } from '../../api/productsApi';
import { DashCard, DashStat, DashButton, DashBadge, DashGrid } from './AdvancedDashboardKit';
import './cjShopPanel.css';

const STATUS = {
    paid: ['Paid', 'neutral'],
    with_supplier: ['With CJ', 'neutral'],
    awaiting_supplier_payment: ['Pay CJ', 'warning'],
    needs_attention: ['Needs attention', 'danger'],
    shipped: ['Shipped', 'success'],
    delivered: ['Delivered', 'success'],
    cancelled: ['Cancelled', 'neutral'],
    refunded: ['Refunded', 'neutral'],
};
const margin = (price, cost) => (price > 0 ? Math.round(((price - cost) / price) * 100) : 0);

const Tab = ({ active, onClick, children, count }) => (
    <button type="button" className={`cjp-tab ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={active}>
        {children}{count > 0 && <span className="cjp-tab-count">{count}</span>}
    </button>
);

// ---------- Orders ----------
const Orders = ({ currency, onChanged }) => {
    const [filter, setFilter] = useState('open');
    const [orders, setOrders] = useState(null);
    const [open, setOpen] = useState(null);
    const [busy, setBusy] = useState(false);
    const load = useCallback(() => shopApi.admin.orders(filter).then(setOrders).catch((e) => toast.error(e.message)), [filter]);
    useEffect(() => { setOrders(null); load(); }, [load]);

    const sync = async () => {
        setBusy(true);
        try { const r = await shopApi.admin.syncOrders(); toast.success(`Checked ${r.checked} order${r.checked === 1 ? '' : 's'} with CJ, ${r.updated} updated`); load(); onChanged(); } catch (e) { toast.error(e.message); } finally { setBusy(false); }
    };
    const retry = async (o) => {
        try { const r = await shopApi.admin.retry(o.id); toast[r.status === 'needs_attention' ? 'error' : 'success'](r.status === 'needs_attention' ? r.supplier_error : `Sent to CJ (${r.cj_order_id})`); load(); onChanged(); } catch (e) { toast.error(e.message); }
    };
    const setStatus = async (o, status) => {
        const note = window.prompt(`Note for marking ${o.order_number} as ${status} (optional):`, '');
        if (note === null) return;
        try { await shopApi.admin.setStatus(o.id, status, note); toast.success('Order updated'); load(); onChanged(); } catch (e) { toast.error(e.message); }
    };

    return (
        <DashCard>
            <div className="cjp-bar">
                <div className="cjp-filters">
                    {[['open', 'Open'], ['needs_attention', 'Needs attention'], ['shipped', 'Shipped'], ['delivered', 'Delivered'], ['', 'All']].map(([k, l]) => (
                        <button key={k || 'all'} type="button" className={filter === k ? 'active' : ''} onClick={() => setFilter(k)}>{l}</button>
                    ))}
                </div>
                <DashButton variant="subtle" onClick={sync} disabled={busy}>{busy ? 'Checking CJ…' : 'Update from CJ'}</DashButton>
            </div>
            {!orders ? <p className="cjp-muted">Loading orders…</p> : !orders.length ? <p className="cjp-muted">No orders here.</p> : (
                <div className="cjp-table-wrap">
                    <table className="cjp-table">
                        <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th className="num">Paid</th><th className="num">CJ cost</th><th className="num">Profit</th><th /></tr></thead>
                        <tbody>
                            {orders.map((o) => {
                                const [label, tone] = STATUS[o.status] || [o.status, 'neutral'];
                                return (
                                    <React.Fragment key={o.id}>
                                        <tr className={open === o.id ? 'is-open' : ''}>
                                            <td><strong>{o.order_number}</strong><small>{new Date(o.paid_at || o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</small></td>
                                            <td>{o.customer_name}<small>{o.city}, {o.country_name}</small></td>
                                            <td><DashBadge tone={tone}>{label}</DashBadge>{o.tracking_number && <small>{o.tracking_number}</small>}</td>
                                            <td className="num">{formatMoney(o.total, o.currency)}</td>
                                            <td className="num">{formatMoney(o.cj_total ?? o.estimated_cost, 'usd')}{o.cj_total == null && <small>estimate</small>}</td>
                                            <td className={`num ${Number(o.profit) < 0 ? 'neg' : 'pos'}`}>{formatMoney(o.profit, o.currency)}</td>
                                            <td><button type="button" className="cjp-link" onClick={() => setOpen(open === o.id ? null : o.id)}>{open === o.id ? 'Close' : 'Details'}</button></td>
                                        </tr>
                                        {open === o.id && (
                                            <tr className="cjp-detail"><td colSpan={7}>
                                                <div className="cjp-detail-grid">
                                                    <div>
                                                        <h5>Items</h5>
                                                        <ul>{o.items.map((i, n) => <li key={n}>{i.quantity} × {i.name}{i.variant ? ` (${i.variant})` : ''} — {formatMoney(i.unit_price * i.quantity, o.currency)}{i.fulfilment !== 'cj' && <em> send by hand</em>}</li>)}</ul>
                                                        <p>Shipping: {o.shipping_method} ({formatMoney(o.shipping_charged, o.currency)})</p>
                                                    </div>
                                                    <div>
                                                        <h5>Deliver to</h5>
                                                        <p>{o.customer_name}<br />{o.address_line1}{o.address_line2 && <><br />{o.address_line2}</>}<br />{o.city}, {o.province} {o.postal_code}<br />{o.country_name}<br />{o.customer_phone} · {o.customer_email}</p>
                                                    </div>
                                                    <div>
                                                        <h5>Money</h5>
                                                        <p>Customer paid {formatMoney(o.total, o.currency)}<br />CJ products {o.cj_product_cost != null ? formatMoney(o.cj_product_cost, 'usd') : '—'} · CJ shipping {o.cj_shipping_cost != null ? formatMoney(o.cj_shipping_cost, 'usd') : '—'}<br />Card fee {o.payment_fee != null ? formatMoney(o.payment_fee, o.currency) : 'estimated'}<br /><strong>Campaign profit {formatMoney(o.profit, o.currency)}</strong></p>
                                                        {o.cj_order_id && <p className="cjp-muted">CJ order {o.cj_order_id}{o.cj_status ? ` · ${o.cj_status}` : ''}</p>}
                                                    </div>
                                                </div>
                                                {o.supplier_error && <p className="cjp-error">{o.supplier_error}</p>}
                                                {o.status === 'awaiting_supplier_payment' && <p className="cjp-warn">This order is waiting for payment in CJ. Top up the CJ wallet or pay it in My CJ → Orders, then press “Update from CJ”.</p>}
                                                {o.notes && <p className="cjp-muted" style={{ whiteSpace: 'pre-line' }}>{o.notes}</p>}
                                                <div className="cjp-actions">
                                                    {!o.cj_order_id && o.paid_at && <DashButton onClick={() => retry(o)}>Send to CJ again</DashButton>}
                                                    {!['delivered', 'cancelled', 'refunded'].includes(o.status) && <DashButton variant="subtle" onClick={() => setStatus(o, 'delivered')}>Mark delivered</DashButton>}
                                                    {!['cancelled', 'refunded'].includes(o.status) && <DashButton variant="subtle" onClick={() => setStatus(o, 'refunded')}>Mark refunded</DashButton>}
                                                    {!['cancelled', 'refunded'].includes(o.status) && <DashButton variant="danger" onClick={() => setStatus(o, 'cancelled')}>Cancel</DashButton>}
                                                </div>
                                            </td></tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <p className="cjp-muted cjp-small">Refunds are made in Stripe; marking an order refunded here removes it from the campaign total.</p>
        </DashCard>
    );
};

// ---------- Find products ----------
const Finder = ({ markup, onImported }) => {
    const [q, setQ] = useState('');
    const [results, setResults] = useState(null);
    const [busy, setBusy] = useState(false);
    const [preview, setPreview] = useState(null);
    const [importing, setImporting] = useState(null);
    const search = async (e) => {
        e?.preventDefault();
        if (q.trim().length < 2) return;
        setBusy(true); setPreview(null);
        try { setResults(await shopApi.admin.search(q.trim())); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
    };
    const open = async (p) => {
        setPreview({ loading: true, pid: p.pid });
        try { setPreview(await shopApi.admin.product(p.pid)); } catch (err) { toast.error(err.message); setPreview(null); }
    };
    const doImport = async (pid, publish) => {
        setImporting(pid);
        try {
            const r = await shopApi.admin.importProduct(pid, { publish });
            toast.success(`“${r.name}” ${publish ? 'is now on sale' : 'was added as hidden'}`);
            setResults((s) => s && { ...s, products: s.products.map((x) => (x.pid === pid ? { ...x, imported: true } : x)) });
            onImported();
        } catch (err) { toast.error(err.message); } finally { setImporting(null); }
    };

    return (
        <DashCard>
            <form className="cjp-search" onSubmit={search}>
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search CJ: t-shirt, cap, tote bag, mug, wristband…" aria-label="Search the CJ catalogue" />
                <DashButton type="submit" disabled={busy || q.trim().length < 2}>{busy ? 'Searching…' : 'Search CJ'}</DashButton>
            </form>
            <p className="cjp-muted cjp-small">Prices are suggested at {markup}× the CJ cost (set SHOP_MARKUP to change). You can edit every price after importing.</p>
            {results && (results.products.length === 0 ? <p className="cjp-muted">No products found. Try a different word.</p> : (
                <div className="cjp-results">
                    {results.products.map((p) => (
                        <article key={p.pid} className={`cjp-result ${preview?.pid === p.pid ? 'active' : ''}`}>
                            <button type="button" className="cjp-result-img" onClick={() => open(p)} aria-label={`Preview ${p.name}`}>{p.image && <img src={p.image} alt="" loading="lazy" />}</button>
                            <h4>{p.name}</h4>
                            <div className="cjp-price-row">
                                <span>CJ cost <strong>{p.cost != null ? formatMoney(p.cost, 'usd') : '—'}</strong></span>
                                <span>Sell at <strong>{p.suggested_price ? formatMoney(p.suggested_price, 'usd') : '—'}</strong></span>
                            </div>
                            {p.imported ? <DashBadge tone="success">In the shop</DashBadge> : (
                                <div className="cjp-actions">
                                    <DashButton onClick={() => doImport(p.pid, true)} disabled={importing === p.pid}>{importing === p.pid ? 'Adding…' : 'Add to shop'}</DashButton>
                                    <DashButton variant="subtle" onClick={() => open(p)}>Options</DashButton>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            ))}
            {preview && (
                <div className="cjp-preview" role="dialog" aria-label="Product options">
                    {preview.loading ? <p className="cjp-muted">Loading options…</p> : (
                        <>
                            <div className="cjp-preview-head">
                                <h4>{preview.name}</h4>
                                <button type="button" className="cjp-link" onClick={() => setPreview(null)}>Close</button>
                            </div>
                            <table className="cjp-table">
                                <thead><tr><th>Option</th><th className="num">CJ cost</th><th className="num">Suggested price</th><th className="num">Margin</th></tr></thead>
                                <tbody>{preview.variants.map((v) => (
                                    <tr key={v.vid}><td>{v.name}<small>{v.sku}</small></td><td className="num">{formatMoney(v.cost, 'usd')}</td><td className="num">{formatMoney(v.suggested_price, 'usd')}</td><td className="num">{margin(v.suggested_price, v.cost)}%</td></tr>
                                ))}</tbody>
                            </table>
                            <p className="cjp-muted cjp-small">Margin is before shipping; customers pay shipping at checkout.</p>
                            <div className="cjp-actions">
                                <DashButton onClick={() => doImport(preview.pid, true)} disabled={importing === preview.pid}>Add to shop</DashButton>
                                <DashButton variant="subtle" onClick={() => doImport(preview.pid, false)} disabled={importing === preview.pid}>Add as hidden</DashButton>
                            </div>
                        </>
                    )}
                </div>
            )}
        </DashCard>
    );
};

// ---------- Prices ----------
const Prices = ({ refreshKey, onChanged }) => {
    const [products, setProducts] = useState(null);
    const [edits, setEdits] = useState({});
    const [busy, setBusy] = useState(null);
    const load = () => productsApi.listAll().then((rows) => setProducts(rows.filter((p) => p.source === 'cj'))).catch((e) => toast.error(e.message));
    useEffect(() => { load(); }, [refreshKey]);

    const save = async (p) => {
        const changes = Object.entries(edits[p.id] || {}).map(([vid, c]) => ({ vid, ...c }));
        if (!changes.length) return;
        setBusy(p.id);
        try { await shopApi.admin.setVariants(p.id, changes); toast.success('Prices saved'); setEdits((e) => ({ ...e, [p.id]: {} })); load(); onChanged(); } catch (e) { toast.error(e.message); } finally { setBusy(null); }
    };
    const sync = async (p) => {
        setBusy(p.id);
        try { await shopApi.admin.syncProduct(p.id); toast.success('Costs refreshed from CJ'); load(); } catch (e) { toast.error(e.message); } finally { setBusy(null); }
    };
    const toggle = async (p) => {
        try { await productsApi.update(p.id, { status: p.status === 'active' ? 'inactive' : 'active' }); load(); onChanged(); } catch (e) { toast.error(e.message); }
    };
    const edit = (pid, vid, field, value) => setEdits((e) => ({ ...e, [pid]: { ...(e[pid] || {}), [vid]: { ...(e[pid]?.[vid] || {}), [field]: value } } }));

    if (!products) return <DashCard><p className="cjp-muted">Loading…</p></DashCard>;
    if (!products.length) return <DashCard><p className="cjp-muted">No CJ products yet. Use “Find products” to add some.</p></DashCard>;
    return (
        <div className="cjp-prices">
            {products.map((p) => (
                <DashCard key={p.id}>
                    <div className="cjp-prod-head">
                        {p.image_url && <img src={p.image_url} alt="" />}
                        <div>
                            <h4>{p.name}</h4>
                            <DashBadge tone={p.status === 'active' ? 'success' : 'neutral'}>{p.status === 'active' ? 'On sale' : 'Hidden'}</DashBadge>
                            {p.last_synced_at && <small className="cjp-muted"> Costs checked {new Date(p.last_synced_at).toLocaleDateString('en-GB')}</small>}
                        </div>
                        <div className="cjp-actions">
                            <DashButton variant="subtle" onClick={() => sync(p)} disabled={busy === p.id}>Refresh costs</DashButton>
                            <DashButton variant="subtle" onClick={() => toggle(p)}>{p.status === 'active' ? 'Hide' : 'Put on sale'}</DashButton>
                        </div>
                    </div>
                    <div className="cjp-table-wrap">
                        <table className="cjp-table">
                            <thead><tr><th>Option</th><th className="num">CJ cost</th><th className="num">Your price</th><th className="num">Margin</th><th>On sale</th></tr></thead>
                            <tbody>{(p.variants || []).map((v) => {
                                const e = edits[p.id]?.[v.vid] || {};
                                const price = e.price !== undefined ? Number(e.price) : Number(v.price);
                                const active = e.active !== undefined ? e.active : v.active !== false;
                                const m = margin(price, Number(v.cost));
                                return (
                                    <tr key={v.vid}>
                                        <td>{v.name}<small>{v.sku}</small></td>
                                        <td className="num">{formatMoney(v.cost, 'usd')}</td>
                                        <td className="num"><input className="cjp-price" type="number" step="0.01" min="0.5" value={e.price ?? v.price} onChange={(ev) => edit(p.id, v.vid, 'price', ev.target.value)} aria-label={`Price for ${v.name}`} /></td>
                                        <td className={`num ${m < 30 ? 'neg' : 'pos'}`}>{m}%</td>
                                        <td><input type="checkbox" checked={active} onChange={(ev) => edit(p.id, v.vid, 'active', ev.target.checked)} aria-label={`Sell ${v.name}`} /></td>
                                    </tr>
                                );
                            })}</tbody>
                        </table>
                    </div>
                    {Object.keys(edits[p.id] || {}).length > 0 && (
                        <div className="cjp-actions"><DashButton onClick={() => save(p)} disabled={busy === p.id}>Save prices</DashButton>
                            <DashButton variant="subtle" onClick={() => setEdits((x) => ({ ...x, [p.id]: {} }))}>Undo</DashButton></div>
                    )}
                </DashCard>
            ))}
        </div>
    );
};

// ---------- Panel ----------
const CjShopPanel = ({ onProductsChanged }) => {
    const [tab, setTab] = useState('orders');
    const [status, setStatus] = useState(null);
    const [summary, setSummary] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const loadSummary = () => shopApi.admin.summary().then(setSummary).catch(() => {});
    useEffect(() => {
        shopApi.admin.status().then(setStatus).catch((e) => setStatus({ error: e.message }));
        loadSummary();
    }, []);
    const changed = () => { loadSummary(); setRefreshKey((k) => k + 1); onProductsChanged?.(); };
    const cur = summary?.currency || 'usd';

    return (
        <section className="cjp" aria-label="CJdropshipping shop">
            <div className="cjp-status">
                <span className={`cjp-pill ${status?.cj?.connected ? 'on' : 'off'}`}>
                    {!status ? 'Checking CJ…' : status.cj?.connected ? 'CJdropshipping connected' : status.cj?.configured ? `CJ error: ${status.cj.error}` : 'CJdropshipping not connected'}
                </span>
                {status?.cj?.connected && <span className="cjp-pill neutral">CJ wallet {formatMoney(status.cj.balance.amount, 'usd')}</span>}
                <span className={`cjp-pill ${status?.stripe ? 'on' : 'off'}`}>{status?.stripe ? 'Card payments on' : 'Card payments off'}</span>
                {status?.settings && <span className="cjp-pill neutral">{status.settings.autoPay ? 'CJ paid automatically from wallet' : 'CJ orders paid by hand'}</span>}
            </div>
            {status?.cj?.connected && status.cj.balance.amount < 50 && <p className="cjp-warn">The CJ wallet is low. When it runs out, new orders wait for payment instead of shipping. Top it up in My CJ → Wallet.</p>}

            <DashGrid min="170px" style={{ margin: '18px 0 24px' }}>
                <DashStat label="Raised for the campaign" value={summary ? formatMoney(summary.all.profit, cur) : '—'} accent="#1e7d34" />
                <DashStat label="This month" value={summary ? formatMoney(summary.month.profit, cur) : '—'} accent="#1e7d34" />
                <DashStat label="Orders" value={summary ? summary.all.orders : '—'} />
                <DashStat label="Sales" value={summary ? formatMoney(summary.all.revenue, cur) : '—'} />
                <DashStat label="Paid to CJ + card fees" value={summary ? formatMoney(summary.all.supplier + summary.all.fees, cur) : '—'} accent="#a3690f" />
            </DashGrid>

            <div className="cjp-tabs" role="group" aria-label="Shop sections">
                <Tab active={tab === 'orders'} onClick={() => setTab('orders')} count={summary?.attention}>Orders</Tab>
                <Tab active={tab === 'find'} onClick={() => setTab('find')}>Find products on CJ</Tab>
                <Tab active={tab === 'prices'} onClick={() => setTab('prices')}>CJ products and prices</Tab>
            </div>
            {tab === 'orders' && <Orders currency={cur} onChanged={loadSummary} />}
            {tab === 'find' && <Finder markup={status?.settings?.markup || 2.5} onImported={changed} />}
            {tab === 'prices' && <Prices refreshKey={refreshKey} onChanged={changed} />}
        </section>
    );
};

export default CjShopPanel;
