// KA Farm - Employees Storage Domain
// Manages employees, attendance, and payroll data

import { KAStorage } from "./core.js";

const DEFAULT_EMPLOYEES = [
  {
    id: "E-001",
    name: "Samba Diouf",
    phone: "77 521 44 22",
    role: "Ouvrier agricole",
    dailyRate: 4000,
    status: "Actif",
  },
  {
    id: "E-002",
    name: "Awa Sow",
    phone: "76 432 11 00",
    role: "Chef d'équipe pépinière",
    dailyRate: 5000,
    status: "Actif",
  },
  {
    id: "E-003",
    name: "Ibrahima Ndiaye",
    phone: "77 612 89 54",
    role: "Arroseur principal",
    dailyRate: 4500,
    status: "Actif",
  },
  {
    id: "E-004",
    name: "Modou Fall",
    phone: "70 855 33 21",
    role: "Maraîcher",
    dailyRate: 4000,
    status: "Actif",
  },
  {
    id: "E-005",
    name: "Fatou Binetou Diop",
    phone: "77 345 67 89",
    role: "Maraîchère",
    dailyRate: 4000,
    status: "Actif",
  },
];

const DEFAULT_ATTENDANCE = [
  { employeeId: "E-001", date: "2026-06-25", status: "Présent", notes: "" },
  { employeeId: "E-002", date: "2026-06-25", status: "Présent", notes: "" },
  { employeeId: "E-003", date: "2026-06-25", status: "Présent", notes: "" },
  { employeeId: "E-004", date: "2026-06-25", status: "Présent", notes: "" },
  { employeeId: "E-005", date: "2026-06-25", status: "Absent", notes: "Permission famille" },
  { employeeId: "E-001", date: "2026-06-26", status: "Présent", notes: "" },
  { employeeId: "E-002", date: "2026-06-26", status: "Présent", notes: "" },
  { employeeId: "E-003", date: "2026-06-26", status: "Demi-journée", notes: "Parti à midi" },
  { employeeId: "E-004", date: "2026-06-26", status: "Présent", notes: "" },
  { employeeId: "E-005", date: "2026-06-26", status: "Présent", notes: "De retour" },
];

const DEFAULT_EMPLOYEE_PAYMENTS = [
  {
    id: "PAY-001",
    employeeId: "E-001",
    amount: 80000,
    date: "2026-06-15",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-15",
    paymentMethod: "Orange Money",
    status: "Payé",
  },
  {
    id: "PAY-002",
    employeeId: "E-002",
    amount: 100000,
    date: "2026-06-15",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-15",
    paymentMethod: "Wave",
    status: "Payé",
  },
  {
    id: "PAY-003",
    employeeId: "E-003",
    amount: 90000,
    date: "2026-06-15",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-15",
    paymentMethod: "Espèces",
    status: "Payé",
  },
  {
    id: "PAY-004",
    employeeId: "E-004",
    amount: 80000,
    date: "2026-06-15",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-15",
    paymentMethod: "Wave",
    status: "Payé",
  },
];

export const EmployeesStorage = {
  getEmployees() {
    return KAStorage.get("ka_farm_employees", DEFAULT_EMPLOYEES);
  },
  saveEmployees(employees) {
    KAStorage.set("ka_farm_employees", employees);
  },

  getAttendance() {
    return KAStorage.get("ka_farm_attendance", DEFAULT_ATTENDANCE);
  },
  saveAttendance(attendance) {
    KAStorage.set("ka_farm_attendance", attendance);
  },

  getEmployeePayments() {
    return KAStorage.get("ka_farm_employee_payments", DEFAULT_EMPLOYEE_PAYMENTS);
  },
  saveEmployeePayments(payments) {
    KAStorage.set("ka_farm_employee_payments", payments);
  },
};
