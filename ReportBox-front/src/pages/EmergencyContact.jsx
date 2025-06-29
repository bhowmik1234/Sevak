import React, { useEffect, useState } from "react";
import stateEmergencyContacts from "../context/contact"; // Adjust the import path as necessary

const EmergencyContact = () => {
  const [location, setLocation] = useState({ state: "", country: "" });
  const [contacts, setContacts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );

          if (!response.ok) throw new Error("Failed to fetch location info");

          const data = await response.json();
          const state = data.address.state;
          const country = data.address.country;

          setLocation({ state, country });

          if (country === "India") {
            const matchedContacts = stateEmergencyContacts(state) || null;
            setContacts(matchedContacts);
          }
        } catch (err) {
          setError("Unable to retrieve location details.");
        }
      },
      () => {
        setError("Location permission denied.");
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Emergency Contacts</h1>

      {error && <p className="text-red-400">{error}</p>}

      {!error && !location.state && <p>Detecting your location...</p>}

      {location.state && (
        <div className="text-slate-400 mb-6">
          Location Detected: <strong>{location.state}, {location.country}</strong>
        </div>
      )}

      {contacts ? (
        <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-lg">
          <h2 className="text-lg font-semibold text-blue-300 mb-4">Important Numbers</h2>
          {Object.entries(contacts).map(([label, number]) => (
            <div key={label} className="flex justify-between py-2 border-b border-slate-700">
              <span>{label.replace(/([A-Z])/g, " $1")}</span>
              <a href={`tel:${number}`} className="text-blue-400 hover:underline">
                {number}
              </a>
            </div>
          ))}
        </div>
      ) : location.country === "India" && location.state ? (
        <p className="text-yellow-300">No emergency contacts available for this state.</p>
      ) : null}
    </div>
  );
};

export default EmergencyContact;
