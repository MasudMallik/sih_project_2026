import React, { useState } from "react";

/**
 * Signup form: email, password, and location captured together.
 * Location is required — the form will not submit without it.
 */
export default function SignupForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const captureLocation = () => {
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => setLocationError("Location is required to sign up. Please allow access.")
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (!location) {
      setLocationError("Location is required to sign up.");
      return;
    }

    try {
      const response = await fetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, location }),
      });

      if (!response.ok) {
        const body = await response.json();
        setSubmitError(body.detail || "Signup failed");
        return;
      }

      onSuccess(await response.json());
    } catch {
      setSubmitError("Network error — please try again");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />
      </label>

      <div>
        {location ? (
          <p>Location captured</p>
        ) : (
          <button type="button" onClick={captureLocation}>
            Share location
          </button>
        )}
        {locationError && <p role="alert">{locationError}</p>}
      </div>

      {submitError && <p role="alert">{submitError}</p>}

      <button type="submit">Sign up</button>
    </form>
  );
}
