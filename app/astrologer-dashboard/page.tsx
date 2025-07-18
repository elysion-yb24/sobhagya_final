"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Phone, 
  Video, 
  Star, 
  Clock, 
  DollarSign,
  Calendar,
  Bell,
  Settings,
  LogOut,
  BarChart3,
  Users,
  TrendingUp,
  Award,
  Eye,
  MessageCircle,
  Zap,
  Activity,
  CheckCircle,
  AlertCircle,
  Target,
  Sparkles,
  Crown,
  Globe,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import CallingApiNotifications from '../components/astrologer/CallingApiNotifications';
import { getAuthToken, getUserDetails, clearAuthData } from '../utils/auth-utils';

interface DashboardStats {
  totalCalls: number;
  totalEarnings: number;
  averageRating: number;
  onlineHours: number;
  todaysCalls: number;
  weeklyGrowth: number;
  clientSatisfaction: number;
  responseTime: number;
}

interface RecentActivity {
  id: string;
  type: 'call' | 'rating' | 'earning';
  description: string;
  time: string;
  amount?: number;
  rating?: number;
}

export default function AstrologerDashboard() {
  const router = useRouter();
  const [astrologerDetails, setAstrologerDetails] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCalls: 0,
    totalEarnings: 0,
    averageRating: 0,
    onlineHours: 0,
    todaysCalls: 0,
    weeklyGrowth: 0,
    clientSatisfaction: 0,
    responseTime: 0
  });
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initializeDashboard = async () => {
      try {
        const token = getAuthToken();
        const userDetails = getUserDetails();

        if (!token || !userDetails) {
          router.push('/login');
          return;
        }

        setAstrologerDetails(userDetails);

        // Enhanced mock data
        setStats({
          totalCalls: 156,
          totalEarnings: 23400,
          averageRating: 4.8,
          onlineHours: 142,
          todaysCalls: 8,
          weeklyGrowth: 12.5,
          clientSatisfaction: 96,
          responseTime: 2.3
        });

        // Mock recent activity
        setRecentActivity([
          { id: '1', type: 'call', description: 'Completed consultation with Priya', time: '2 min ago' },
          { id: '2', type: 'rating', description: 'Received 5-star rating', time: '15 min ago', rating: 5 },
          { id: '3', type: 'earning', description: 'Payment received', time: '1 hour ago', amount: 250 },
          { id: '4', type: 'call', description: 'Consultation with Rahul', time: '2 hours ago' },
        ]);

      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  const handleLogout = () => {
    clearAuthData();
    router.push('/login');
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const handleCallAccepted = (call: any) => {
    console.log('Call accepted:', call);
  };

  const handleCallRejected = (call: any) => {
    console.log('Call rejected:', call);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!astrologerDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access your dashboard.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Calls",
      value: stats.totalCalls,
      icon: Phone,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Total Earnings",
      value: `₹${stats.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      textColor: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "Average Rating",
      value: stats.averageRating,
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
      change: "+0.2",
      changeType: "positive"
    },
    {
      title: "Online Hours",
      value: stats.onlineHours,
      icon: Clock,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+5%",
      changeType: "positive"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Enhanced Header */}
      <motion.header 
        className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
              <h1 className="text-xl font-bold text-gray-900">
                Astrologer Dashboard
              </h1>
              <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
              </motion.div>
            </div>

            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>

              <motion.button
                onClick={toggleOnlineStatus}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  isOnline 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-md' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </motion.button>

              <motion.button 
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Settings className="w-5 h-5" />
              </motion.button>

              <motion.button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Welcome Section */}
            <motion.div 
              className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold">
                    Welcome, {astrologerDetails.name || 'Astrologer'}
                  </h2>
                    <p className="text-white/80 text-lg">
                    Ready to help seekers find their path
                  </p>
                </div>
              </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.todaysCalls}</div>
                    <div className="text-white/80 text-sm">Today's Calls</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.weeklyGrowth}%</div>
                    <div className="text-white/80 text-sm">Weekly Growth</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.clientSatisfaction}%</div>
                    <div className="text-white/80 text-sm">Satisfaction</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.responseTime}m</div>
                    <div className="text-white/80 text-sm">Avg Response</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          stat.changeType === 'positive' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                  </div>
                </div>
              </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <motion.div 
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Recent Activity
                </h3>
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'call' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'rating' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {activity.type === 'call' ? <Phone className="w-5 h-5" /> :
                       activity.type === 'rating' ? <Star className="w-5 h-5" /> :
                       <DollarSign className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                    {activity.amount && (
                      <span className="text-sm font-semibold text-green-600">
                        +₹{activity.amount}
                      </span>
                    )}
                    {activity.rating && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: activity.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Online Status Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <h3 className="font-semibold text-gray-900">
                  {isOnline ? 'You are Online' : 'You are Offline'}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {isOnline 
                  ? 'You are available for consultations' 
                  : 'Toggle online to start receiving calls'
                }
              </p>
              <motion.button
                onClick={toggleOnlineStatus}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                  isOnline 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </motion.button>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {[
                  { icon: BarChart3, label: "View Analytics", color: "text-blue-500" },
                  { icon: Users, label: "Manage Profile", color: "text-green-500" },
                  { icon: Calendar, label: "Set Availability", color: "text-purple-500" },
                  { icon: DollarSign, label: "Update Rates", color: "text-orange-500" }
                ].map((action, index) => (
                  <motion.button 
                    key={action.label}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-xl transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  >
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                    <span className="text-gray-700 font-medium">{action.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div 
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Performance
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Client Satisfaction</span>
                    <span className="font-semibold">{stats.clientSatisfaction}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${stats.clientSatisfaction}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-semibold">{stats.responseTime}m</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Weekly Growth</span>
                    <span className="font-semibold">+{stats.weeklyGrowth}%</span>
                </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: '70%' }}
                    ></div>
                </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Call Notifications */}
      <CallingApiNotifications
        onCallAccepted={handleCallAccepted}
        onCallRejected={handleCallRejected}
      />
    </div>
  );
} 