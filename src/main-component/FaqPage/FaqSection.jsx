import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { faqs } from "./faqData";

const FaqSection = () => {
  const [expanded, setExpanded] = React.useState("panel0");

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className="wpo-benefits-section">
      <div className="row">
        <div className="col-lg-12 col-12">
          <div className="wpo-benefits-item">
            {faqs.map((f, i) => (
              <Accordion key={f.q} expanded={expanded === `panel${i}`} onChange={handleChange(`panel${i}`)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`faq${i}-content`} id={`faq${i}-header`}>
                  <Typography component="h3" sx={{ fontWeight: 600, fontSize: 18 }}>{f.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ lineHeight: 1.7 }}>{f.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqSection;
