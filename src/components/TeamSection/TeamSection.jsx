import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SectionTitle from '../SectionTitle/SectionTitle';
import { teamProfilesApi } from '../../api/teamProfilesApi';
import placeholder1 from '../../images/team/1.jpg'
import placeholder2 from '../../images/team/2.jpg'
import placeholder3 from '../../images/team/3.jpg'
import placeholder4 from '../../images/team/4.jpg'

const placeholders = [placeholder1, placeholder2, placeholder3, placeholder4];

const ClickHandler = () => {
    window.scrollTo(10, 0);
}

// Shows only real, Head Office-approved profiles. Appointed people are labelled "Appointed …";
// everyone else carries their pending status (e.g. "Candidate for Appointment").
const TeamSection = (props) => {
    const [team, setTeam] = useState(null);

    useEffect(() => {
        teamProfilesApi.listPublic().then(setTeam).catch(() => setTeam([]));
    }, []);

    return (
        <section className={`wpo-team-section section-padding ${props.tmClass}`}>
            <div className="container">
                <SectionTitle subTitle={'Our Team'} Title={'Meet Our Campaign Team'} />
                <div className="wpo-team-wrap">
                    <div className="row">
                        {team && team.length === 0 && (
                            <div className="col-12">
                                <p style={{ textAlign: 'center' }}>Team members and candidates will be listed here once their details have been verified and approved.</p>
                            </div>
                        )}
                        {(team || []).map((member, i) => (
                            <div className="col col-lg-3 col-md-6 col-12" key={member.id}>
                                <div className="wpo-team-item">
                                    <div className="wpo-team-img">
                                        <div className="wpo-team-img-box">
                                            <img src={member.photo_url || placeholders[i % placeholders.length]} alt={member.photo_url ? member.full_name : ''} />
                                        </div>
                                    </div>
                                    <div className="wpo-team-text">
                                        <h2><Link onClick={ClickHandler} to={`/team-single/${member.id}`}>{member.full_name}</Link></h2>
                                        <span>{member.status === 'appointed' ? member.status_label : `${member.status_label} (${member.role_title})`}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TeamSection;
