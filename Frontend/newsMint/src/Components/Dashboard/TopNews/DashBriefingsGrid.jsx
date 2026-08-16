import React from "react";
import DashBriefingCard from "./DashBriefingCard";
import "./style/DashBriefingsGrid.css";

const DEFAULT_BRIEFINGS = [
  {
    id: "1",
    icon: "🏛",
    category: "The Chronical",
    title:
      "Central Bank Signals Pause on Interest Rate Hikes Amidst Inflation Data",
    description:
      "Following three consecutive quarters of aggressive tightening, policymakers hinted at a more measured approach in the coming...",
  },
  {
    id: "2",
    icon: "🔋",
    category: "Tech Frontiers",
    title:
      "Breakthrough in Solid-State Battery Tech Could Revolutionize EV Range",
    description:
      "A consortium of university researchers and automotive engineers announced a new stable electrolyte composition that effectively double...",
  },
  {
    id: "3",
    icon: "🌐",
    category: "Global Diplomat",
    title:
      "European Union Proposes Sweeping Regulations on Generative AI Models",
    description:
      "The draft legislation focuses heavily on transparency mandates, requiring developers of large language models to disclose training dat...",
  },
];

const DashBriefingsGrid = ({
  heading = "Essential Briefings",
  briefings = DEFAULT_BRIEFINGS,
  buttonText = "Read Summary",
  onReadCard,
}) => {
  return (
    <section className="dash-briefings-grid">
      <h2 className="dash-briefings-grid__heading">{heading}</h2>

      <div className="dash-briefings-grid__cards">
        {briefings.map((item) => (
          <DashBriefingCard
            key={item.id}
            icon={item.icon}
            category={item.category}
            title={item.title}
            description={item.description}
            buttonText={buttonText}
            onRead={() => onReadCard?.(item.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default DashBriefingsGrid;
