import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import DashboardTopbar from '../../components/ops-dashboards/DashboardTopbar';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { productsApi } from '../../api/productsApi';
import { getAuth } from '../../api/authApi';
import {
    DashCard, DashStat, DashHeader, DashButton, DashBadge,
    DashInput, DashTextarea, DashGrid, DashLabel,
} from '../../components/ops-dashboards/AdvancedDashboardKit';

const emptyForm = { name: '', description: '', price: '', compare_at_price: '', image_url: '', stock_quantity: '' };
const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const ShopManagerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = () => {
        setLoading(true);
        productsApi.listAll()
            .then(setProducts)
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const resetForm = () => { setForm(emptyForm); setEditingId(null); };

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name || form.price === '') {
            toast.error('Name and price are required');
            return;
        }
        setSaving(true);
        const payload = {
            name: form.name,
            description: form.description || null,
            price: Number(form.price),
            compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
            image_url: form.image_url || null,
            stock_quantity: form.stock_quantity ? Number(form.stock_quantity) : 0,
        };
        try {
            if (editingId) {
                await productsApi.update(editingId, payload);
                toast.success('Product updated');
            } else {
                await productsApi.create(payload);
                toast.success('Product posted for sale');
            }
            resetForm();
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const edit = (p) => {
        setForm({
            name: p.name,
            description: p.description || '',
            price: p.price,
            compare_at_price: p.compare_at_price || '',
            image_url: p.image_url || '',
            stock_quantity: p.stock_quantity,
        });
        setEditingId(p.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleActive = async (p) => {
        try {
            await productsApi.update(p.id, { status: p.status === 'active' ? 'inactive' : 'active' });
            load();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const remove = async (p) => {
        if (!window.confirm(`Delete "${p.name}"?`)) return;
        try {
            await productsApi.remove(p.id);
            toast.success('Deleted');
            load();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const active = products.filter((p) => p.status === 'active').length;

    return (
        <Fragment>
            <Navbar2 />
            <DashboardTopbar />
            <PageTitle pageTitle={'Shop Manager Dashboard'} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '60px 15px 100px' }}>
                <p style={{ color: '#7a8a7d', fontSize: '14px', marginBottom: '20px' }}>
                    Signed in as <strong>{getAuth()?.display_name}</strong>
                </p>

                <DashHeader
                    title="Shop"
                    subtitle="Post products for sale on the campaign shop."
                    right={<Link to="/shop" style={{ fontSize: '13px', color: '#12351b', fontWeight: 600 }}>View public shop →</Link>}
                />

                <DashGrid min="160px" style={{ marginBottom: '28px' }}>
                    <DashStat label="Total Products" value={products.length} />
                    <DashStat label="For Sale" value={active} accent="#1e7d34" />
                    <DashStat label="Hidden" value={products.length - active} accent="#a3690f" />
                </DashGrid>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) 1fr', gap: '24px', alignItems: 'start' }}>
                    <DashCard>
                        <h3 style={{ marginTop: 0, fontSize: '17px' }}>{editingId ? 'Edit Product' : 'New Product'}</h3>
                        <form onSubmit={submit}>
                            <div style={{ marginBottom: '14px' }}>
                                <DashLabel>Name</DashLabel>
                                <DashInput name="name" value={form.name} onChange={change} placeholder="Campaign T-Shirt" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                <div>
                                    <DashLabel>Price</DashLabel>
                                    <DashInput name="price" type="number" step="0.01" value={form.price} onChange={change} placeholder="25.00" />
                                </div>
                                <div>
                                    <DashLabel>Compare-at Price</DashLabel>
                                    <DashInput name="compare_at_price" type="number" step="0.01" value={form.compare_at_price} onChange={change} placeholder="Optional" />
                                </div>
                            </div>
                            <div style={{ marginBottom: '14px' }}>
                                <DashLabel>Image URL</DashLabel>
                                <DashInput name="image_url" value={form.image_url} onChange={change} placeholder="https://…" />
                            </div>
                            <div style={{ marginBottom: '14px' }}>
                                <DashLabel>Stock Quantity</DashLabel>
                                <DashInput name="stock_quantity" type="number" value={form.stock_quantity} onChange={change} placeholder="0" />
                            </div>
                            <div style={{ marginBottom: '18px' }}>
                                <DashLabel>Description</DashLabel>
                                <DashTextarea name="description" value={form.description} onChange={change} rows={4} placeholder="Product description…" />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <DashButton type="submit" disabled={saving}>
                                    {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Post for Sale'}
                                </DashButton>
                                {editingId && (
                                    <DashButton type="button" variant="outline" onClick={resetForm}>Cancel</DashButton>
                                )}
                            </div>
                        </form>
                    </DashCard>

                    <DashCard>
                        <h3 style={{ marginTop: 0, fontSize: '17px' }}>Products</h3>
                        {loading ? (
                            <p style={{ color: '#7a8a7d' }}>Loading…</p>
                        ) : products.length === 0 ? (
                            <p style={{ color: '#7a8a7d' }}>No products yet — post your first one.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eef0ec' }}>
                                            <th style={{ padding: '10px' }}>Product</th>
                                            <th style={{ padding: '10px' }}>Price</th>
                                            <th style={{ padding: '10px' }}>Stock</th>
                                            <th style={{ padding: '10px' }}>Status</th>
                                            <th style={{ padding: '10px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((p) => (
                                            <tr key={p.id} style={{ borderBottom: '1px solid #f4f6f4' }}>
                                                <td style={{ padding: '10px', fontWeight: 600 }}>{p.name}</td>
                                                <td style={{ padding: '10px' }}>{fmt(p.price)}</td>
                                                <td style={{ padding: '10px' }}>{p.stock_quantity}</td>
                                                <td style={{ padding: '10px' }}>
                                                    <DashBadge tone={p.status === 'active' ? 'success' : 'neutral'}>{p.status}</DashBadge>
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        <DashButton variant="subtle" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => edit(p)}>Edit</DashButton>
                                                        <DashButton variant="subtle" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => toggleActive(p)}>
                                                            {p.status === 'active' ? 'Hide' : 'Show'}
                                                        </DashButton>
                                                        <DashButton variant="danger" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => remove(p)}>Delete</DashButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </DashCard>
                </div>
            </div>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default ShopManagerDashboard;
