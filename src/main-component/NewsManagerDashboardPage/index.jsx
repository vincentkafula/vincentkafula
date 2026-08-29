import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import DashboardTopbar from '../../components/ops-dashboards/DashboardTopbar';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { newsApi } from '../../api/newsApi';
import { getAuth } from '../../api/authApi';
import ComposeEmailPanel from '../../components/ops-dashboards/ComposeEmailPanel';
import {
    DashCard, DashStat, DashHeader, DashButton, DashBadge,
    DashInput, DashTextarea, DashGrid, DashLabel,
} from '../../components/ops-dashboards/AdvancedDashboardKit';

const emptyForm = { title: '', excerpt: '', body: '', cover_image_url: '' };

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: active ? '1px solid #12351b' : '1px solid #e3e9e3',
            background: active ? '#12351b' : '#fff',
            color: active ? '#fff' : '#12351b',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
        }}
    >
        {children}
    </button>
);

const NewsManagerDashboard = () => {
    const [tab, setTab] = useState('articles'); // 'articles' | 'email'
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [emailConfigured, setEmailConfigured] = useState(true);

    const load = () => {
        setLoading(true);
        newsApi.listAll()
            .then(setPosts)
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        newsApi.emailStatus().then((s) => setEmailConfigured(s.configured)).catch(() => {});
    }, []);

    const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.body) {
            toast.error('Title and body are required');
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await newsApi.update(editingId, form);
                toast.success('Article updated');
            } else {
                await newsApi.create(form);
                toast.success('Draft created');
            }
            resetForm();
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const edit = (post) => {
        setForm({ title: post.title, excerpt: post.excerpt || '', body: post.body, cover_image_url: post.cover_image_url || '' });
        setEditingId(post.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const togglePublish = async (post) => {
        try {
            if (post.status === 'published') {
                await newsApi.unpublish(post.id);
                toast.success('Unpublished');
            } else {
                await newsApi.publish(post.id);
                toast.success('Published');
            }
            load();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const remove = async (post) => {
        if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
        try {
            await newsApi.remove(post.id);
            toast.success('Deleted');
            load();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const published = posts.filter((p) => p.status === 'published').length;
    const drafts = posts.length - published;

    return (
        <Fragment>
            <Navbar2 />
            <DashboardTopbar />
            <PageTitle pageTitle={'News Manager Dashboard'} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '60px 15px 100px' }}>
                <p style={{ color: '#7a8a7d', fontSize: '14px', marginBottom: '20px' }}>
                    Signed in as <strong>{getAuth()?.display_name}</strong>
                </p>

                <DashHeader
                    title="News"
                    subtitle="Write, publish, and email campaign news to supporters."
                    right={<Link to="/news" style={{ fontSize: '13px', color: '#12351b', fontWeight: 600 }}>View public news page →</Link>}
                />

                <DashGrid min="160px" style={{ marginBottom: '28px' }}>
                    <DashStat label="Total Articles" value={posts.length} />
                    <DashStat label="Published" value={published} accent="#1e7d34" />
                    <DashStat label="Drafts" value={drafts} accent="#a3690f" />
                </DashGrid>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                    <TabButton active={tab === 'articles'} onClick={() => setTab('articles')}>📰 Articles</TabButton>
                    <TabButton active={tab === 'email'} onClick={() => setTab('email')}>✉️ Email</TabButton>
                </div>

                {tab === 'articles' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) 1fr', gap: '24px', alignItems: 'start' }}>
                        <DashCard>
                            <h3 style={{ marginTop: 0, fontSize: '17px' }}>{editingId ? 'Edit Article' : 'New Article'}</h3>
                            <form onSubmit={submit}>
                                <div style={{ marginBottom: '14px' }}>
                                    <DashLabel>Title</DashLabel>
                                    <DashInput name="title" value={form.title} onChange={change} placeholder="Article headline" />
                                </div>
                                <div style={{ marginBottom: '14px' }}>
                                    <DashLabel>Excerpt</DashLabel>
                                    <DashInput name="excerpt" value={form.excerpt} onChange={change} placeholder="Short summary (optional)" />
                                </div>
                                <div style={{ marginBottom: '14px' }}>
                                    <DashLabel>Cover Image URL</DashLabel>
                                    <DashInput name="cover_image_url" value={form.cover_image_url} onChange={change} placeholder="https://…" />
                                </div>
                                <div style={{ marginBottom: '18px' }}>
                                    <DashLabel>Body</DashLabel>
                                    <DashTextarea name="body" value={form.body} onChange={change} rows={8} placeholder="Write the article…" />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <DashButton type="submit" disabled={saving}>
                                        {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Draft'}
                                    </DashButton>
                                    {editingId && (
                                        <DashButton type="button" variant="outline" onClick={resetForm}>Cancel</DashButton>
                                    )}
                                </div>
                            </form>
                        </DashCard>

                        <DashCard>
                            <h3 style={{ marginTop: 0, fontSize: '17px' }}>Articles</h3>
                            {loading ? (
                                <p style={{ color: '#7a8a7d' }}>Loading…</p>
                            ) : posts.length === 0 ? (
                                <p style={{ color: '#7a8a7d' }}>No articles yet — create your first one.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {posts.map((post) => (
                                        <div
                                            key={post.id}
                                            style={{
                                                border: '1px solid #eef0ec',
                                                borderRadius: '10px',
                                                padding: '14px 16px',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                <strong style={{ fontSize: '14.5px' }}>{post.title}</strong>
                                                <DashBadge tone={post.status === 'published' ? 'success' : 'warning'}>{post.status}</DashBadge>
                                            </div>
                                            <p style={{ margin: '6px 0 10px', fontSize: '12.5px', color: '#7a8a7d' }}>
                                                {new Date(post.created_at).toLocaleDateString()} · by {post.author_display_name || '—'}
                                            </p>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <DashButton variant="subtle" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => edit(post)}>Edit</DashButton>
                                                <DashButton variant="subtle" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => togglePublish(post)}>
                                                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                                                </DashButton>
                                                <DashButton variant="danger" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => remove(post)}>Delete</DashButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DashCard>
                    </div>
                )}

                {tab === 'email' && (
                    <ComposeEmailPanel articles={posts} emailConfigured={emailConfigured} />
                )}
            </div>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default NewsManagerDashboard;
