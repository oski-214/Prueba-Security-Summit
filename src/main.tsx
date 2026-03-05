import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { DownloadView, hasShareParams } from "./DownloadView";
import "./styles.css";

/**
 * If the URL contains share params (?p=PROFILE_ID), the user arrived
 * via a QR code scan — show the download view directly.
 * Otherwise, render the normal quiz app.
 */
const RootComponent = hasShareParams() ? DownloadView : App;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);

