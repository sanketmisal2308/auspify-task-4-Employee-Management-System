"use strict";

// Employee Management System
// Auspify Technologies Internship - Task 4

const STORAGE_KEY = "auspify_employees_v1";

const DEPARTMENTS = [
  "IT",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations"
];

const STATUSES = ["Active", "On Leave", "Inactive"];

const $ = (id) => document.getElementById(id);

const elements = {
  totalEmployees: $("totalEmployees"),
  activeEmployees: $("activeEmployees"),
  totalDepartments: $("totalDepartments"),
  leaveEmployees: $("leaveEmployees"),

  employeeTableBody: $("employeeTableBody"),
  emptyState: $("emptyState"),
  tableCount: $("tableCount"),

  searchInput: $("searchInput"),
  departmentFilter: $("departmentFilter"),
  statusFilter: $("statusFilter"),
  departmentOverview: $("departmentOverview"),

  reportTotal: $("reportTotal"),
  reportActive: $("reportActive"),
  reportInactive: $("reportInactive"),

  addEmployeeBtn: $("addEmployeeBtn"),
  emptyAddBtn: $("emptyAddBtn"),
  exportBtn: $("exportBtn"),

  employeeModal: $("employeeModal"),
  modalTitle: $("modalTitle"),
  closeModalBtn: $("closeModalBtn"),
  cancelBtn: $("cancelBtn"),

  employeeForm: $("employeeForm"),
  saveEmployeeBtn: $("saveEmployeeBtn"),

  employeeName: $("employeeName"),
  employeeEmail: $("employeeEmail"),
  employeePhone: $("employeePhone"),
  employeeDepartment: $("employeeDepartment"),
  employeePosition: $("employeePosition"),
  employeeJoiningDate: $("employeeJoiningDate"),
  employeeStatus: $("employeeStatus"),

  toast: $("toast")
};

let employees = loadEmployees();
let editingEmployeeId = null;
let toastTimer = null;

// Load employee records from Local Storage.
function loadEmployees() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      return [];
    }

    const parsedData = JSON.parse(storedData);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData.filter(employee =>
      employee &&
      typeof employee.id === "string" &&
      typeof employee.name === "string" &&
      typeof employee.email === "string" &&
      typeof employee.department === "string" &&
      typeof employee.position === "string"
    );
  } catch (error) {
    console.error("Unable to load employee data:", error);
    return [];
  }
}

// Save employee records to Local Storage.
function saveEmployees() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(employees)
    );

    return true;
  } catch (error) {
    console.error("Unable to save employee data:", error);

    showToast(
      "Unable to save data. Check your browser storage.",
      true
    );

    return false;
  }
}

// Generate a unique employee ID.
function generateEmployeeId() {
  let id;

  do {
    id =
      "EMP-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random().toString(36).slice(2, 6).toUpperCase();
  } while (employees.some(employee => employee.id === id));

  return id;
}

// Prevent user-entered text from being interpreted as HTML.
function escapeHTML(value) {
  const characters = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  return String(value ?? "").replace(
    /[&<>"']/g,
    character => characters[character]
  );
}

// Get initials for the employee avatar.
function getInitials(name) {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join("");
}

// Format joining date.
function formatDate(dateString) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString + "T00:00:00");

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// Display success and error messages.
function showToast(message, isError = false) {
  elements.toast.textContent = message;

  elements.toast.classList.toggle("error", isError);
  elements.toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 3000);
}

// Open the Add/Edit Employee modal.
function openModal(employee = null) {
  elements.employeeForm.reset();

  editingEmployeeId = employee ? employee.id : null;

  elements.modalTitle.textContent = employee
    ? "Edit Employee"
    : "Add Employee";

  elements.saveEmployeeBtn.textContent = employee
    ? "Update Employee"
    : "Save Employee";

  elements.employeeJoiningDate.max =
    new Date().toISOString().slice(0, 10);

  if (employee) {
    elements.employeeName.value = employee.name;
    elements.employeeEmail.value = employee.email;
    elements.employeePhone.value = employee.phone || "";
    elements.employeeDepartment.value = employee.department;
    elements.employeePosition.value = employee.position;
    elements.employeeJoiningDate.value = employee.joiningDate;
    elements.employeeStatus.value = employee.status;
  } else {
    elements.employeeStatus.value = "Active";
  }

  elements.employeeModal.classList.add("show");
  document.body.style.overflow = "hidden";

  elements.employeeName.focus();
}

