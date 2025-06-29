import { useState } from "react";
import {
  Upload,
  Send,
  X,
  AlertCircle,
  CheckCircle,
  MapPin,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Report = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    category: "",
    title: "",
    description: "",
    priority: "medium",
    mediaURL: "",
    latitude: null,
    longitude: null,
  });

  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpStatus, setOtpStatus] = useState("");

  const categories = [
    "Infrastructure",
    "Public Safety",
    "Environment",
    "Healthcare",
    "Education",
    "Transportation",
    "Utilities",
    "Other",
  ];
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmdinlogin = () => {
    navigate("/admin");
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));

        try {
          const res = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${
              import.meta.env.VITE_LOCATION_KEY
            }`
          );
          const data = await res.json();
          const formattedAddress = data.results[0]?.formatted;

          if (formattedAddress) {
            setFormData((prev) => ({ ...prev, location: formattedAddress }));
          } else {
            alert("Address not found from coordinates");
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          alert("Failed to retrieve address from coordinates");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        alert("Unable to retrieve your location");
        console.error(error);
        setIsFetchingLocation(false);
      }
    );
  };

  const sendOTP = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const data = await res.json();
      // console.log(data)
      if (data.success) {
        setIsOtpSent(true);
        setOtpStatus("OTP sent successfully! ${data.data.phone}");
      } else {
        setOtpStatus("Failed to send OTP.");
      }
    } catch (error) {
      console.error("OTP send error:", error);
      setOtpStatus("Error sending OTP.");
    }
  };

  const verifyOTP = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, otp }),
      });

      const data = await res.json();
      if (data.success) {
        setOtpStatus("OTP verified successfully!");
      } else {
        setOtpStatus("Incorrect OTP.");
      }
    } catch (error) {
      console.error("OTP verify error:", error);
      setOtpStatus("Error verifying OTP.");
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      const isValidSize = file.size <= 50 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      alert("Please select valid image or video files under 50MB");
      return;
    }

    setFiles((prev) => [...prev, ...validFiles].slice(0, 5));
    setIsUploading(true);

    try {
      const file = validFiles[0];
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "ReportBox");
      data.append("cloud_name", `${import.meta.env.VITE_CLOUDINARY_KEY}`);

      const fileType = file.type.startsWith("video/") ? "video" : "image";
      const uploadUrl = `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_KEY
      }/${fileType}/upload`;

      const res = await fetch(uploadUrl, { method: "POST", body: data });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }

      const uploadedResult = await res.json();
      setFormData((prev) => ({ ...prev, mediaURL: uploadedResult.secure_url }));
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (index === 0) {
      setFormData((prev) => ({ ...prev, mediaURL: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.location ||
      !formData.category ||
      !formData.title ||
      !formData.description
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/ReportForm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          location: "",
          category: "",
          title: "",
          description: "",
          priority: "medium",
          mediaURL: "",
          latitude: null,
          longitude: null,
        });
        setFiles([]);
      }, 3000);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Report Submitted!
          </h2>
          <p className="text-slate-600 mb-4">
            Your report has been successfully submitted. A government official
            will review it shortly.
          </p>
          <p className="text-sm text-slate-500">
            Report ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 px-8 py-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
            <div className="relative">
              <h1 className="text-4xl font-bold text-white mb-2">
                Report a Problem
              </h1>
              <p className="text-blue-100/80">
                Help us improve our community by reporting issues
              </p>
            </div>
            <button
              onClick={handleAmdinlogin}
              className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              Admin Login
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Phone Number
                </label>
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-amber-800 font-medium text-sm">
                    ⚠️ Limited Use | In Progress - waiting for more credits
                  </span>
                </div>
                <div className="flex gap-3">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="flex-grow px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={sendOTP}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium"
                  >
                    Send OTP
                  </button>
                </div>

                {isOtpSent && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={verifyOTP}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                    >
                      Verify OTP
                    </button>
                  </div>
                )}
                {otpStatus && (
                  <p className="text-sm mt-2 text-slate-600">{otpStatus}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Location *
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Street, City, State"
                    className="flex-grow px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={isFetchingLocation}
                    className={`px-4 py-3 rounded-xl text-white font-medium transition-all duration-200 ${
                      isFetchingLocation
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    }`}
                  >
                    {isFetchingLocation ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.latitude && formData.longitude && (
                  <p className="text-sm text-slate-500 mt-2">
                    Coordinates: {formData.latitude.toFixed(6)},{" "}
                    {formData.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            {/* Problem Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Priority Level
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Problem Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of the problem"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Detailed Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                placeholder="Please provide detailed information about the problem..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-slate-50/50 resize-vertical"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Attach Photos/Videos (Max 5 files, 50MB each)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-all duration-200 bg-slate-50/30">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">
                  Drag and drop files here, or click to select
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center px-6 py-3 rounded-xl cursor-pointer transition-all duration-200 font-medium ${
                    isUploading
                      ? "bg-slate-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                  }`}
                >
                  {isUploading ? "Uploading..." : "Select Files"}
                </label>
              </div>

              {formData.mediaURL && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-sm text-emerald-700">
                    ✓ Media uploaded successfully:{" "}
                    <a
                      href={formData.mediaURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-1"
                    >
                      View file
                    </a>
                  </p>
                </div>
              )}

              {files.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="relative bg-slate-50 rounded-xl p-4 border border-slate-200"
                    >
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="text-sm text-slate-700 truncate font-medium">
                        {file.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-center pt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading}
                className="inline-flex items-center px-12 py-4 bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 text-white font-semibold rounded-xl hover:from-slate-900 hover:via-blue-900 hover:to-indigo-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-3" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50/80 px-8 py-6 border-t border-slate-200">
            <div className="flex items-center text-sm text-slate-600">
              <AlertCircle className="w-4 h-4 mr-2 text-blue-600" />
              Your report will be reviewed by relevant government officials
              within 24-48 hours.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
