const questions = [ 
    {
        id: 1,
        level: "Level 1: The Entry Lock",
        title: "Station: PERIMETER GATE",
        gatekeeperMessage: "PUZZLE: Find the access code of the user with role = 'Gatekeeper'.",
        hint: "Table: users(id, name, role, access_code). Use WHERE role='Gatekeeper'.",
        
        // SQL Output = 7342
        unlockCode: "7342",

        tables: {
            users: {
                columns: ["id", "name", "role", "access_code"],
                rows: [
                    { id: 1, name: "Admin_01", role: "Admin", access_code: "9988" },
                    { id: 2, name: "User_Guest", role: "Guest", access_code: "1234" },
                    { id: 3, name: "Sys_Gate", role: "Gatekeeper", access_code: "7342" },
                    { id: 4, name: "Dev_Ops", role: "Developer", access_code: "5566" }
                ]
            }
        },
        correctAnswer: "SELECT access_code FROM users WHERE role='Gatekeeper';"
    },

    {
        id: 2,
        level: "Level 2: The Firewall",
        title: "Station: NETWORK LOGS",
        gatekeeperMessage: "PUZZLE: Find who attempted a login at a suspicious timestamp like '2025-01-15%'.",
        hint: "Table: logs(user, action, timestamp). Use LIKE '2025-01-15%'.",
        
        // SQL Output = Hacker_X
        unlockCode: "Hacker_X",

        tables: {
            logs: {
                columns: ["user", "action", "timestamp"],
                rows: [
                    { user: "Admin_01", action: "Login", timestamp: "2025-01-14 10:00:00" },
                    { user: "User_Guest", action: "View", timestamp: "2025-01-14 12:30:00" },
                    { user: "Hacker_X", action: "Failed_Login", timestamp: "2025-01-15 03:45:12" },
                    { user: "Sys_Gate", action: "Logout", timestamp: "2025-01-16 09:00:00" }
                ]
            }
        },
        correctAnswer: "SELECT user FROM logs WHERE timestamp LIKE '2025-01-15%';"
    },

    {
        id: 3,
        level: "Level 3: The Cipher Table",
        title: "Station: HR ARCHIVES",
        gatekeeperMessage: "PUZZLE: Find the floor number where the criminal ('Hacker_X') works.",
        hint: "Tables: employees(id, name, dept_id), departments(dept_id, dept_name, floor). JOIN them.",
        
        // SQL Output = 13
        unlockCode: "13",

        tables: {
            employees: {
                columns: ["id", "name", "dept_id"],
                rows: [
                    { id: 101, name: "Admin_01", dept_id: 1 },
                    { id: 102, name: "Hacker_X", dept_id: 2 },
                    { id: 103, name: "Dev_Ops", dept_id: 3 }
                ]
            },
            departments: {
                columns: ["dept_id", "dept_name", "floor"],
                rows: [
                    { dept_id: 1, dept_name: "Administration", floor: 5 },
                    { dept_id: 2, dept_name: "CyberSecurity", floor: 13 },
                    { dept_id: 3, dept_name: "Operations", floor: 2 }
                ]
            }
        },
        correctAnswer: "SELECT d.floor FROM employees e JOIN departments d ON e.dept_id = d.dept_id WHERE e.name='Hacker_X';"
    },

    {
        id: 4,
        level: "Level 4: The Data Breach",
        title: "Station: TRANSACTION CORE",
        gatekeeperMessage: "PUZZLE: Find which user spent the highest total amount.",
        hint: "Table: transactions(id, user, amount). Use SUM(amount), GROUP BY, ORDER BY DESC, LIMIT 1.",
        
        // SQL Output = Hacker_X
        unlockCode: "Hacker_X",

        tables: {
            transactions: {
                columns: ["id", "user", "amount"],
                rows: [
                    { id: 1, user: "User_A", amount: 100 },
                    { id: 2, user: "User_B", amount: 500 },
                    { id: 3, user: "User_C", amount: 1500 },
                    { id: 4, user: "User_B", amount: 200 },
                    { id: 5, user: "User_C", amount: 500 },
                    { id: 6, user: "Hacker_X", amount: 9999 }
                ]
            }
        },
        correctAnswer: "SELECT user FROM transactions GROUP BY user ORDER BY SUM(amount) DESC LIMIT 1;"
    },

    {
        id: 5,
        level: "Level 5: Root Access",
        title: "Station: KERNEL",
        gatekeeperMessage: "PUZZLE: Find the ID of the only user whose access level is higher than the average level.",
        hint: "Table: access(id, level). Use subquery: level > (SELECT AVG(level)...).",
        
        // SQL Output = 999
        unlockCode: "999",

        tables: {
            access: {
                columns: ["id", "level"],
                rows: [
                    { id: 101, level: 2 },
                    { id: 102, level: 3 },
                    { id: 103, level: 2 },
                    { id: 104, level: 4 },
                    { id: 105, level: 2 },
                    { id: 999, level: 10 }
                ]
            }
        },
        correctAnswer: "SELECT id FROM access WHERE level > (SELECT AVG(level) FROM access);"
    }
];

module.exports = questions;