// Close the modal.
function closeModal() {
  elements.employeeModal.classList.remove("show");
  document.body.style.overflow = "";

  elements.employeeForm.reset();
  editingEmployeeId = null;
}

// Show validation errors.
function validationError(field, message) {
  showToast(message, true);
  field.focus();

  return false;
}

// Validate employee information.
function validateEmployee(employee) {
  if (!employee.name) {
    return validationError(
      elements.employeeName,
      "Please enter the employee name."
    );
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)
  ) {
    return validationError(
      elements.employeeEmail,
      "Please enter a valid email address."
    );
  }

  if (
    employee.phone &&
    !/^[0-9+\-()\s]{7,20}$/.test(employee.phone)
  ) {
    return validationError(
      elements.employeePhone,
      "Please enter a valid phone number."
    );
  }

  if (!DEPARTMENTS.includes(employee.department)) {
    return validationError(
      elements.employeeDepartment,
      "Please select a valid department."
    );
  }

  if (!employee.position) {
    return validationError(
      elements.employeePosition,
      "Please enter the employee position."
    );
  }

  if (!employee.joiningDate) {
    return validationError(
      elements.employeeJoiningDate,
      "Please select the joining date."
    );
  }

  const joiningDate = new Date(
    employee.joiningDate + "T00:00:00"
  );

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (
    Number.isNaN(joiningDate.getTime()) ||
    joiningDate > today
  ) {
    return validationError(
      elements.employeeJoiningDate,
      "Joining date cannot be in the future."
    );
  }

  if (!STATUSES.includes(employee.status)) {
    return validationError(
      elements.employeeStatus,
      "Please select a valid employment status."
    );
  }

  const duplicateEmail = employees.some(existingEmployee =>
    existingEmployee.email.toLowerCase() ===
      employee.email.toLowerCase() &&
    existingEmployee.id !== editingEmployeeId
  );

  if (duplicateEmail) {
    return validationError(
      elements.employeeEmail,
      "This email is already registered."
    );
  }

  return true;
}

// Add or update an employee.
function handleEmployeeSubmit(event) {
  event.preventDefault();

  const employeeData = {
    name: elements.employeeName.value.trim(),
    email: elements.employeeEmail.value.trim(),
    phone: elements.employeePhone.value.trim(),
    department: elements.employeeDepartment.value,
    position: elements.employeePosition.value.trim(),
    joiningDate: elements.employeeJoiningDate.value,
    status: elements.employeeStatus.value
  };

  if (!validateEmployee(employeeData)) {
    return;
  }

  const isEditing = editingEmployeeId !== null;

  const previousEmployees = employees.map(
    employee => ({ ...employee })
  );

  if (isEditing) {
    const index = employees.findIndex(
      employee => employee.id === editingEmployeeId
    );

    if (index === -1) {
      showToast("Employee record was not found.", true);
      closeModal();
      return;
    }

    employees[index] = {
      ...employees[index],
      ...employeeData
    };
  } else {
    employees.push({
      id: generateEmployeeId(),
      ...employeeData,
      createdAt: new Date().toISOString()
    });
  }

  if (!saveEmployees()) {
    employees = previousEmployees;
    return;
  }

  closeModal();
  renderApp();

  showToast(
    isEditing
      ? "Employee updated successfully."
      : "Employee added successfully."
  );
}

// Delete an employee.
function deleteEmployee(employeeId) {
  const employee = employees.find(
    item => item.id === employeeId
  );

  if (!employee) {
    showToast("Employee record was not found.", true);
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete ${employee.name}'s record?`
  );

  if (!confirmed) {
    return;
  }

  const previousEmployees = employees.map(
    item => ({ ...item })
  );

  employees = employees.filter(
    item => item.id !== employeeId
  );

  if (!saveEmployees()) {
    employees = previousEmployees;
    return;
  }

  renderApp();
  showToast("Employee deleted successfully.");
}

