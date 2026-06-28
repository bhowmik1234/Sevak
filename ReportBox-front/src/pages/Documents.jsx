import { useEffect, useState } from "react";
import {
  FileText,
  Sparkles,
  Loader,
  Copy,
  Download,
  Printer,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Disclaimer from "../components/Disclaimer";

function Documents() {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const { language, setLanguage, languages } = useLanguage();

  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [values, setValues] = useState({});
  const [document, setDocument] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/documents/templates`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTemplates(data?.data?.templates ?? []);
      } catch (err) {
        console.error("Failed to load templates:", err);
        setError("Could not load document templates. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplates();
  }, [API_BASE_URL]);

  const selectTemplate = (tmpl) => {
    setSelected(tmpl);
    setValues({});
    setDocument("");
    setError(null);
  };

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const missingRequired = selected
    ? selected.fields.filter((f) => f.required && !values[f.key]?.trim())
    : [];

  const handleGenerate = async () => {
    if (!selected || missingRequired.length > 0) return;
    setIsGenerating(true);
    setError(null);
    setDocument("");
    try {
      const res = await fetch(`${API_BASE_URL}/documents/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          template_id: selected.id,
          fields: values,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }
      setDocument(data.data.document);
    } catch (err) {
      console.error("Document generation failed:", err);
      setError(`Could not draft the document: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyDocument = async () => {
    try {
      await navigator.clipboard.writeText(document);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const downloadDocument = () => {
    const blob = new Blob([document], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${selected?.id || "sevak"}-draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printDocument = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<pre style="font-family: ui-monospace, monospace; white-space: pre-wrap; padding: 24px; font-size: 14px;">${document
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</pre>`
    );
    win.document.close();
    win.focus();
    win.print();
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md mx-4">
          <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-slate-300 mb-6">
            You need to be logged in to draft legal documents.
          </p>
          <Link
            to="/login"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            Document Drafting
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 mt-2">
            Generate a ready-to-file draft from a few details. Review and fill any
            [placeholders] before submitting.
          </p>
        </div>

        <Disclaimer className="mb-6" />

        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-3 text-slate-300">
            <Loader className="w-5 h-5 animate-spin" /> Loading templates…
          </div>
        ) : !selected ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => selectTemplate(tmpl)}
                className="text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 rounded-2xl p-5 transition-all duration-200"
              >
                <h3 className="text-lg font-semibold text-white mb-1">
                  {tmpl.name}
                </h3>
                <p className="text-sm text-slate-400">{tmpl.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> All templates
              </button>
              <h2 className="text-xl font-bold mb-1">{selected.name}</h2>
              <p className="text-sm text-slate-400 mb-4">
                {selected.description}
              </p>

              <label className="block text-sm text-slate-300 mb-1">
                Output language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full mb-4 bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>

              <div className="space-y-3">
                {selected.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm text-slate-300 mb-1">
                      {field.label}
                      {field.required && (
                        <span className="text-red-400"> *</span>
                      )}
                    </label>
                    {field.key === "details" ||
                    field.key === "information" ||
                    field.key === "problem" ||
                    field.key === "facts" ? (
                      <textarea
                        rows="4"
                        value={values[field.key] || ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full bg-slate-800/80 border border-white/15 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                      />
                    ) : (
                      <input
                        type="text"
                        value={values[field.key] || ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full bg-slate-800/80 border border-white/15 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || missingRequired.length > 0}
                className={`mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isGenerating || missingRequired.length > 0
                    ? "bg-slate-600/50 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" /> Drafting…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Draft Document
                  </>
                )}
              </button>
              {missingRequired.length > 0 && (
                <p className="text-xs text-amber-300 mt-2">
                  Fill the required fields marked with *.
                </p>
              )}
            </div>

            {/* Output */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-200">Draft</h3>
                {document && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={copyDocument}
                      title="Copy"
                      className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={downloadDocument}
                      title="Download .txt"
                      className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={printDocument}
                      title="Print / Save as PDF"
                      className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {document ? (
                <pre className="flex-1 whitespace-pre-wrap font-mono text-sm text-slate-100 bg-black/30 rounded-xl p-4 overflow-auto no-scrollbar">
                  {document}
                </pre>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm text-center min-h-[200px]">
                  Your drafted document will appear here.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Documents;
