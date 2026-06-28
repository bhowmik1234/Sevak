import { Scale, Phone, ExternalLink, Shield, Users, Heart } from "lucide-react";

// National helplines — tap-to-call on mobile.
const HELPLINES = [
  { label: "Emergency (All-in-one)", number: "112", Icon: Shield },
  { label: "Police", number: "100", Icon: Shield },
  { label: "Women Helpline", number: "1091", Icon: Heart },
  { label: "Domestic Abuse (Women)", number: "181", Icon: Heart },
  { label: "Child Helpline", number: "1098", Icon: Users },
  { label: "Cyber Crime", number: "1930", Icon: Shield },
  { label: "Senior Citizen Helpline", number: "14567", Icon: Users },
  { label: "NALSA Legal Aid", number: "15100", Icon: Scale },
];

// Free legal-aid / rights resources.
const RESOURCES = [
  {
    name: "NALSA — National Legal Services Authority",
    description:
      "Free legal aid and Lok Adalats for those who cannot afford a lawyer.",
    url: "https://nalsa.gov.in/",
  },
  {
    name: "Find your District Legal Services Authority (DLSA)",
    description:
      "Every district has a DLSA that provides a free lawyer to eligible people.",
    url: "https://nalsa.gov.in/state-legal-services-authorities",
  },
  {
    name: "National Cyber Crime Reporting Portal",
    description: "Report online fraud, harassment, and cyber crime.",
    url: "https://cybercrime.gov.in/",
  },
  {
    name: "RTI Online",
    description: "File a Right to Information request with central authorities.",
    url: "https://rtionline.gov.in/",
  },
];

function LegalAid() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-400" />
          Free Legal Aid & Helplines
        </h1>
        <p className="text-slate-400 mb-8">
          If you cannot afford a lawyer, you have a right to free legal aid in
          India. Below are national helplines and trusted resources.
        </p>

        {/* Helplines */}
        <h2 className="text-xl font-semibold mb-4 text-slate-200">
          Tap to call a helpline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
          {HELPLINES.map((item) => (
            <a
              key={item.number}
              href={`tel:${item.number}`}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-200"
            >
              <item.Icon className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-2xl font-bold">{item.number}</span>
              <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {item.label}
              </span>
            </a>
          ))}
        </div>

        {/* Resources */}
        <h2 className="text-xl font-semibold mb-4 text-slate-200">
          Resources & how to get help
        </h2>
        <div className="space-y-3">
          {RESOURCES.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 rounded-2xl p-5 transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">{r.name}</h3>
                <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
              <p className="text-sm text-slate-400 mt-1">{r.description}</p>
            </a>
          ))}
        </div>

        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 text-sm text-slate-300">
          <strong className="text-blue-300">Who qualifies for free legal aid?</strong>{" "}
          Women, children, SC/ST members, victims of trafficking or disaster,
          persons with disabilities, those in custody, and anyone earning below
          the income limit set by their state are entitled to a free lawyer
          under the Legal Services Authorities Act, 1987.
        </div>
      </div>
    </div>
  );
}

export default LegalAid;
