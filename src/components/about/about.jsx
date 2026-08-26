import React, { useState } from 'react'
import sign from '../../images/signeture.png'

const About = (props) => {
    const [expanded, setExpanded] = useState(false);

    const fullBio = [
        "Vincent Kafula was born in 1988 in Ndola, Zambia, to a mother of mixed Bemba and Lamba heritage and a Bemba father. His early years were shaped by hardship: when his father lost his position with the Zambia Police Service and his parents separated, Vincent moved to live with his father in Shiwang'andu.",
        "There, he began his education at Grade 1 at Shiwang'andu Primary School before transferring to Chinkalanga Primary School, where he completed his primary education in 2001. He went on to Timba Basic School for Grade 8, but financial hardship soon forced him to leave the classroom. Rather than give up on his education, Vincent went to work at C & J Farm to raise the funds he needed to continue school, eventually returning to complete Grade 9 in 2005. From 2006 to 2008, he completed his secondary education at Mpika Boys Secondary School, graduating with his Grade 12 certificate.",
        "Vincent later pursued higher education through the University of South Africa, earning a Bachelor of Commerce in Economics — a degree completed while balancing the demands of work and life, a testament to his persistence and long-term commitment to self-improvement.",
        "It was in 2008 that Vincent's path toward public service began to take shape. Inspired by the leadership of Michael Chilufya Sata and mentored in his understanding of politics by Given Lubinda, he developed a deep interest in the political life of his country. That early inspiration has since grown into a clear ambition: Vincent intends to contest the 2031 Zambian general election for the office of President.",
        "Vincent's own journey — from a childhood marked by financial hardship to years of determined self-advancement — has shaped his commitment to Zambia's youth. He is eager to listen to the needs of the younger generation and to hear, directly from them, the solutions they envision for the challenges they face. He hopes to help translate those ideas into real opportunities for young Zambians to lead meaningful lives and build lasting change in their country.",
        "Vincent believes that a brighter future for Zambia depends on genuine collaboration between the youth and the nation's leaders. Having lived through the very struggles many young Zambians face today, he is ready to take the first step toward making that collaboration — and that future — a reality."
    ];

    return (
        <section className={`wpo-about-section section-padding ${props.abClass}`}>
            <div className="container">
                <div className="wpo-about-wrap">
                    <div className="row align-items-center">
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="wpo-about-img">
                                <img src={props.abimg} alt="" />
                                <div className="wpo-about-img-text">
                                    <h4>2025</h4>

                                    <div className="rotate-text">
                                        <span>W</span>
                                        <span>e</span>
                                        <span>A</span>
                                        <span>r</span>
                                        <span>e</span>
                                        <span>W</span>
                                        <span>o</span>
                                        <span>r</span>
                                        <span>k</span>
                                        <span>i</span>
                                        <span>n</span>
                                        <span>g</span>
                                        <span>F</span>
                                        <span>o</span>
                                        <span>r</span>
                                        <span>Y</span>
                                        <span>o</span>
                                        <span>u</span>
                                        <span>S</span>
                                        <span>i</span>
                                        <span>n</span>
                                        <span>c</span>
                                        <span>e</span>
                                    </div>
                                    <div className="dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <div className="border-shape-1"></div>
                                    <div className="border-shape-2"></div>
                                    <div className="border-shape-3"></div>
                                </div>
                                <div className="about-shape">
                                    <div className="shape-1"></div>
                                    <div className="shape-2"></div>
                                    <div className="shape-3"></div>
                                    <div className="shape-4"></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="wpo-about-text">
                                <div className="wpo-section-title">
                                    <span>About Vincent Kafula</span>
                                    <h2>We Can Work Together For Create a Better Future.</h2>
                                </div>
                                {props.fullBio ? (
                                    <div className="about-bio-content">
                                        <p>{fullBio[0]}</p>
                                        <p>{fullBio[1]}</p>
                                        {expanded && fullBio.slice(2).map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setExpanded(!expanded)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                color: '#ff5e14',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                                marginBottom: '20px',
                                                display: 'inline-block',
                                            }}
                                        >
                                            {expanded ? 'Read Less' : 'Read More'}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <p>The leader is eager to listen to the needs of the youth generation and to hear what
                                            solutions they have to the problems they are facing. He hopes to find solutions that
                                            will help them lead meaningful lives and make lasting change in the world. </p>
                                        <p>He believes that the collaboration between the youth and the leaders of society is
                                            necessary to bring about a brighter future. Now, he is ready to take the first step
                                            to making that happen.</p>
                                    </>
                                )}
                                <div className="quote">
                                    <p>“We can start by taking small steps and making small changes that can have a big
                                        impact on the world.”</p>
                                </div>
                                <div className="wpo-about-left-info">
                                    <div className="wpo-about-left-inner">
                                        <div className="wpo-about-left-text">
                                            <h5>Robert Willum</h5>
                                            <span>CEO & Founder of Manit</span>
                                        </div>
                                    </div>
                                    <div className="signeture">
                                        <img src={sign} alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default About;