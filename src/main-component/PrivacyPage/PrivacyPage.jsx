import React from 'react'
import LegalPage from '../../components/LegalPage/LegalPage'

const sections = [
    { h: 'Who we are', p: ['This website is run by Vincent Kafula, Founder of Build One Zambia. You can contact us at vincent.kafula@gmail.com or through the contact page.'] },
    {
        h: 'What we collect and why',
        p: ['We only collect the information you choose to send us through the forms on this website:'],
        list: [
            'Contact form: your name, email address, optional phone number, subject and message, so that we can reply to you.',
            'Volunteer form: your name, email address, optional phone number, your province, district, constituency, ward and polling station, how you would like to help and your message, so that we can organise volunteering in your area.',
            'Support form: your name, email address, optional phone number, the type of support offered and any details, so that we can follow up with you.',
            'Newsletter: your email address, so that we can send campaign updates.',
            'Accounts: if you have a staff or shop account, the details needed to run that account and any orders.',
        ],
    },
    { h: 'How your information is handled', p: ['Form submissions are sent by email to the campaign inbox using an email delivery service (Resend). We do not sell your information or share it with third parties for their own marketing. We do not take card or bank details on this website.'] },
    { h: 'How long we keep it', p: ['We keep your information only for as long as it is needed for the purpose you gave it for, and then delete it. You can ask us to delete it sooner at any time.'] },
    { h: 'Your rights', p: ['You can ask to see the information we hold about you, ask us to correct or delete it, or unsubscribe from updates at any time by emailing vincent.kafula@gmail.com.'] },
    { h: 'Cookies and third-party content', p: ['This website does not use advertising cookies. The contact page shows an embedded Google map, and the site loads fonts and icons from Google Fonts and Cloudflare; these services may record your IP address when the content loads.'] },
    { h: 'Changes to this policy', p: ['We may update this policy from time to time. The date at the top of the page shows when it was last changed.'] },
];

const PrivacyPage = () => (
    <LegalPage title="Privacy Policy" updated="October 2026"
        description="How Vincent Kafula’s website collects, uses and protects the personal information you send through its forms."
        sections={sections} />
);

export default PrivacyPage;
