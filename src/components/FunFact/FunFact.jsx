import React from 'react'
import CountUp from 'react-countup';
import VideoModal from '../ModalVideo/VideoModal';

const FunFact = (props) => {

    return (
        <section className="wpo-fun-fact-section content">
            <div className="right-bg">
                <VideoModal/>
            </div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col col-lg-6">
                        <div className="wpo-fun-fact-wrap">
                            <div className="wpo-fun-fact-grids clearfix">
                                <div className="grid">
                                    <div className="info">
                                        <h3 className="stat-lg"><span><CountUp end={22.5} decimals={1} enableScrollSpy /></span> Million</h3>
                                        <p>Total People Living in Our Country</p>
                                    </div>
                                </div>
                                <div className="grid">
                                    <div className="info">
                                        <h3 className="stat-lg"><span><CountUp end={752610} separator="," enableScrollSpy /></span> km²</h3>
                                        <p>Square Kilometers Region Zambia Covers</p>
                                    </div>
                                </div>
                                <div className="grid">
                                    <div className="info">
                                        <h3><span><CountUp end={32} enableScrollSpy /></span>%</h3>
                                        <p>Private & Domestic Garden Land</p>
                                    </div>
                                </div>
                                <div className="grid">
                                    <div className="info">
                                        <h3 className="stat-lg">$475–$1,542</h3>
                                        <p>Average Costs of Home Ownership (per month)</p>
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

export default FunFact;