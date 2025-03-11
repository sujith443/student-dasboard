import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link } from "react-router-dom";

const CustomSidebar = () => {
  return (
    <Sidebar>
        <h3 className="m-2 ms-3 mt-4">
            SVIT Dashboards
        </h3>
      <Menu>
        <MenuItem component={<Link to="/dashboard" />}> Dashboard </MenuItem>
        <MenuItem component={<Link to="/profile" />}> Profile </MenuItem>
        <MenuItem component={<Link to="/notifications" />}> Notifications </MenuItem>
        <MenuItem component={<Link to="/attendance" />}> Attendance </MenuItem>
        <MenuItem component={<Link to="/timetable" />}> Timetable </MenuItem>
        <MenuItem component={<Link to="/fees" />}> Fees </MenuItem>
        <MenuItem component={<Link to="/marks" />}> Marks </MenuItem>
      </Menu>
    </Sidebar>
  );
};

export default CustomSidebar;
