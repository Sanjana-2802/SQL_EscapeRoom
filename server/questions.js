const questions = [ 
    {
        id: 1,
        level: "LEVEL 1: PERIMETER GATE",
        title: "🔐 Unauthorized Entry",
        storySetup: "The first breach happened at the Perimeter Gate, the vault's outermost firewall. A fake identity slipped through security. Only one user—named 'Gatekeeper'—holds the real access code to unlock the gate. To trace the intruder, you must identify the correct access code used during the break-in.",
        gatekeeperMessage: "🔍 CLUE #1: Identify the Gatekeeper's access code from our security database. This code was used to bypass the perimeter. Find it, and we unlock the vault's first door.",
        hint: "Use WHERE to filter by role='Gatekeeper' and select their access_code.",
        
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
        level: "LEVEL 2: NETWORK LOGS",
        title: "🔥 First Footprints",
        storySetup: "Inside the firewall, you discover tampered logs. Hacker_X erased timestamps, but he made a mistake—one suspicious activity remains with a strange timestamp: 2025-01-15%. This must be the moment he executed his unauthorized login attempt. Find the user who logged in at this suspicious timestamp. This will reveal Hacker_X's first confirmed footprint. The chase now gets real.",
        gatekeeperMessage: "🔍 CLUE #2: Find the mysterious user who performed a failed login attempt on 2025-01-15. Every timestamp tells a story. This one reveals the intruder.",
        hint: "Use LIKE with pattern matching. Timestamps starting with '2025-01-15%' will show all activity on that date.",
        
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
        level: "LEVEL 3: HR ARCHIVES",
        title: "🧩 Identity Match",
        storySetup: "You've identified Hacker_X, but you need to pinpoint his physical location inside the Cyber Vault facility. Two connected tables in the HR Archives store the truth: employees and departments. Hacker_X once worked undercover inside the organization. His department's floor is the next clue to his escape route.",
        gatekeeperMessage: "🔍 CLUE #3: Use table joins to uncover the floor number where Hacker_X secretly operated. This number unlocks the elevator to the upper levels where he's hiding.",
        hint: "Use JOIN to connect employees with departments. Filter where name='Hacker_X' and select the floor number.",
        
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
        level: "LEVEL 4: TRANSACTION CORE",
        title: "💸 Tracking the Money Trail",
        storySetup: "Hacker_X didn't just infiltrate the system—he manipulated digital transactions to fund his escape. A hidden wallet shows unusual patterns. Large withdrawals... mismatched transfers... and one user whose spending is abnormally high. Only the highest spender holds the key to the next gate.",
        gatekeeperMessage: "🔍 CLUE #4: Identify the user with the highest total spending. This will uncover Hacker_X's funding account. You are getting closer... but Hacker_X knows you're following.",
        hint: "Use GROUP BY, SUM(amount), ORDER BY DESC, and LIMIT 1 to find the top spender.",
        
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
        level: "LEVEL 5: KERNEL CORE",
        title: "🔓 The Final Confrontation",
        storySetup: "The final chamber is the Kernel Security Core, the heart of the Cyber Defense Vault. Only users with an access level above the global average can reach this chamber. One ID stands out—an access level far above all others. This ID belongs to the real Hacker_X.",
        gatekeeperMessage: "🔍 CLUE #5 (FINAL): Find the user whose access level is HIGHER than the system average. This anomaly proves they were given god-mode permissions to infiltrate our vault. This is our smoking gun!",
        hint: "Use a SUBQUERY to calculate the average access level, then find which user exceeds it. This advanced SQL skill will crack the case wide open!",
        
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
