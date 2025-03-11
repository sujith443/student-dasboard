import axios from "axios";

const BASE_URL = "http://localhost:5000"; // Update with your backend URL

// ✅ API Service Functions
const apiService = {
  // 📌 Login API
  login: async (username, password, role) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, { username, password, role });
      return response.data;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  },

  // 📌 Parent Login API
  parentLogin: async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/login/parent`, { email, password });
      return response.data;
    } catch (error) {
      console.error("Parent Login Error:", error);
      throw error;
    }
  },

  // 📌 Register API
  register: async (userData) => {
    try {
      const response = await axios.post(`${BASE_URL}/register`, userData);
      return response.data;
    } catch (error) {
      console.error("Registration Error:", error);
      throw error;
    }
  },

  // 📌 Register Parent API
  registerParent: async (parentData) => {
    try {
      const response = await axios.post(`${BASE_URL}/register/parent`, parentData);
      return response.data;
    } catch (error) {
      console.error("Parent Registration Error:", error);
      throw error;
    }
  },

  // 📌 Fetch Notifications
  getNotifications: async (category, target) => {
    try {
      const response = await axios.get(`${BASE_URL}/notifications`, {
        params: { category, target }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  // 📌 Fetch Attendance
  getAttendance: async (studentId, month) => {
    try {
      const response = await axios.get(`${BASE_URL}/attendance/${studentId}`, {
        params: { month }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }
  },

  // 📌 Fetch Marks
  getMarks: async (studentId, subject, examType, semester) => {
    try {
      const response = await axios.get(`${BASE_URL}/marks/${studentId}`, {
        params: { subject, examType, semester }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching marks:", error);
      throw error;
    }
  },

  // 📌 Fetch Fees
  getFees: async (studentId, feeType, paid) => {
    try {
      const response = await axios.get(`${BASE_URL}/fees/${studentId}`, {
        params: { feeType, paid }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching fees:", error);
      throw error;
    }
  },

  // 📌 Pay Fee
  payFee: async (feeId, transactionId) => {
    try {
      const response = await axios.post(`${BASE_URL}/pay-fee/${feeId}`, { transactionId });
      return response.data;
    } catch (error) {
      console.error("Error paying fee:", error);
      throw error;
    }
  },

  // 📌 Fetch Timetable
  getTimetable: async (branch, day, semester) => {
    try {
      const response = await axios.get(`${BASE_URL}/timetable`, {
        params: { branch, day, semester }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching timetable:", error);
      throw error;
    }
  },

  // 📌 Update Password
  updatePassword: async (identifier, oldPassword, newPassword, role) => {
    try {
      const response = await axios.put(`${BASE_URL}/update-password`, {
        identifier, oldPassword, newPassword, role
      });
      return response.data;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  },

  // 📌 Forgot Password
  forgotPassword: async (identifier, newPassword, role) => {
    try {
      const response = await axios.post(`${BASE_URL}/forgot-password`, {
        identifier, newPassword, role
      });
      return response.data;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  },

  // 📌 Get Parent Dashboard Data
  getParentDashboard: async (studentId) => {
    try {
      const response = await axios.get(`${BASE_URL}/parent-dashboard/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching parent dashboard:", error);
      throw error;
    }
  },

  // 📌 Get Parent Notifications
  getParentNotifications: async (parentId, isRead) => {
    try {
      const response = await axios.get(`${BASE_URL}/parent-notifications/${parentId}`, {
        params: { isRead }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching parent notifications:", error);
      throw error;
    }
  },

  // 📌 Mark Parent Notification as Read
  markNotificationRead: async (notificationId) => {
    try {
      const response = await axios.put(`${BASE_URL}/parent-notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // 📌 Get Student Performance
  getStudentPerformance: async (studentId) => {
    try {
      const response = await axios.get(`${BASE_URL}/student-performance/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching student performance:", error);
      throw error;
    }
  },

  // 📌 Get Parent Messages
  getParentMessages: async (parentId) => {
    try {
      const response = await axios.get(`${BASE_URL}/parent-messages/${parentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching parent messages:", error);
      throw error;
    }
  },

  // 📌 Send Parent Message
  sendParentMessage: async (parentId, teacherId, message) => {
    try {
      const response = await axios.post(`${BASE_URL}/parent-messages`, {
        parentId, teacherId, message
      });
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
};

export default apiService;