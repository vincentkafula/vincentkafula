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
                                        <h3 className="stat-lg"><span><CountUp end={28.9} decimals={1} enableScrollSpy /></span> Billion</h3>
                                        <p>USD Public Debt to Address</p>
                                    </div>
                                </div>
                                <div className="grid">
                                    <div className="info">
                                        <h3 className="stat-lg"><span><CountUp end={10} enableScrollSpy /></span> Provinces</h3>
                                        <p>Each With a Power Plant</p>
                                    </div>
                                </div>
                                <div className="grid">
                                    <div className="info">
                                        <h3><span><CountUp end={70} enableScrollSpy /></span>%</h3>
                                        <p>Export Earnings From Copper</p>
                                    </div>
                                </div>
                                <div className="grid">
                                    <div className="info">
                                        <h3><CountUp end={73} enableScrollSpy /></h3>
                                        <p>Tribes in One Nation</p>
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