import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  User, 
  Bell, 
  Calendar, 
  Clock, 
  CreditCard, 
  BarChart 
} from "lucide-react";

const CustomSidebar = () => {
  return (
    <Sidebar className="h-screen shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-blue-600">SVIT Dashboards</h2>
      </div>
      
      <div className="p-2">
        <Menu
          menuItemStyles={{
            button: {
              padding: "10px 16px",
              borderRadius: "8px",
              marginBottom: "4px",
              color: "#555",
              fontWeight: "500",
              '&:hover': {
                backgroundColor: '#e6f7ff',
                color: '#1890ff'
              },
            },
          }}
        >
          <MenuItem 
            icon={<LayoutDashboard size={20} />} 
            component={<Link to="/dashboard" />}
          > 
            Dashboard 
          </MenuItem>
          
          <MenuItem 
            icon={<User size={20} />}
            component={<Link to="/profile" />}
          > 
            Profile 
          </MenuItem>
          
          <MenuItem 
            icon={<Bell size={20} />}
            component={<Link to="/notifications" />}
          > 
            Notifications 
          </MenuItem>
          
          <MenuItem 
            icon={<Calendar size={20} />}
            component={<Link to="/attendance" />}
          > 
            Attendance 
          </MenuItem>
          
          <MenuItem 
            icon={<Clock size={20} />}
            component={<Link to="/timetable" />}
          > 
            Timetable 
          </MenuItem>
          
          <MenuItem 
            icon={<CreditCard size={20} />}
            component={<Link to="/fees" />}
          > 
            Fees 
          </MenuItem>
          
          <MenuItem 
            icon={<BarChart size={20} />}
            component={<Link to="/marks" />}
          > 
            Marks 
          </MenuItem>
        </Menu>
      </div>
      
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            S
          </div>
          <div>
            <p className="text-sm font-medium">Student Portal</p>
            <p className="text-xs text-gray-500">Version 2.0</p>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default CustomSidebar;