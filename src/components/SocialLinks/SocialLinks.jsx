import React from 'react';
import { socialLinks } from '../../data/navigation';

// Renders only the social profiles that have a real URL configured in data/navigation.js.
const SocialLinks = ({ className = 'social' }) => {
    const links = socialLinks.filter((s) => s.url);
    if (!links.length) return null;
    return (
        <div className={className}>
            <ul>
                {links.map((s) => (
                    <li key={s.label}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                            <i className={`fi ${s.icon}`}></i>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SocialLinks;
