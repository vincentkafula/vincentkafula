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
                  Is the content on this website government policy?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  No. It describes the proposals and commitments of the Build One Zambia campaign, provided for public information and discussion.
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
                  Can I share content from this website?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Yes. You may share links and quote short passages, provided you credit the source and do not change the meaning.
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
                  Can these terms change?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Yes. We may update these terms and the website content at any time; the latest version is always on this page.
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
                  Who can I contact about these terms?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Send any questions to vincent.kafula@gmail.com.
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