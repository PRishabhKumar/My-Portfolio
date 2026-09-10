import React from "react";
import { createRoot } from "react-dom/client";
import PortfolioExperience from "./DesktopIntro.jsx";
import ProjectArt from "./ProjectArt.jsx";
import "./fonts.css";
import "./styles.css";
import "./artwork.css";
import "./enhancements.css";
import "./immersive.css";
import "./desktop-intro.css";
import "./location-journey.css";

const artwork = new URLSearchParams(window.location.search).get("artwork");
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {artwork ? (
      <div className="artwork-export">
        <ProjectArt type={artwork} />
      </div>
    ) : (
      <PortfolioExperience />
    )}
  </React.StrictMode>,
);
