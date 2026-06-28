import { Info } from "lucide-react";

// Reusable "this is information, not legal advice" notice. Important given the
// audience may rely on the assistant in stressful situations.
const Disclaimer = ({ className = "" }) => (
  <div
    className={`flex items-start gap-2 text-xs text-slate-400 bg-white/5 border border-white/10 rounded-lg px-3 py-2 ${className}`}
  >
    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-300" />
    <span>
      SEVAK gives general legal information, not legal advice. For your specific
      case, consult a qualified lawyer or your nearest District Legal Services
      Authority (free legal aid). In an emergency, call 112.
    </span>
  </div>
);

export default Disclaimer;
