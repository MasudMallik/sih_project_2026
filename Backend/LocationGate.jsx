import React, { useEffect, useState } from "react";

/**
 * Wraps the authenticated app. After login, requests the device's
 * location and blocks rendering of children until it's granted.
 * See architecture spec, Section 6a, for the product rationale
 * and the accessibility trade-off worth revisiting later.
 */
export default function LocationGate({ children }) {
  const [status, setStatus] = useState("checking"); // checking | granted | denied

  const requestLocation = () => {
    setStatus("checking");

    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => setStatus("granted"),
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  if (status === "checking") {
    return <div className="location-gate__loading">Checking location access…</div>;
  }

  if (status === "denied") {
    return (
      <div className="location-gate__blocked" role="alert">
        <h2>Location required</h2>
        <p>This app needs your location to show risk near you. Please allow location access to continue.</p>
        <button type="button" onClick={requestLocation}>
          Try again
        </button>
      </div>
    );
  }

  return children;
}
