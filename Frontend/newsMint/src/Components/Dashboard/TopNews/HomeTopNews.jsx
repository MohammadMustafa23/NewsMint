import React from "react";
import DashHeroArticle from "./DashHeroArticle";
import DashLanguageToggle from "./DashLanguageToggle";
import DashTrending from "./DashTrending";
import DashBriefingsGrid from "./DashBriefingsGrid";
import "./style/HomeTopNews.css";

const TRENDING_TOPICS = [
  { category: "Technology", tag: "#AIResearch", mentions: "24k mentions" },
  {
    category: "Regional Business",
    tag: "#JaipurStartups",
    mentions: "18k mentions",
  },
  { category: "Economy", tag: "#GlobalTrade", mentions: "15k mentions" },
  {
    category: "Environment",
    tag: "#ClimateSummit24",
    mentions: "12k mentions",
  },
];

const BRIEFINGS = [
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

const HomeTopNews = () => {
  const handleLanguageChange = (lang) => {
    console.log("Language changed to:", lang);
  };

  const handleTopicClick = (tag) => {
    console.log("Clicked topic:", tag);
  };

  const handleReadHero = () => {
    console.log("Read full hero story");
  };

  const handleReadBriefing = (id) => {
    console.log("Read briefing:", id);
  };

  return (
    <div className="dash-top-news-page">
      <div className="dash-top-news-page__container">
        {/* Top Section: Hero + Sidebar */}
        <div className="dash-top-news-page__top">
          <DashHeroArticle
            label="Headline of the Day"
            imageUrl="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop"
            imageAlt="Global Markets"
            title="Global Markets Rally Following Unexpected Shifts in Continental Trade Policy"
            description="In an unprecedented move that caught many leading analysts off guard, key continental powers have signed a provisional accord restructuring tariffs across major tech and agriculture sectors, sending ripples of optimism through early morning trading sessions."
            author="Jonathan Reed"
            readTime="8 Min Read"
            buttonText="Read Full Story"
            onReadMore={handleReadHero}
          />

          {/* Sidebar */}
          <aside className="dash-top-news-page__sidebar">
            <DashLanguageToggle
              label="Select Language"
              selected="ENG"
              onChange={handleLanguageChange}
            />
            <DashTrending
              title="Trending Now"
              topics={TRENDING_TOPICS}
              onTopicClick={handleTopicClick}
            />
          </aside>
        </div>

        {/* Divider */}
        <hr className="dash-top-news-page__divider" />

        {/* Bottom Section: Briefings */}
        <DashBriefingsGrid
          heading="Essential Briefings"
          briefings={BRIEFINGS}
          buttonText="Read Summary"
          onReadCard={handleReadBriefing}
        />
      </div>
    </div>
  );
};

export default HomeTopNews;