// Search and filter employees.
function getFilteredEmployees() {
  const searchTerm = elements.searchInput.value
    .trim()
    .toLowerCase();

  const department = elements.departmentFilter.value;
  const status = elements.statusFilter.value;

  return employees.filter(employee => {
    const searchableFields = [
      employee.id,
      employee.name,
      employee.email,
      employee.phone,
      employee.position,
      employee.department
    ];

    const matchesSearch = searchableFields.some(value =>
      String(value || "").toLowerCase().includes(searchTerm)
    );

    const matchesDepartment =
      !department || employee.department === department;

    const matchesStatus =
      !status || employee.status === status;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus
    );
  });
}

// Render employee table.
function renderEmployeeTable() {
  const filteredEmployees = getFilteredEmployees()
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  elements.employeeTableBody.innerHTML = "";

  elements.emptyState.style.display =
    filteredEmployees.length === 0 ? "block" : "none";

  elements.tableCount.textContent =
    `${filteredEmployees.length} employee` +
    `${filteredEmployees.length === 1 ? "" : "s"} shown`;

  if (filteredEmployees.length === 0) {
    return;
  }

  const rows = filteredEmployees.map(employee => {
    const statusClass = {
      "Active": "status-active",
      "On Leave": "status-on-leave",
      "Inactive": "status-inactive"
    }[employee.status] || "status-inactive";

    return `
      <tr>
        <td>
          <div class="employee-info">
            <div class="employee-avatar">
              ${escapeHTML(getInitials(employee.name))}
            </div>
            <div>
              <strong>${escapeHTML(employee.name)}</strong>
              <small>${escapeHTML(employee.id)}</small>
            </div>
          </div>
        </td>

        <td>${escapeHTML(employee.department)}</td>
        <td>${escapeHTML(employee.position)}</td>
        <td>${escapeHTML(formatDate(employee.joiningDate))}</td>

        <td>
          <span class="status-badge ${statusClass}">
            ${escapeHTML(employee.status)}
          </span>
        </td>

        <td>
          <div class="action-buttons">
            <button
              type="button"
              class="action-btn"
              data-action="edit"
              data-id="${escapeHTML(employee.id)}"
              aria-label="Edit ${escapeHTML(employee.name)}"
              title="Edit employee">✎</button>

            <button
              type="button"
              class="action-btn delete"
              data-action="delete"
              data-id="${escapeHTML(employee.id)}"
              aria-label="Delete ${escapeHTML(employee.name)}"
              title="Delete employee">⌫</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  elements.employeeTableBody.innerHTML = rows;
}

// Update dashboard statistics.
function renderStatistics() {
  const total = employees.length;

  const active = employees.filter(
    employee => employee.status === "Active"
  ).length;

  const onLeave = employees.filter(
    employee => employee.status === "On Leave"
  ).length;

  const inactive = employees.filter(
    employee => employee.status === "Inactive"
  ).length;

  const departmentCount = new Set(
    employees.map(employee => employee.department)
  ).size;

  elements.totalEmployees.textContent = total;
  elements.activeEmployees.textContent = active;
  elements.totalDepartments.textContent = departmentCount;
  elements.leaveEmployees.textContent = onLeave;

  elements.reportTotal.textContent = total;
  elements.reportActive.textContent = active;
  elements.reportInactive.textContent = inactive;
}

// Display department-wise employee counts.
function renderDepartments() {
  const icons = {
    IT: "⌘",
    HR: "♙",
    Finance: "₹",
    Marketing: "↗",
    Sales: "◈",
    Operations: "⚙"
  };

  const departmentCounts = DEPARTMENTS.map(department => ({
    department,
    count: employees.filter(
      employee => employee.department === department
    ).length
  })).filter(item => item.count > 0);

  if (departmentCounts.length === 0) {
    elements.departmentOverview.innerHTML = `
      <div class="empty-state" style="display:block;grid-column:1/-1">
        <div class="empty-icon">▤</div>
        <h3>No department data yet</h3>
        <p>Add an employee to see department statistics.</p>
      </div>
    `;

    return;
  }

  elements.departmentOverview.innerHTML =
    departmentCounts.map(item => `
      <article class="department-card">
        <div class="department-symbol">
          ${escapeHTML(icons[item.department] || "▤")}
        </div>
        <h3>${escapeHTML(item.department)}</h3>
        <p>
          ${item.count === 1
            ? "1 employee"
            : `${item.count} employees`}
        </p>
        <strong>${item.count}</strong>
      </article>
    `).join("");
}

// Show departments used by employees in the filter.
function renderDepartmentFilter() {
  const previousValue = elements.departmentFilter.value;

  const usedDepartments = DEPARTMENTS.filter(department =>
    employees.some(employee => employee.department === department)
  );

  elements.departmentFilter.innerHTML = `
    <option value="">All Departments</option>
    ${usedDepartments.map(department => `
      <option value="${escapeHTML(department)}">
        ${escapeHTML(department)}
      </option>
    `).join("")}
  `;

  elements.departmentFilter.value =
    usedDepartments.includes(previousValue) ? previousValue : "";
}

// Export records as CSV.
function exportToCSV() {
  if (employees.length === 0) {
    showToast("No employee records available to export.", true);
    return;
  }

  const headers = [
    "Employee ID",
    "Full Name",
    "Email",
    "Phone",
    "Department",
    "Position",
    "Joining Date",
    "Status"
  ];

  function csvCell(value) {
    let text = String(value ?? "");

    // Reduce spreadsheet formula injection risk.
    if (/^[\s]*[=+\-@\t\r]/.test(text)) {
      text = "'" + text;
    }

    return `"${text.replace(/"/g, '""')}"`;
  }

  const rows = employees.map(employee => [
    employee.id,
    employee.name,
    employee.email,
    employee.phone,
    employee.department,
    employee.position,
    employee.joiningDate,
    employee.status
  ]);

  const csvContent = [
    headers.map(csvCell).join(","),
    ...rows.map(row => row.map(csvCell).join(","))
  ].join("\r\n");

  const blob = new Blob(
    ["\uFEFF", csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "employee-report.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  showToast("Employee report exported successfully.");
}

// Refresh all dashboard sections.
function renderApp() {
  renderStatistics();
  renderDepartmentFilter();
  renderEmployeeTable();
  renderDepartments();
}

// Event listeners.
elements.addEmployeeBtn.addEventListener(
  "click",
  () => openModal()
);

elements.emptyAddBtn.addEventListener(
  "click",
  () => openModal()
);

elements.closeModalBtn.addEventListener(
  "click",
  closeModal
);

elements.cancelBtn.addEventListener(
  "click",
  closeModal
);

elements.employeeModal.addEventListener("click", event => {
  if (event.target === elements.employeeModal) {
    closeModal();
  }
});

document.addEventListener("keydown", event => {
  if (
    event.key === "Escape" &&
    elements.employeeModal.classList.contains("show")
  ) {
    closeModal();
  }
});

elements.employeeForm.addEventListener(
  "submit",
  handleEmployeeSubmit
);

elements.searchInput.addEventListener(
  "input",
  renderEmployeeTable
);

elements.departmentFilter.addEventListener(
  "change",
  renderEmployeeTable
);

elements.statusFilter.addEventListener(
  "change",
  renderEmployeeTable
);

// Handle Edit and Delete buttons.
elements.employeeTableBody.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const employeeId = button.dataset.id;
  const action = button.dataset.action;

  if (action === "edit") {
    const employee = employees.find(
      item => item.id === employeeId
    );

    if (employee) {
      openModal(employee);
    } else {
      showToast("Employee record was not found.", true);
    }
  }

  if (action === "delete") {
    deleteEmployee(employeeId);
  }
});

elements.exportBtn.addEventListener(
  "click",
  exportToCSV
);

// Display today's date.
$("todayLabel").textContent =
  new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

// Set the maximum allowed joining date.
elements.employeeJoiningDate.max =
  new Date().toISOString().slice(0, 10);

// Start the application.
renderApp();

console.log(
  "Employee Management System initialized successfully."
);