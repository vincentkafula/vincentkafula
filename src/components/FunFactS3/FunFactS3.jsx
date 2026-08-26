import React from 'react'
import CountUp, { useCountUp } from 'react-countup';

const FunFactS3 = (props) => {

    useCountUp({
        ref: 'counter',
        end: 1234567,
        enableScrollSpy: true,
        scrollSpyDelay: 1000,
    });

    return (
        <div>
            <section className="wpo-fun-fact-section-s2 content">
                <div className="container">
                    <div className="row">
                        <div className="col col-lg-12">
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
                <span id="counter" />
            </section>
        </div>
    )
}

export default FunFactS3;