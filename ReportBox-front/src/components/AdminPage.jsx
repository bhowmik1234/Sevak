import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowLeft, RotateCcw, LogOut, Eye, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminReports, setAdminReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const ADMIN_PASSWORD = "admin123";

  // Mock data for demonstration
  const mockReports = [
    {
      _id: '1',
      title: 'Noise Complaint - Residential Area',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      location: 'Guntur, Andhra Pradesh',
      phone: '+91 9876543210',
      category: 'Noise Pollution',
      priority: 'high',
      status: 'pending',
      description: 'Excessive noise from construction work during night hours affecting the entire residential complex. The noise levels are beyond acceptable limits and disturbing sleep of residents including children and elderly.',
      mediaURL: 'https://example.com/media/noise-complaint.jpg',
      createdAt: '2025-06-25T10:30:00Z'
    },
    {
      _id: '2',
      title: 'Illegal Dumping of Waste',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      location: 'Vijayawada, Andhra Pradesh',
      phone: '+91 8765432109',
      category: 'Environmental',
      priority: 'urgent',
      status: 'in-progress',
      description: 'Industrial waste being dumped illegally near the residential area causing health hazards and environmental pollution. Immediate action required.',
      mediaURL: 'https://example.com/media/waste-dumping.jpg',
      createdAt: '2025-06-24T14:15:00Z'
    },
    {
      _id: '3',
      title: 'Traffic Signal Malfunction',
      name: 'Suresh Reddy',
      email: 'suresh.reddy@email.com',
      location: 'Amaravati, Andhra Pradesh',
      category: 'Traffic',
      priority: 'medium',
      status: 'resolved',
      description: 'Traffic signal at main junction has been malfunctioning for 3 days causing traffic congestion and safety concerns.',
      createdAt: '2025-06-23T09:45:00Z'
    }
  ];

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (isAuthenticated === 'true') {
      setIsAdminAuthenticated(true);
      fetchReports();
    }
  }, []);

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('adminAuthenticated', 'true');
      fetchReports();
    } else {
      alert('Invalid admin password');
    }
  };

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/ReportForm`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reports = await response.json();
      setAdminReports(reports.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Failed to fetch reports. Please try again.');
      // Fallback to mock data for demo purposes
      setAdminReports(mockReports);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const navigate=useNavigate();
  const handleLogout = () => {
    navigate('/report')
  };

  const handleGoBack = () => {
    navigate('/report')
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const updateReportStatus = async (reportId, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/ReportForm/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      fetchReports();
    } catch (error) {
      console.error('Error updating report status:', error);
      alert('Failed to update report status. Please try again.');
      // Fallback to local state update for demo
      setAdminReports(prev => 
        prev.map(report => 
          report._id === reportId ? { ...report, status } : report
        )
      );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {!isAdminAuthenticated ? (
        /* Admin Login Page */
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-slate-800/50"></div>
          
          {/* Decorative circles */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center mb-8">
              <button
                onClick={handleGoBack}
                className="mr-4 text-slate-400 hover:text-blue-400 transition-colors duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-white">Admin Login</h2>
                <p className="text-slate-400 text-sm mt-1">SEVAK Dashboard Access</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className="w-full px-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-slate-400 transition-all duration-200"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAdminLogin}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/25"
                >
                  Login
                </button>
                <button
                  onClick={handleGoBack}
                  className="flex-1 px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 transition-all duration-200 font-medium border border-slate-600/50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen">
          {/* Admin Header */}
          <div className="bg-gradient-to-r from-slate-800/90 via-blue-800/90 to-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    SEVAK
                    <span className="text-blue-400 ml-2">Admin</span>
                  </h1>
                  <p className="text-slate-300 text-lg">
                    Professional Legal Services Dashboard
                  </p>
                  <p className="text-slate-400 mt-2">
                    Managing {adminReports.length} reports • Navigate complex legal matters with confidence
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={fetchReports}
                    className="flex items-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-all duration-200 border border-slate-600/50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Refresh
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 bg-red-600/80 hover:bg-red-700/80 text-white rounded-xl transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Content */}
          <div className="max-w-7xl mx-auto p-6">
            {isLoadingReports ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-slate-300 mt-4">Loading reports...</span>
              </div>
            ) : adminReports.length === 0 ? (
              <div className="text-center text-slate-400 py-16">
                <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700/50">
                  <AlertCircle className="w-20 h-20 mx-auto mb-6 text-slate-500" />
                  <p className="text-2xl font-semibold text-slate-300 mb-2">No reports found</p>
                  <p className="text-slate-400">Reports will appear here once submitted through the system</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {adminReports.map((report, index) => (
                  <div key={report._id || index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-3">{report.title}</h3>
                        <div className="space-y-2">
                          <p className="text-slate-300">
                            <span className="text-blue-400 font-medium">Contact:</span> {report.name} • {report.email}
                          </p>
                          <p className="text-slate-300">
                            <span className="text-blue-400 font-medium">Location:</span> {report.location}
                          </p>
                          {report.phone && (
                            <p className="text-slate-300">
                              <span className="text-blue-400 font-medium">Phone:</span> {report.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex flex-wrap gap-2 justify-end">
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getPriorityColor(report.priority)}`}>
                            {report.priority?.toUpperCase() || 'MEDIUM'}
                          </span>
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium border border-blue-500/30">
                            {report.category}
                          </span>
                        </div>
                        {report.status && (
                          <span className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            {report.status.toUpperCase().replace('-', ' ')}
                          </span>
                        )}
                        {report.createdAt && (
                          <span className="text-sm text-slate-400">
                            {formatDate(report.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-slate-300 leading-relaxed bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
                        {report.description}
                      </p>
                    </div>
                    
                    {report.mediaURL && (
                      <div className="mb-6">
                        <p className="text-blue-400 font-medium mb-3">Attached Evidence:</p>
                        <a
                          href={report.mediaURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all duration-200 border border-blue-500/30"
                        >
                          <Eye className="w-4 h-4" />
                          View Attachment
                        </a>
                      </div>
                    )}

                    {/* Status Update Buttons */}
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-700/50">
                      <button
                        onClick={() => updateReportStatus(report._id, 'pending')}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 text-yellow-300 rounded-lg hover:bg-yellow-600/30 transition-all duration-200 border border-yellow-500/30 text-sm font-medium"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Mark Pending
                      </button>
                      <button
                        onClick={() => updateReportStatus(report._id, 'in-progress')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all duration-200 border border-blue-500/30 text-sm font-medium"
                      >
                        <Clock className="w-4 h-4" />
                        In Progress
                      </button>
                      <button
                        onClick={() => updateReportStatus(report._id, 'resolved')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition-all duration-200 border border-green-500/30 text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;