// Single source of truth for the site navigation (desktop headers and mobile menu).
import Advocacy, { infrastructure } from '../api/advocacy';

const navigation = [
    { id: 1, title: 'Home', link: '/' },
    {
        id: 2,
        title: 'About',
        link: '/about',
        submenu: [
            { id: 21, title: 'About Vincent Kafula', link: '/about' },
            { id: 22, title: 'Build One Zambia', link: '/about#build-one-zambia' },
            { id: 23, title: 'The BOZ Symbol', link: '/about#symbol' },
            { id: 24, title: 'Frequently Asked Questions', link: '/faq' },
        ],
    },
    {
        id: 3,
        title: 'Advocacy',
        link: '/advocacy',
        submenu: [
            { id: 30, title: 'All Key Issues', link: '/advocacy' },
            ...Advocacy.map((a, i) => ({
                id: 31 + i,
                title: a.title,
                link: `/advocacy/${a.slug}`,
                submenu: a.children
                    ? infrastructure.map((inf, j) => ({ id: 300 + j, title: inf.title, link: `/infrastructure/${inf.slug}` }))
                    : undefined,
            })),
        ],
    },
    { id: 4, title: 'Proposals', link: '/proposals' },
    { id: 5, title: 'News', link: '/news' },
    {
        id: 6,
        title: 'Get Involved',
        link: '/volunteer',
        submenu: [
            { id: 61, title: 'Volunteer', link: '/volunteer' },
            { id: 62, title: 'Campaign Events', link: '/campaign' },
            { id: 63, title: 'Research & Resources', link: '/resources' },
            { id: 64, title: 'Support the Campaign', link: '/donate' },
            { id: 65, title: 'Shop', link: '/shop' },
        ],
    },
    { id: 7, title: 'Contact', link: '/contact' },
];

// Social profiles. Leave url empty to hide an icon; add verified profile URLs to show them.
export const socialLinks = [
    { icon: 'flaticon-facebook-app-symbol', label: 'Facebook', url: '' },
    { icon: 'flaticon-twitter', label: 'X (Twitter)', url: '' },
    { icon: 'flaticon-linkedin', label: 'LinkedIn', url: '' },
    { icon: 'flaticon-instagram-1', label: 'Instagram', url: '' },
];

export const contactDetails = {
    email: 'vincent.kafula@gmail.com',
    phones: [
        { label: 'Zambia', display: '+260 955 548 500', tel: '+260955548500' },
        { label: 'South Africa', display: '061 461 5035', tel: '+27614615035' },
    ],
    address: '37 Chiappini Street, St Andrew’s Presbyterian Church, Cape Town',
    mapQuery: '37 Chiappini Street, Cape Town',
};

export default navigation;
