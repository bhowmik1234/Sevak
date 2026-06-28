import { useEffect } from "react";
import { LogOut } from "lucide-react";

// Quick-exit / panic button for users at risk (e.g. domestic-violence victims).
// Instantly leaves the site for a neutral page and replaces history so the back
// button does not reveal what they were viewing. Also bound to the Esc key.
const NEUTRAL_URL = "https://www.google.com";

const SafetyExit = () => {
  const quickExit = () => {
    // Open a harmless page in this tab, replacing history where possible.
    try {
      window.open(NEUTRAL_URL, "_blank", "noopener");
    } catch {
      // Pop-up blocked — the replace below still gets the user out.
    }
    window.location.replace("https://www.weather.com");
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        quickExit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <button
      onClick={quickExit}
      title="Quickly leave this site (or press Esc)"
      aria-label="Quick exit to a neutral website"
      className="fixed bottom-6 left-6 z-[60] flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-full shadow-2xl border border-white/20 text-sm font-semibold transition-all duration-200 transform hover:scale-105"
    >
      <LogOut className="w-4 h-4" />
      Quick Exit
    </button>
  );
};

export default SafetyExit;
