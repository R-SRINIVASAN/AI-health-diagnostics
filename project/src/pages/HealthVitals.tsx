import React, { useState, useEffect } from 'react';
import { Activity, Plus, TrendingUp, Download, Calendar, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { HealthVital } from '../types';
import { Line } from 'react-chartjs-2';
import { PDFExportUtil } from '../utils/pdfExport';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HealthVitals: React.FC = () => {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<HealthVital[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    oxygenSaturation: '',
    bloodSugar: '',
    temperature: '',
    weight: '',
    notes: ''
  });

  // Load user's vitals from localStorage
  useEffect(() => {
    if (user) {
      const userVitals = localStorage.getItem(`vitals_${user.id}`);
      if (userVitals) {
        const parsedVitals = JSON.parse(userVitals).map((vital: any) => ({
          ...vital,
          date: new Date(vital.date)
        }));
        setVitals(parsedVitals);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVital: HealthVital = {
      id: Date.now().toString(),
      userId: user?.id || '1',
      date: new Date(),
      bloodPressureSystolic: parseInt(formData.bloodPressureSystolic),
      bloodPressureDiastolic: parseInt(formData.bloodPressureDiastolic),
      heartRate: parseInt(formData.heartRate),
      oxygenSaturation: parseInt(formData.oxygenSaturation),
      bloodSugar: parseInt(formData.bloodSugar),
      temperature: parseFloat(formData.temperature),
      weight: parseFloat(formData.weight),
      notes: formData.notes
    };

    const updatedVitals = [newVital, ...vitals];
    setVitals(updatedVitals);
    
    // Save to localStorage
    if (user) {
      localStorage.setItem(`vitals_${user.id}`, JSON.stringify(updatedVitals));
    }
    
    setFormData({
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      heartRate: '',
      oxygenSaturation: '',
      bloodSugar: '',
      temperature: '',
      weight: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const getChartData = () => {
    const last30Days = vitals.slice(0, 30).reverse();
    const labels = last30Days.map(v => new Date(v.date).toLocaleDateString());

    const datasets = [];

    if (selectedMetric === 'all' || selectedMetric === 'bloodPressure') {
      datasets.push({
        label: 'Systolic BP',
        data: last30Days.map(v => v.bloodPressureSystolic),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0.4
      });
    }

    if (selectedMetric === 'all' || selectedMetric === 'heartRate') {
      datasets.push({
        label: 'Heart Rate',
        data: last30Days.map(v => v.heartRate),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.4
      });
    }

    if (selectedMetric === 'all' || selectedMetric === 'bloodSugar') {
      datasets.push({
        label: 'Blood Sugar',
        data: last30Days.map(v => v.bloodSugar),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: false,
        tension: 0.4
      });
    }

    if (selectedMetric === 'all' || selectedMetric === 'oxygenSaturation') {
      datasets.push({
        label: 'Oxygen Saturation',
        data: last30Days.map(v => v.oxygenSaturation),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: false,
        tension: 0.4
      });
    }

    return { labels, datasets };
  };

  const calculateStats = () => {
    if (vitals.length === 0) return null;

    const last7Days = vitals.slice(0, 7);
    
    const avgBP = {
      systolic: Math.round(last7Days.reduce((sum, v) => sum + v.bloodPressureSystolic, 0) / last7Days.length),
      diastolic: Math.round(last7Days.reduce((sum, v) => sum + v.bloodPressureDiastolic, 0) / last7Days.length)
    };

    const avgHeartRate = Math.round(last7Days.reduce((sum, v) => sum + v.heartRate, 0) / last7Days.length);
    const maxSpO2 = Math.max(...last7Days.map(v => v.oxygenSaturation));
    const minSpO2 = Math.min(...last7Days.map(v => v.oxygenSaturation));
    const avgBloodSugar = Math.round(last7Days.reduce((sum, v) => sum + v.bloodSugar, 0) / last7Days.length);

    return { avgBP, avgHeartRate, maxSpO2, minSpO2, avgBloodSugar };
  };

  const stats = calculateStats();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Health Vitals Trends (Last 30 Days)'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await PDFExportUtil.generatePDF('vitals-content', 'Health Vitals Report');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Activity className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Vitals</h1>
            <p className="text-gray-600">Track and monitor your health metrics</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Vitals</span>
          </button>
          {vitals.length > 0 && (
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </button>
          )}
        </div>
      </div>

      <div id="vitals-content" className="space-y-8">
        {vitals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No Vitals Recorded</h2>
            <p className="text-gray-500 mb-6">Start tracking your health by adding your first vital signs</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First Vitals</span>
            </button>
          </div>
        ) : (
          <>
            {/* Summary Statistics */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Average BP (7 days)</h3>
                  <p className="text-2xl font-bold text-red-600">{stats.avgBP.systolic}/{stats.avgBP.diastolic}</p>
                  <p className="text-sm text-gray-500">mmHg</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Heart Rate</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.avgHeartRate}</p>
                  <p className="text-sm text-gray-500">bpm</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">SpO2 Range (7 days)</h3>
                  <p className="text-2xl font-bold text-purple-600">{stats.minSpO2}-{stats.maxSpO2}%</p>
                  <p className="text-sm text-gray-500">Oxygen saturation</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Blood Sugar</h3>
                  <p className="text-2xl font-bold text-green-600">{stats.avgBloodSugar}</p>
                  <p className="text-sm text-gray-500">mg/dL</p>
                </div>
              </div>
            )}

            {/* Chart Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Trends Chart</h2>
                <div className="flex items-center space-x-4">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Metrics</option>
                    <option value="bloodPressure">Blood Pressure</option>
                    <option value="heartRate">Heart Rate</option>
                    <option value="bloodSugar">Blood Sugar</option>
                    <option value="oxygenSaturation">Oxygen Saturation</option>
                  </select>
                </div>
              </div>
              
              <div className="h-96">
                <Line data={getChartData()} options={chartOptions} />
              </div>
            </div>

            {/* Recent Vitals Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Measurements</h2>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Pressure</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heart Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SpO2</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Sugar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vitals.slice(0, 10).map((vital) => (
                      <tr key={vital.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(vital.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic} mmHg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vital.heartRate} bpm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vital.oxygenSaturation}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vital.bloodSugar} mg/dL
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vital.weight.toFixed(1)} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Vitals Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Vitals</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Systolic BP *
                  </label>
                  <input
                    type="number"
                    value={formData.bloodPressureSystolic}
                    onChange={(e) => setFormData(prev => ({ ...prev, bloodPressureSystolic: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="120"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diastolic BP *
                  </label>
                  <input
                    type="number"
                    value={formData.bloodPressureDiastolic}
                    onChange={(e) => setFormData(prev => ({ ...prev, bloodPressureDiastolic: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="80"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heart Rate (bpm) *
                </label>
                <input
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, heartRate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="72"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oxygen Saturation (%) *
                </label>
                <input
                  type="number"
                  value={formData.oxygenSaturation}
                  onChange={(e) => setFormData(prev => ({ ...prev, oxygenSaturation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="97"
                  min="70"
                  max="100"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Sugar (mg/dL) *
                </label>
                <input
                  type="number"
                  value={formData.bloodSugar}
                  onChange={(e) => setFormData(prev => ({ ...prev, bloodSugar: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="110"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (°F) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="98.6"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={user?.weight?.toString() || "70.0"}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Any additional notes about your health today..."
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthVitals;