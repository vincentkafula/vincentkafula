import React from 'react'
import LegalPage from '../../components/LegalPage/LegalPage'

const sections = [
    { h: 'About this website', p: ['This website presents the advocacy work of Vincent Kafula, Founder of Build One Zambia. By using it, you agree to these terms.'] },
    { h: 'Nature of the content', p: ['The policy content on this website is drawn from the Build One Zambia campaign document. It describes proposals and campaign commitments, not existing government policy, and it is provided for public information and discussion. Figures are quoted as they appear in that document.'] },
    { h: 'Using the content', p: ['You are welcome to share links to this website and to quote short passages for discussion, news reporting or education, provided you credit the source and do not change the meaning.'] },
    {
        h: 'Acceptable use',
        list: [
            'Do not submit false information or impersonate another person through the forms.',
            'Do not use the forms to send spam, abuse or unlawful content.',
            'Do not attempt to interfere with the operation or security of the website.',
        ],
    },
    { h: 'Links to other websites', p: ['We are not responsible for the content of external websites linked from this site.'] },
    { h: 'Changes', p: ['We may update these terms and the content of this website at any time.'] },
    { h: 'Contact', p: ['Questions about these terms can be sent to vincent.kafula@gmail.com.'] },
];

const TermsPage = () => (
    <LegalPage title="Terms of Use" updated="October 2026"
        description="Terms for using Vincent Kafula's website and the Build One Zambia advocacy content."
        sections={sections} />
);

export default TermsPage;
