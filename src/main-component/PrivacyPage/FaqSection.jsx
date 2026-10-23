import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FaqSection = () => {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className="wpo-benefits-section">
      <div className="row">
        <div className="col-lg-12 col-12">
          <div className="wpo-benefits-item">
            <Accordion
              expanded={expanded === "panel1"}
              onChange={handleChange("panel1")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography sx={{ fontWeight: 500 }}>
                  What personal information do you collect?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Only what you choose to send us through the website, such as your name, email address, phone number and message, or your location details when you volunteer.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expanded === "panel2"}
              onChange={handleChange("panel2")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2bh-content"
                id="panel2bh-header"
              >
                <Typography sx={{ fontWeight: 500 }}>
                  How is my information used?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Only for the purpose you gave it for: replying to you, organising volunteering, sending campaign updates or processing a shop order.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expanded === "panel3"}
              onChange={handleChange("panel3")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel3bh-content"
                id="panel3bh-header"
              >
                <Typography sx={{ fontWeight: 500 }}>
                  Do you share my information with others?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  No. We do not sell your information or share it with third parties for their own marketing.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expanded === "panel4"}
              onChange={handleChange("panel4")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel4bh-content"
                id="panel4bh-header"
              >
                <Typography sx={{ fontWeight: 500 }}>
                  How can I have my information deleted?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Email vincent.kafula@gmail.com and ask us to delete it. You can also unsubscribe from updates at any time.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqSection;