/* =====================================================
   SVN ELECTRICAL WORKS
   EMPLOYEE MANAGEMENT SYSTEM
===================================================== */


/* =====================================================
   DATA
===================================================== */

let employees =
    JSON.parse(localStorage.getItem("employees")) || [];

let attendance =
    JSON.parse(localStorage.getItem("attendance")) || {};

let leaves =
    JSON.parse(localStorage.getItem("leaves")) || [];

let salaries =
    JSON.parse(localStorage.getItem("salaries")) || [];


/* =====================================================
   SHOW SECTION
===================================================== */

function showSection(sectionName) {

    document
        .querySelectorAll(".section")
        .forEach(function(section) {
            section.classList.add("hidden");
        });

    const section =
        document.getElementById(sectionName);

    if (section) {
        section.classList.remove("hidden");
    }

    const titles = {
        dashboard: "Dashboard",
        employees: "Employees",
        attendance: "Attendance",
        leave: "Leave Management",
        salary: "Salary Management",
        reports: "Reports"
    };

    const pageTitle =
        document.getElementById("pageTitle");

    if (pageTitle) {
        pageTitle.textContent =
            titles[sectionName] || "Dashboard";
    }


    if (sectionName === "attendance") {
        displayAttendance();
    }

    if (sectionName === "leave") {
        displayLeaves();
    }

    if (sectionName === "salary") {
        displaySalaries();
    }

    if (sectionName === "reports") {
        updateReportSummary();
    }

    if (sectionName === "dashboard") {
        updateDashboard();
    }
}


/* =====================================================
   EMPLOYEE FORM
===================================================== */

function openEmployeeForm() {

    document
        .getElementById("employeeForm")
        .classList.remove("hidden");
}


function closeEmployeeForm() {

    document
        .getElementById("employeeForm")
        .classList.add("hidden");

    document
        .getElementById("addEmployeeForm")
        .reset();
}


/* =====================================================
   SAVE EMPLOYEE
===================================================== */

document
    .getElementById("addEmployeeForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const employeeId =
            document
                .getElementById("employeeId")
                .value.trim();

        const existingEmployee =
            employees.find(function(employee) {
                return employee.id === employeeId;
            });

        if (existingEmployee) {
            alert("Employee ID already exists!");
            return;
        }

        const employee = {

            id: employeeId,

            name:
                document
                    .getElementById("employeeName")
                    .value.trim(),

            email:
                document
                    .getElementById("employeeEmail")
                    .value.trim(),

            phone:
                document
                    .getElementById("employeePhone")
                    .value.trim(),

            department:
                document
                    .getElementById("employeeDepartment")
                    .value,

            designation:
                document
                    .getElementById("employeeDesignation")
                    .value.trim(),

            joiningDate:
                document
                    .getElementById("joiningDate")
                    .value,

            salary:
                Number(
                    document
                        .getElementById("employeeSalary")
                        .value
                )
        };

        employees.push(employee);

        localStorage.setItem(
            "employees",
            JSON.stringify(employees)
        );

        displayEmployees();

        closeEmployeeForm();

        alert("Employee added successfully!");
    });


/* =====================================================
   DISPLAY EMPLOYEES
===================================================== */

function displayEmployees() {

    const tableBody =
        document.getElementById(
            "employeeTableBody"
        );

    if (!tableBody) return;

    tableBody.innerHTML = "";

    employees.forEach(
        function(employee, index) {

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>${employee.id}</td>

                <td>${employee.name}</td>

                <td>${employee.department}</td>

                <td>${employee.designation}</td>

                <td>${employee.phone}</td>

                <td>
                    ₹${Number(employee.salary)
                        .toLocaleString("en-IN")}
                </td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="deleteEmployee(${index})"
                    >
                        Delete
                    </button>

                </td>
            `;

            tableBody.appendChild(row);
        }
    );

    const totalEmployees =
        document.getElementById(
            "totalEmployees"
        );

    if (totalEmployees) {
        totalEmployees.textContent =
            employees.length;
    }

    updateDashboard();
}


/* =====================================================
   DELETE EMPLOYEE
===================================================== */

function deleteEmployee(index) {

    if (
        !confirm(
            "Are you sure you want to delete this employee?"
        )
    ) {
        return;
    }

    const employeeId =
        employees[index].id;

    employees.splice(index, 1);

    localStorage.setItem(
        "employees",
        JSON.stringify(employees)
    );


    /* Remove attendance */

    Object.keys(attendance).forEach(
        function(date) {

            if (attendance[date]) {
                delete attendance[date][employeeId];
            }

        }
    );

    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );


    /* Remove salary */

    salaries =
        salaries.filter(
            function(salary) {
                return salary.employeeId !== employeeId;
            }
        );

    localStorage.setItem(
        "salaries",
        JSON.stringify(salaries)
    );


    /* Remove leaves */

    leaves =
        leaves.filter(
            function(leave) {
                return leave.employeeId !== employeeId;
            }
        );

    localStorage.setItem(
        "leaves",
        JSON.stringify(leaves)
    );


    displayEmployees();
    displayAttendance();
    displayLeaves();
    displaySalaries();
}


/* =====================================================
   ATTENDANCE
===================================================== */

function displayAttendance() {

    const tableBody =
        document.getElementById(
            "attendanceTableBody"
        );

    if (!tableBody) return;

    tableBody.innerHTML = "";

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    const attendanceDate =
        document.getElementById(
            "attendanceDate"
        );

    if (attendanceDate) {
        attendanceDate.textContent =
            "Date: " + today;
    }


    employees.forEach(
        function(employee) {

            const status =
                attendance[today]?.[employee.id]
                || "Not Marked";

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>${employee.id}</td>

                <td>${employee.name}</td>

                <td>${employee.department}</td>

                <td>

                    <button
                        class="attendance-btn present"
                        onclick="markAttendance('${employee.id}', 'Present')"
                    >
                        Present
                    </button>

                    <button
                        class="attendance-btn absent"
                        onclick="markAttendance('${employee.id}', 'Absent')"
                    >
                        Absent
                    </button>

                    <button
                        class="attendance-btn late"
                        onclick="markAttendance('${employee.id}', 'Late')"
                    >
                        Late
                    </button>

                    <span class="status">
                        ${status}
                    </span>

                </td>
            `;

            tableBody.appendChild(row);
        }
    );

    updateAttendanceCount();
}


/* =====================================================
   MARK ATTENDANCE
===================================================== */

function markAttendance(employeeId, status) {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    if (!attendance[today]) {
        attendance[today] = {};
    }

    attendance[today][employeeId] =
        status;

    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );

    displayAttendance();

    updateDashboard();
}


/* =====================================================
   ATTENDANCE COUNT
===================================================== */

function updateAttendanceCount() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    const todayAttendance =
        attendance[today] || {};

    let present = 0;
    let absent = 0;
    let late = 0;

    Object.values(todayAttendance)
        .forEach(function(status) {

            if (status === "Present") {
                present++;
            }

            if (status === "Absent") {
                absent++;
            }

            if (status === "Late") {
                late++;
            }
        });


    const presentElement =
        document.getElementById(
            "presentCount"
        );

    const absentElement =
        document.getElementById(
            "absentCount"
        );

    const lateElement =
        document.getElementById(
            "lateCount"
        );


    if (presentElement) {
        presentElement.textContent =
            present;
    }

    if (absentElement) {
        absentElement.textContent =
            absent;
    }

    if (lateElement) {
        lateElement.textContent =
            late;
    }
}


/* =====================================================
   LEAVE MANAGEMENT
===================================================== */

function openLeaveForm() {

    document
        .getElementById("leaveForm")
        .classList.remove("hidden");

    loadLeaveEmployees();
}


function closeLeaveForm() {

    document
        .getElementById("leaveForm")
        .classList.add("hidden");

    document
        .getElementById("addLeaveForm")
        .reset();
}


/* =====================================================
   LOAD LEAVE EMPLOYEES
===================================================== */

function loadLeaveEmployees() {

    const select =
        document.getElementById(
            "leaveEmployee"
        );

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Select Employee
        </option>
    `;

    employees.forEach(
        function(employee) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                employee.id;

            option.textContent =
                employee.id +
                " - " +
                employee.name;

            select.appendChild(option);
        }
    );
}


/* =====================================================
   SAVE LEAVE
===================================================== */

document
    .getElementById("addLeaveForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const employeeId =
                document
                    .getElementById(
                        "leaveEmployee"
                    )
                    .value;

            const employee =
                employees.find(
                    function(emp) {
                        return emp.id === employeeId;
                    }
                );

            if (!employee) {
                alert(
                    "Please select an employee."
                );
                return;
            }

            const from =
                document
                    .getElementById(
                        "leaveFrom"
                    )
                    .value;

            const to =
                document
                    .getElementById(
                        "leaveTo"
                    )
                    .value;

            if (to < from) {
                alert(
                    "To Date cannot be before From Date."
                );
                return;
            }

            const leave = {

                id: Date.now(),

                employeeId:
                    employee.id,

                employeeName:
                    employee.name,

                leaveType:
                    document
                        .getElementById(
                            "leaveType"
                        )
                        .value,

                from: from,

                to: to,

                reason:
                    document
                        .getElementById(
                            "leaveReason"
                        )
                        .value,

                status:
                    "Pending"
            };

            leaves.push(leave);

            localStorage.setItem(
                "leaves",
                JSON.stringify(leaves)
            );

            displayLeaves();

            closeLeaveForm();

            alert(
                "Leave request submitted successfully!"
            );
        }
    );


/* =====================================================
   DISPLAY LEAVES
===================================================== */

function displayLeaves() {

    const tableBody =
        document.getElementById(
            "leaveTableBody"
        );

    if (!tableBody) return;

    tableBody.innerHTML = "";

    leaves.forEach(
        function(leave) {

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>${leave.employeeName}</td>

                <td>${leave.leaveType}</td>

                <td>${leave.from}</td>

                <td>${leave.to}</td>

                <td>${leave.reason}</td>

                <td>
                    <strong>
                        ${leave.status}
                    </strong>
                </td>

                <td>

                    ${
                        leave.status === "Pending"

                        ?

                        `
                        <button
                            class="save-btn"
                            onclick="approveLeave(${leave.id})"
                        >
                            Approve
                        </button>

                        <button
                            class="delete-btn"
                            onclick="rejectLeave(${leave.id})"
                        >
                            Reject
                        </button>
                        `

                        :

                        `
                        <button
                            class="delete-btn"
                            onclick="deleteLeave(${leave.id})"
                        >
                            Delete
                        </button>
                        `
                    }

                </td>
            `;

            tableBody.appendChild(row);
        }
    );

    updateLeaveCounts();
}


/* =====================================================
   APPROVE LEAVE
===================================================== */

function approveLeave(id) {

    const leave =
        leaves.find(
            function(item) {
                return item.id === id;
            }
        );

    if (leave) {

        leave.status =
            "Approved";

        localStorage.setItem(
            "leaves",
            JSON.stringify(leaves)
        );

        displayLeaves();
        updateDashboard();
    }
}


/* =====================================================
   REJECT LEAVE
===================================================== */

function rejectLeave(id) {

    const leave =
        leaves.find(
            function(item) {
                return item.id === id;
            }
        );

    if (leave) {

        leave.status =
            "Rejected";

        localStorage.setItem(
            "leaves",
            JSON.stringify(leaves)
        );

        displayLeaves();
        updateDashboard();
    }
}


/* =====================================================
   DELETE LEAVE
===================================================== */

function deleteLeave(id) {

    if (
        !confirm(
            "Delete this leave request?"
        )
    ) {
        return;
    }

    leaves =
        leaves.filter(
            function(item) {
                return item.id !== id;
            }
        );

    localStorage.setItem(
        "leaves",
        JSON.stringify(leaves)
    );

    displayLeaves();
    updateDashboard();
}


/* =====================================================
   LEAVE COUNTS
===================================================== */

function updateLeaveCounts() {

    let pending = 0;
    let approved = 0;
    let rejected = 0;

    leaves.forEach(
        function(leave) {

            if (leave.status === "Pending") {
                pending++;
            }

            if (leave.status === "Approved") {
                approved++;
            }

            if (leave.status === "Rejected") {
                rejected++;
            }
        }
    );


    const pendingElement =
        document.getElementById(
            "pendingLeave"
        );

    const approvedElement =
        document.getElementById(
            "approvedLeave"
        );

    const rejectedElement =
        document.getElementById(
            "rejectedLeave"
        );


    if (pendingElement) {
        pendingElement.textContent =
            pending;
    }

    if (approvedElement) {
        approvedElement.textContent =
            approved;
    }

    if (rejectedElement) {
        rejectedElement.textContent =
            rejected;
    }
}


/* =====================================================
   SALARY MANAGEMENT
===================================================== */

function openSalaryForm() {

    document
        .getElementById("salaryForm")
        .classList.remove("hidden");

    loadSalaryEmployees();
}


function closeSalaryForm() {

    document
        .getElementById("salaryForm")
        .classList.add("hidden");

    document
        .getElementById("addSalaryForm")
        .reset();
}


/* =====================================================
   LOAD SALARY EMPLOYEES
===================================================== */

function loadSalaryEmployees() {

    const select =
        document.getElementById(
            "salaryEmployee"
        );

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Select Employee
        </option>
    `;

    employees.forEach(
        function(employee) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                employee.id;

            option.textContent =
                employee.id +
                " - " +
                employee.name;

            select.appendChild(option);
        }
    );
}


/* =====================================================
   SAVE SALARY
===================================================== */

document
    .getElementById("addSalaryForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const employeeId =
                document
                    .getElementById(
                        "salaryEmployee"
                    )
                    .value;

            const employee =
                employees.find(
                    function(emp) {
                        return emp.id === employeeId;
                    }
                );

            if (!employee) {
                alert(
                    "Please select an employee."
                );
                return;
            }

            const month =
                document
                    .getElementById(
                        "salaryMonth"
                    )
                    .value;

            const basic =
                Number(
                    document
                        .getElementById(
                            "basicSalary"
                        )
                        .value
                );

            const allowances =
                Number(
                    document
                        .getElementById(
                            "allowances"
                        )
                        .value
                );

            const deductions =
                Number(
                    document
                        .getElementById(
                            "deductions"
                        )
                        .value
                );


            if (basic < 0 ||
                allowances < 0 ||
                deductions < 0) {

                alert(
                    "Salary values cannot be negative."
                );

                return;
            }


            const duplicate =
                salaries.find(
                    function(salary) {

                        return (
                            salary.employeeId === employeeId &&
                            salary.month === month
                        );
                    }
                );

            if (duplicate) {

                alert(
                    "Salary for this employee and month already exists!"
                );

                return;
            }


            const netSalary =
                basic +
                allowances -
                deductions;


            if (netSalary < 0) {

                alert(
                    "Net salary cannot be negative."
                );

                return;
            }


            const salary = {

                id: Date.now(),

                employeeId:
                    employee.id,

                employeeName:
                    employee.name,

                month:
                    month,

                basicSalary:
                    basic,

                allowances:
                    allowances,

                deductions:
                    deductions,

                netSalary:
                    netSalary
            };


            salaries.push(salary);

            localStorage.setItem(
                "salaries",
                JSON.stringify(salaries)
            );

            displaySalaries();

            closeSalaryForm();

            alert(
                "Salary added successfully!"
            );
        }
    );


/* =====================================================
   DISPLAY SALARIES
===================================================== */

function displaySalaries() {

    const tableBody =
        document.getElementById(
            "salaryTableBody"
        );

    if (!tableBody) return;

    tableBody.innerHTML = "";

    salaries.forEach(
        function(salary) {

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>${salary.employeeId}</td>

                <td>${salary.employeeName}</td>

                <td>${salary.month}</td>

                <td>
                    ₹${Number(
                        salary.basicSalary
                    ).toLocaleString("en-IN")}
                </td>

                <td>
                    ₹${Number(
                        salary.allowances
                    ).toLocaleString("en-IN")}
                </td>

                <td>
                    ₹${Number(
                        salary.deductions
                    ).toLocaleString("en-IN")}
                </td>

                <td>
                    <strong>
                        ₹${Number(
                            salary.netSalary
                        ).toLocaleString("en-IN")}
                    </strong>
                </td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="deleteSalary(${salary.id})"
                    >
                        Delete
                    </button>

                </td>
            `;

            tableBody.appendChild(row);
        }
    );

    updateSalarySummary();
}


/* =====================================================
   SALARY SUMMARY
===================================================== */

function updateSalarySummary() {

    let totalSalary = 0;
    let totalAllowances = 0;
    let totalDeductions = 0;

    salaries.forEach(
        function(salary) {

            totalSalary +=
                Number(salary.netSalary) || 0;

            totalAllowances +=
                Number(salary.allowances) || 0;

            totalDeductions +=
                Number(salary.deductions) || 0;
        }
    );


    const employeesPaid =
        document.getElementById(
            "employeesPaid"
        );

    const totalSalaryElement =
        document.getElementById(
            "totalSalary"
        );

    const totalAllowancesElement =
        document.getElementById(
            "totalAllowances"
        );

    const totalDeductionsElement =
        document.getElementById(
            "totalDeductions"
        );


    if (employeesPaid) {
        employeesPaid.textContent =
            salaries.length;
    }

    if (totalSalaryElement) {
        totalSalaryElement.textContent =
            "₹" +
            totalSalary.toLocaleString("en-IN");
    }

    if (totalAllowancesElement) {
        totalAllowancesElement.textContent =
            "₹" +
            totalAllowances.toLocaleString("en-IN");
    }

    if (totalDeductionsElement) {
        totalDeductionsElement.textContent =
            "₹" +
            totalDeductions.toLocaleString("en-IN");
    }
}


/* =====================================================
   DELETE SALARY
===================================================== */

function deleteSalary(id) {

    if (
        !confirm(
            "Are you sure you want to delete this salary?"
        )
    ) {
        return;
    }

    salaries =
        salaries.filter(
            function(salary) {
                return salary.id !== id;
            }
        );

    localStorage.setItem(
        "salaries",
        JSON.stringify(salaries)
    );

    displaySalaries();
}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    const todayAttendance =
        attendance[today] || {};

    let present = 0;

    Object.values(todayAttendance)
        .forEach(function(status) {

            if (status === "Present") {
                present++;
            }
        });


    const presentElement =
        document.getElementById(
            "dashboardPresent"
        );

    if (presentElement) {
        presentElement.textContent =
            present;
    }


    const departments =
        new Set(
            employees.map(
                function(employee) {
                    return employee.department;
                }
            )
        );


    const departmentElement =
        document.getElementById(
            "totalDepartments"
        );

    if (departmentElement) {
        departmentElement.textContent =
            departments.size;
    }


    const leaveElement =
        document.getElementById(
            "dashboardLeave"
        );

    if (leaveElement) {

        const approvedLeaves =
            leaves.filter(
                function(leave) {

                    return (
                        leave.status ===
                        "Approved"
                    );
                }
            );

        leaveElement.textContent =
            approvedLeaves.length;
    }


    const totalEmployees =
        document.getElementById(
            "totalEmployees"
        );

    if (totalEmployees) {
        totalEmployees.textContent =
            employees.length;
    }
}


/* =====================================================
   REPORT MANAGEMENT
===================================================== */


/* UPDATE REPORT SUMMARY */

function updateReportSummary() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const todayAttendance =
        attendance[today] || {};


    let present = 0;


    Object.values(todayAttendance)
        .forEach(function(status) {

            if (status === "Present") {
                present++;
            }

        });


    const approvedLeaves =
        leaves.filter(
            function(leave) {

                return leave.status === "Approved";

            }
        ).length;


    const totalSalary =
        salaries.reduce(
            function(total, salary) {

                return total +
                    (Number(salary.netSalary) || 0);

            },
            0
        );


    const employeeElement =
        document.getElementById(
            "reportEmployees"
        );

    const presentElement =
        document.getElementById(
            "reportPresent"
        );

    const leaveElement =
        document.getElementById(
            "reportLeaves"
        );

    const salaryElement =
        document.getElementById(
            "reportSalary"
        );


    if (employeeElement) {
        employeeElement.textContent =
            employees.length;
    }

    if (presentElement) {
        presentElement.textContent =
            present;
    }

    if (leaveElement) {
        leaveElement.textContent =
            approvedLeaves;
    }

    if (salaryElement) {
        salaryElement.textContent =
            "₹" +
            totalSalary.toLocaleString("en-IN");
    }
}


/* =====================================================
   EMPLOYEE REPORT
===================================================== */

function generateEmployeeReport() {

    const output =
        document.getElementById(
            "reportOutput"
        );

    if (!output) return;


    let html = `

        <div class="report-print-area">

            <h2>SVN ELECTRICAL WORKS</h2>

            <h3>Employee Report</h3>

            <p>
                Generated Date:
                ${new Date().toLocaleDateString("en-IN")}
            </p>

            <br>

            <table>

                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Phone</th>
                        <th>Joining Date</th>
                        <th>Salary</th>
                    </tr>

                </thead>

                <tbody>
    `;


    if (employees.length === 0) {

        html += `
            <tr>
                <td colspan="7">
                    No employees found.
                </td>
            </tr>
        `;

    } else {

        employees.forEach(
            function(employee) {

                html += `

                    <tr>

                        <td>${employee.id}</td>

                        <td>${employee.name}</td>

                        <td>${employee.department}</td>

                        <td>${employee.designation}</td>

                        <td>${employee.phone}</td>

                        <td>${employee.joiningDate}</td>

                        <td>
                            ₹${Number(employee.salary)
                                .toLocaleString("en-IN")}
                        </td>

                    </tr>
                `;
            }
        );
    }


    html += `
                </tbody>

            </table>

        </div>
    `;


    output.innerHTML = html;
}


/* =====================================================
   ATTENDANCE REPORT
===================================================== */

function generateAttendanceReport() {

    const output =
        document.getElementById(
            "reportOutput"
        );

    if (!output) return;


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const todayAttendance =
        attendance[today] || {};


    let html = `

        <div class="report-print-area">

            <h2>SVN ELECTRICAL WORKS</h2>

            <h3>Attendance Report</h3>

            <p>
                Date: ${today}
            </p>

            <br>

            <table>

                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Status</th>
                    </tr>

                </thead>

                <tbody>
    `;


    if (employees.length === 0) {

        html += `
            <tr>
                <td colspan="4">
                    No employees found.
                </td>
            </tr>
        `;

    } else {

        employees.forEach(
            function(employee) {

                const status =
                    todayAttendance[employee.id]
                    || "Not Marked";


                html += `

                    <tr>

                        <td>${employee.id}</td>

                        <td>${employee.name}</td>

                        <td>${employee.department}</td>

                        <td>${status}</td>

                    </tr>
                `;
            }
        );
    }


    html += `
                </tbody>

            </table>

        </div>
    `;


    output.innerHTML = html;
}


/* =====================================================
   LEAVE REPORT
===================================================== */

function generateLeaveReport() {

    const output =
        document.getElementById(
            "reportOutput"
        );

    if (!output) return;


    let html = `

        <div class="report-print-area">

            <h2>SVN ELECTRICAL WORKS</h2>

            <h3>Leave Report</h3>

            <p>
                Generated Date:
                ${new Date().toLocaleDateString("en-IN")}
            </p>

            <br>

            <table>

                <thead>

                    <tr>
                        <th>Employee</th>
                        <th>Leave Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Reason</th>
                        <th>Status</th>
                    </tr>

                </thead>

                <tbody>
    `;


    if (leaves.length === 0) {

        html += `
            <tr>
                <td colspan="6">
                    No leave records found.
                </td>
            </tr>
        `;

    } else {

        leaves.forEach(
            function(leave) {

                html += `

                    <tr>

                        <td>${leave.employeeName}</td>

                        <td>${leave.leaveType}</td>

                        <td>${leave.from}</td>

                        <td>${leave.to}</td>

                        <td>${leave.reason}</td>

                        <td>${leave.status}</td>

                    </tr>
                `;
            }
        );
    }


    html += `
                </tbody>

            </table>

        </div>
    `;


    output.innerHTML = html;
}


/* =====================================================
   SALARY REPORT
===================================================== */

function generateSalaryReport() {

    const output =
        document.getElementById(
            "reportOutput"
        );

    if (!output) return;


    let total = 0;


    let html = `

        <div class="report-print-area">

            <h2>SVN ELECTRICAL WORKS</h2>

            <h3>Salary Report</h3>

            <p>
                Generated Date:
                ${new Date().toLocaleDateString("en-IN")}
            </p>

            <br>

            <table>

                <thead>

                    <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Month</th>
                        <th>Basic Salary</th>
                        <th>Allowances</th>
                        <th>Deductions</th>
                        <th>Net Salary</th>
                    </tr>

                </thead>

                <tbody>
    `;


    if (salaries.length === 0) {

        html += `
            <tr>
                <td colspan="7">
                    No salary records found.
                </td>
            </tr>
        `;

    } else {

        salaries.forEach(
            function(salary) {

                const net =
                    Number(salary.netSalary) || 0;

                total += net;


                html += `

                    <tr>

                        <td>${salary.employeeId}</td>

                        <td>${salary.employeeName}</td>

                        <td>${salary.month}</td>

                        <td>
                            ₹${Number(
                                salary.basicSalary
                            ).toLocaleString("en-IN")}
                        </td>

                        <td>
                            ₹${Number(
                                salary.allowances
                            ).toLocaleString("en-IN")}
                        </td>

                        <td>
                            ₹${Number(
                                salary.deductions
                            ).toLocaleString("en-IN")}
                        </td>

                        <td>
                            <strong>
                                ₹${net.toLocaleString("en-IN")}
                            </strong>
                        </td>

                    </tr>
                `;
            }
        );
    }


    html += `

                </tbody>

            </table>

            <br>

            <h3>
                Total Net Salary:
                ₹${total.toLocaleString("en-IN")}
            </h3>

        </div>
    `;


    output.innerHTML = html;
}


/* =====================================================
   PRINT REPORT
===================================================== */

function printReport() {

    const output =
        document.getElementById(
            "reportOutput"
        );


    if (!output) {
        alert("Report area not found.");
        return;
    }


    const reportContent =
        output.innerHTML.trim();


    if (
        !reportContent ||
        reportContent.includes(
            "Select a report above"
        )
    ) {

        alert(
            "Please select a report first."
        );

        return;
    }


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1000,height=700"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups in your browser to print the report."
        );

        return;
    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                SVN Electrical Works - Report
            </title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    color: #111;
                }

                h2 {
                    text-align: center;
                    margin-bottom: 5px;
                }

                h3 {
                    text-align: center;
                    margin-top: 5px;
                }

                p {
                    text-align: center;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th,
                td {
                    border: 1px solid #333;
                    padding: 10px;
                    text-align: center;
                }

                th {
                    background: #eeeeee;
                    font-weight: bold;
                }

                @media print {

                    body {
                        padding: 10px;
                    }

                    button {
                        display: none;
                    }

                }

            </style>

        </head>

        <body>

            ${reportContent}

        </body>

        </html>

    `);


    printWindow.document.close();


    printWindow.focus();


    setTimeout(
        function() {

            printWindow.print();

        },
        500
    );
}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    window.location.href =
        "index.html";
}


/* =====================================================
   INITIAL LOAD
===================================================== */

displayEmployees();

displayLeaves();

displaySalaries();

updateAttendanceCount();

updateLeaveCounts();

updateDashboard();

updateReportSummary();