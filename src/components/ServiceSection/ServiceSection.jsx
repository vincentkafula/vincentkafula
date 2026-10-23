import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link, useNavigate } from 'react-router-dom'
import SectionTitle from "../SectionTitle/SectionTitle";
import Services from '../../api/service'


const settings = {
    dots: true,
    arrows: true,
    speed: 1000,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [
        {
            breakpoint: 1400,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                infinite: true,
            }
        },
        {
            breakpoint: 1200,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                infinite: true,
                centerMode: false,
            }
        },
        {
            breakpoint: 991,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                centerMode: false,
            }
        },
        {
            breakpoint: 767,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                centerMode: false,
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                centerMode: false,
            }
        }
    ]
};

const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const ServiceSection = (props) => {
    const navigate = useNavigate();
    const downPos = React.useRef(null);
    // Open the issue when its card is clicked or tapped, but not when the slider is being swiped.
    const cardProps = (slug) => ({
        role: 'link',
        tabIndex: 0,
        style: { cursor: 'pointer' },
        onMouseDown: (e) => { downPos.current = [e.clientX, e.clientY]; },
        onClick: (e) => {
            const d = downPos.current;
            if (d && (Math.abs(e.clientX - d[0]) > 6 || Math.abs(e.clientY - d[1]) > 6)) return;
            if (e.target.closest('a')) return;
            ClickHandler();
            navigate(`/service-single/${slug}`);
        },
        onKeyDown: (e) => { if (e.key === 'Enter') { ClickHandler(); navigate(`/service-single/${slug}`); } },
    });

    return (
        <section className={`wpo-service-section section-padding ${props.sClass}`}>
            <div className="container">
                <SectionTitle subTitle={'Key Issues'} Title={'How we can build a better Zambia together'}/>
                <div className="row-grid wpo-service-slider">
                    <Slider {...settings}>
                        {Services.slice(0, 5).map((service, srv) => (
                            <div className="grid" key={srv}>
                                <div className="wpo-service-item" {...cardProps(service.slug)}>
                                    <div className="wpo-service-text">
                                        <div className="service-icon">
                                            <i className={`fi ${service.icon}`}></i>
                                        </div>
                                        <h2><Link onClick={ClickHandler}  to={`/service-single/${service.slug}`}>{service.sTitle}</Link></h2>
                                        <p>{service.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
}

export default ServiceSection;