import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import stateEmergencyContacts from "../context/contact";

// National helplines that are valid everywhere in India.
const NATIONAL_HELPLINES = [
  { label: "Emergency (All-in-one)", number: "112" },
  { label: "Police", number: "100" },
  { label: "Ambulance", number: "102" },
  { label: "Fire", number: "101" },
  { label: "Women Helpline", number: "1091" },
  { label: "Domestic Abuse (Women)", number: "181" },
  { label: "Child Helpline", number: "1098" },
  { label: "Cyber Crime", number: "1930" },
];

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
        } catch {
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

      {/* National helplines — always available, tap to call */}
      <div className="w-full max-w-2xl mb-8">
        <h2 className="text-lg font-semibold text-blue-300 mb-3">
          National Helplines (tap to call)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {NATIONAL_HELPLINES.map(({ label, number }) => (
            <a
              key={number}
              href={`tel:${number}`}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-3 flex flex-col items-center text-center transition-colors"
            >
              <span className="text-xl font-bold">{number}</span>
              <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {label}
              </span>
            </a>
          ))}
        </div>
      </div>

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
