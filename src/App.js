import React, { useState, useEffect } from "react";
import "./App.css";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FilterListIcon from "@mui/icons-material/FilterList";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

const API_ENDPOINT =
  "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json";

function App() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filterOption, setFilterOption] = useState(""); // Track selected filter option
  const itemsPerPage = 10;

  useEffect(() => {
    fetch(API_ENDPOINT)
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
        setFilteredUsers(data);
      });
  }, []);

  const handleFilter = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    filterAndSortData(searchTerm, sortBy);
    setCurrentPage(1);
  };

  const handleSort = (value) => {
    setSortBy(value);
    filterAndSortData("", value);
  };

  const filterAndSortData = (search, sort) => {
    let filtered = users;
    if (search) {
      filtered = users.filter((user) => {
        for (const key in user) {
          if (user[key].toString().toLowerCase().includes(search)) {
            return true;
          }
        }
        return false;
      });
    }

    if (sort) {
      filtered.sort((a, b) => {
        if (sort === "admin") {
          return a.role.localeCompare(b.role);
        } else if (sort === "members") {
          return b.role.localeCompare(a.role);
        }
        return 0;
      });
    }

    setFilteredUsers(filtered);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSelectRow = (id) => {
    const index = selectedRows.indexOf(id);
    if (index === -1) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const handleSelectAllRows = () => {
    if (selectedRows.length < itemsPerPage) {
      const allIds = filteredUsers
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((user) => user.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleDeleteSelected = () => {
    const updatedUsers = users.filter(
      (user) => !selectedRows.includes(user.id)
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    setSelectedRows([]);
  };

  const handleEditUser = (user) => {
    setEditUser(user);
  };

  const handleUpdateUser = (updatedUser) => {
    const updatedUsers = users.map((user) =>
      user.id === updatedUser.id ? updatedUser : user
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    setEditUser(null);
  };

  const handleFilterOptionClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterOptionClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterOptionSelect = (option) => {
    setFilterOption(option);
    filterAndSortData("", option);
    setFilterAnchorEl(null);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const pageButtons = [];

    for (let i = 1; i <= totalPages; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={i === currentPage ? "active" : ""}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        {currentPage > 1 && (
          <IconButton onClick={() => handlePageChange(currentPage - 1)}>
            <NavigateBeforeIcon />
          </IconButton>
        )}
        {pageButtons}
        {currentPage < totalPages && (
          <IconButton onClick={() => handlePageChange(currentPage + 1)}>
            <NavigateNextIcon />
          </IconButton>
        )}
      </div>
    );
  };

  const renderFilterPopover = (
    <Popover
      open={Boolean(filterAnchorEl)}
      anchorEl={filterAnchorEl}
      onClose={handleFilterOptionClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center"
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center"
      }}
    >
      <List>
        <ListItem button onClick={() => handleFilterOptionSelect("admin")}>
          <ListItemText primary="Admin" />
        </ListItem>
        <ListItem button onClick={() => handleFilterOptionSelect("members")}>
          <ListItemText primary="Members" />
        </ListItem>
      </List>
    </Popover>
  );

  const renderEditForm = () => {
    if (editUser) {
      return (
        <div>
          <h3>Edit User</h3>
          <form onSubmit={() => handleUpdateUser(editUser)}>
            <input
              type="text"
              value={editUser.name}
              onChange={(e) =>
                setEditUser({ ...editUser, name: e.target.value })
              }
            />
            <input
              type="email"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
            />
            <input
              type="text"
              value={editUser.role}
              onChange={(e) =>
                setEditUser({ ...editUser, role: e.target.value })
              }
            />
            <button type="submit">Save</button>
          </form>
        </div>
      );
    }
    return null;
  };

  const renderTable = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    return (
      <div className="grid-container">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedRows.length === itemsPerPage}
                  onChange={handleSelectAllRows}
                />
              </th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr
                key={user.id}
                className={selectedRows.includes(user.id) ? "selected" : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(user.id)}
                    onChange={() => handleSelectRow(user.id)}
                  />
                </td>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <IconButton
                    color="error"
                    onClick={() => handleEditUser(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteSelected(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="filter-bar">
        <input type="text" placeholder="Search..." onChange={handleFilter} />
        <IconButton color="error" onClick={handleFilterOptionClick}>
          <FilterListIcon />
        </IconButton>
        {filterOption && <ArrowDropDownIcon />}
        {renderFilterPopover}
      </div>
      {renderEditForm()}
      {renderTable()}
      {renderPagination()}
    </div>
  );
}

export default App;
