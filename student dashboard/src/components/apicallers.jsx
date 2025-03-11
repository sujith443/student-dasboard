import axios from "axios";

const BASE_URL = "http://localhost:5000"; // Update with your backend URL

// ✅ API Service Functions
const apiService = {
  // 📌 Login API
  login: async (hallTicketNumber, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, { hallTicketNumber, password });      
      return response.data;
    } catch (error) {
      console.error("Login Error:", error);
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

  // 📌 Fetch Notifications
  getNotifications: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/notifications`);
      console.log("the notification data",response.data);
      
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  // 📌 Fetch Attendance
  getAttendance: async (hallTicketNumber) => {
    try {
      const response = await axios.get(`${BASE_URL}/attendance/${hallTicketNumber}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }
  },

  // 📌 Fetch Marks
  getMarks: async (hallTicketNumber) => {
    try {
      const response = await axios.get(`${BASE_URL}/marks/${hallTicketNumber}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching marks:", error);
      throw error;
    }
  },

  // 📌 Fetch Fees
  getFees: async (hallTicketNumber) => {
    try {
      const response = await axios.get(`${BASE_URL}/fees/${hallTicketNumber}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching fees:", error);
      throw error;
    }
  },

  // 📌 Fetch Timetable (Same for Everyone)
  getTimetable: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/timetable`);
      return response.data;
    } catch (error) {
      console.error("Error fetching timetable:", error);
      throw error;
    }
  },

  // 📌 Update Password
  updatePassword: async (hallTicketNumber, email, oldPassword, newPassword) => {
    try {
      const response = await axios.put(`${BASE_URL}/update-password`, {
        hallTicketNumber,
        email,
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  },

  // 📌 Forgot Password
  forgotPassword: async (hallTicketNumber, email, newPassword) => {
    try {
      const response = await axios.post(`${BASE_URL}/forgot-password`, {
        hallTicketNumber,
        email,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  },
};

export default apiService;
