import React, { useState } from 'react';
import { Upload, Send, X, AlertCircle, CheckCircle } from 'lucide-react';

export default function ProblemReportApp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    category: '',
    title: '',
    description: '',
    priority: 'medium',
    mediaURL: ''
  });
  
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    'Infrastructure',
    'Public Safety',
    'Environment',
    'Healthcare',
    'Education',
    'Transportation',
    'Utilities',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async(e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      return isValidType && isValidSize;
    });
    
    if (validFiles.length === 0) {
      alert('Please select valid image or video files under 50MB');
      return;
    }

    setFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    setIsUploading(true);

    try {
      // Upload only the first file to get the URL
      const file = validFiles[0];
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "ReportBox");
      data.append("cloud_name", "dc4z5hijt"); 

      const fileType = file.type.startsWith("video/") ? "video" : "image"; 
      const uploadUrl = `https://api.cloudinary.com/v1_1/dc4z5hijt/${fileType}/upload`;

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: data
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }

      const uploadedResult = await res.json();
      console.log('Cloudinary URL:', uploadedResult.secure_url);
      
      // Store the Cloudinary URL in formData
      setFormData(prev => ({
        ...prev,
        mediaURL: uploadedResult.secure_url,
      }));

    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    // If removing the first file, clear the mediaURL
    if (index === 0) {
      setFormData(prev => ({
        ...prev,
        mediaURL: ''
      }));
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.location || !formData.category || !formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Log the complete form data including mediaURL
      console.log('Form data being submitted:', formData);
      
      const response = await fetch(`http://localhost:3000/api/ReportForm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Submit response:', result);
      
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          location: '',
          category: '',
          title: '',
          description: '',
          priority: 'medium',
          mediaURL: ''
        });
        setFiles([]);
      }, 3000);
      
    } catch (error) {
      console.error("Submit error:", error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your report has been successfully submitted. A government official will review it shortly.
          </p>
          <p className="text-sm text-gray-500">
            Report ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Report a Problem</h1>
            <p className="text-blue-100 mt-2">Help us improve our community by reporting issues</p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Street, City, State"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Problem Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of the problem"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                placeholder="Please provide detailed information about the problem..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Photos/Videos (Max 5 files, 50MB each)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
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
                  className={`inline-flex items-center px-4 py-2 rounded-md cursor-pointer transition-colors ${
                    isUploading 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? 'Uploading...' : 'Select Files'}
                </label>
              </div>

              {/* Show current mediaURL */}
              {formData.mediaURL && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">
                    ✓ Media uploaded successfully: 
                    <a href={formData.mediaURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                      View file
                    </a>
                  </p>
                </div>
              )}

              {/* File Preview */}
              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative bg-gray-50 rounded-lg p-3">
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="text-sm text-gray-600 truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-400">
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
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex items-center text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 mr-2" />
              Your report will be reviewed by relevant government officials within 24-48 hours.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}