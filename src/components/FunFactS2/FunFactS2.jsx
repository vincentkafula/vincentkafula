import React from 'react'
import CountUp from 'react-countup';
import VideoModal from '../ModalVideo/VideoModal';
import fImg from '../../images/funfact2.jpg' 

const FunFactS2 = (props) => {

    return (
        <div className={props.fnTpClass}>
            <section className={`wpo-fun-fact-section-s2 content ${props.fnClass}`}>
                <div className="container">
                    <div className="row">
                        <div className="col col-lg-12">
                            <div className="wpo-fun-fact-wrap">
                                <div className="wpo-fun-fact-grids clearfix">
                                    <div className="grid">
                                        <div className="info">
                                            <h3 className="stat-lg"><span><CountUp end={22.5} decimals={1} enableScrollSpy /></span> Million</h3>
                                            <p>People</p>
                                        </div>
                                    </div>
                                    <div className="grid">
                                        <div className="info">
                                            <h3 className="stat-lg"><span><CountUp end={752610} separator="," enableScrollSpy /></span> km²</h3>
                                            <p>Square Kilometers</p>
                                        </div>
                                    </div>
                                    <div className="grid">
                                        <div className="info">
                                            <h3><span><CountUp end={32} enableScrollSpy /></span>%</h3>
                                            <p>Farming Land</p>
                                        </div>
                                    </div>
                                    <div className="grid">
                                        <div className="info">
                                            <h3>$<CountUp end={1542} separator="," enableScrollSpy /></h3>
                                            <p>Average Costs of Home</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div className="funfact-video">
                <div className="container">
                    <img src={fImg} alt="" />
                    <VideoModal />
                </div>
            </div>
        </div>
    )
}

export default FunFactS2;