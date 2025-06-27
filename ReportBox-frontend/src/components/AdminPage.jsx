import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

const AdminDashboard = () => {
  const navigate = useNavigate(); 
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminReports, setAdminReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const ADMIN_PASSWORD = "admin123"; 

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
      setAdminReports(reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Failed to fetch reports. Please try again.');
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminPassword('');
    setAdminReports([]);
    sessionStorage.removeItem('adminAuthenticated'); 
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1); 
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
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminAuthenticated ? (
        /* Admin Login Page */
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <div className="flex items-center mb-6">
              <button
                onClick={handleGoBack}
                className="mr-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
            </div>
            
            <div>
              <input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAdminLogin}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={handleGoBack}
                  className="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
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
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-purple-100 mt-1">
                  Manage submitted reports ({adminReports.length} total)
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchReports}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors"
                >
                  Refresh
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Reports Content */}
          <div className="max-w-7xl mx-auto p-6">
            {isLoadingReports ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading reports...</span>
              </div>
            ) : adminReports.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl">No reports found</p>
                <p className="text-sm mt-2">Reports will appear here once submitted</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adminReports.map((report, index) => (
                  <div key={report._id || index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.title}</h3>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">By:</span> {report.name} | {report.email} | {report.location}
                        </p>
                        {report.phone && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Phone:</span> {report.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                          {report.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {report.category}
                        </span>
                        {report.status && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            report.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status.toUpperCase()}
                          </span>
                        )}
                        {report.createdAt && (
                          <span className="text-xs text-gray-500">
                            {formatDate(report.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">{report.description}</p>
                    </div>
                    
                    {report.mediaURL && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Attached Media:</p>
                        <a
                          href={report.mediaURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm"
                        >
                          View Attachment →
                        </a>
                      </div>
                    )}

                    {/* Status Update Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => updateReportStatus(report._id, 'pending')}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                      >
                        Mark Pending
                      </button>
                      <button
                        onClick={() => updateReportStatus(report._id, 'in-progress')}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => updateReportStatus(report._id, 'resolved')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                      >
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