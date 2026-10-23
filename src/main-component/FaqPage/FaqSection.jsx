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
                  What is Build One Zambia?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Build One Zambia is a national movement rooted in the belief that Zambians — farmers, builders, teachers, entrepreneurs and young people — have everything it takes to transform the country, without opaque tender systems or foreign contractors taking the nation’s wealth.
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
                  Who can become a member of Build One Zambia?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Membership is open to every Zambian aged 18 or older, regardless of tribe, race, colour or creed, who accepts the principles, policies and programmes of Build One Zambia.
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
                  What are the aims and objectives of Build One Zambia?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Its aim is to build a united, non-tribal, non-racial, non-sexist and democratic society. Its objective is to improve the quality of life of all Zambians, especially the poorest and most vulnerable. The Constitution of Zambia remains its foundational policy document.
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
                  How can I get involved?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  You can volunteer to organise in your province, district or ward, share the message with your community, join an agricultural cooperative, and vote for Build One Zambia. Use the volunteer or contact page to get started.
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