import { useEffect } from 'react';

const SITE = 'Vincent Kafula';
const DEFAULT_DESC = 'Vincent Kafula, Founder of Build One Zambia, advocates for Zambian-led development: transport, housing, agriculture, mining and decentralised governance built by Zambians, for Zambians.';

const setMeta = (attr, key, content) => {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
};

// Sets the page title, meta description and social-sharing tags for client-rendered routes.
const Seo = ({ title, description }) => {
    useEffect(() => {
        const fullTitle = title ? `${title} | ${SITE}` : `${SITE} | Build One Zambia`;
        const desc = description || DEFAULT_DESC;
        document.title = fullTitle;
        setMeta('name', 'description', desc);
        setMeta('property', 'og:title', fullTitle);
        setMeta('property', 'og:description', desc);
        setMeta('property', 'og:url', window.location.href);
        setMeta('name', 'twitter:title', fullTitle);
        setMeta('name', 'twitter:description', desc);
    }, [title, description]);
    return null;
};

export default Seo;
