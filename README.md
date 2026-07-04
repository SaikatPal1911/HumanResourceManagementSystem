# Human Resource Management System (HRMS)

**Every workday, perfectly aligned.**

## Copilot Master Prompt

### Phase 1: Auth + Admin Panel

Stack: React + TypeScript + Supabase (Auth, Postgres, RLS, Edge Functions)

How to use this file: Copy one phase at a time into GitHub Copilot Chat (or Copilot Workspace), in order. Don't paste the whole file at once — Copilot works far better with one scoped task per prompt. Wait for each phase to finish, test it, then move to the next. The phases already contain everything Copilot needs to know (field names, formats, logic) — you don't need to explain anything extra.

0. Context block — paste this once at the start of your Copilot session

I'm building a Human Resource Management System (HRMS) using React + TypeScript + Supabase.

Two roles exist: "admin" (HR Officer/Admin) and "employee".

Core rule: Employees can NEVER self-register. Only an Admin/HR user can create employee accounts. The very first Admin/HR account for a company is created through a one-time "Company Sign Up" flow (with email verification). Every employee account after that is created from inside the app by an Admin/HR user, with an auto-generated Login ID and an auto-generated temporary password.

I will build this in phases. Wait for me to confirm each phase works before moving to the next. Ask me before assuming a folder structure if one doesn't already exist.

My landing/hero page UI is already designed separately — do not touch or redesign it. Match its visual style (colors, fonts, spacing, component patterns) for every new screen you build from now on. If you don't have access to that file, ask me for the component/CSS file path before styling new pages.

## Description

The Human Resource Management System (HRMS) is a web-based platform designed to digitize and streamline core HR operations for organizations. It provides role-based access for Admins/HR Officers and Employees, covering secure authentication, employee profile management, attendance tracking, leave and time-off management, payroll visibility, and approval workflows — all in one centralized system.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Functional Modules](#functional-modules)
- [Definitions](#definitions)
- [Design Reference](#design-reference)

## Overview

Traditional HR processes — tracking attendance, approving leaves, managing employee records, and handling payroll — are often manual and fragmented. HRMS solves this by offering a single, secure platform where employees can manage their own information and HR/Admins can efficiently oversee the workforce.

## Key Features

- 🔐 **Secure Authentication** — Sign up and sign in with email verification and password security rules
- 👥 **Role-Based Access Control** — Separate views and permissions for Admins/HR and Employees
- 🧑‍💼 **Employee Profile Management** — View and edit personal, job, and salary details
- 🕒 **Attendance Tracking** — Daily/weekly views with check-in/check-out and status tracking
- 📅 **Leave & Time-Off Management** — Apply for leave via calendar, track approval status
- ✅ **Approval Workflows** — Admins can approve/reject leave requests with comments
- 💰 **Payroll Visibility** — Read-only payroll view for employees; full control for Admins

## User Roles

| Role | Description |
|------|-------------|
| **Admin / HR Officer** | Manages employees, approves leave & attendance, views and updates payroll details |
| **Employee** | Views personal profile, attendance, applies for leave, views salary details |

## Functional Modules

### 1. Authentication & Authorization
- Sign up with Employee ID, Email, Password, and Role selection
- Email verification required
- Sign in with error handling for incorrect credentials
- Redirect to role-based dashboard on successful login

### 2. Dashboard
- **Employee Dashboard**: Quick-access cards for Profile, Attendance, Leave Requests, Logout, and recent activity/alerts
- **Admin/HR Dashboard**: Employee list, attendance records, leave approvals, and ability to switch between employees

### 3. Employee Profile Management
- View personal details, job details, salary structure, documents, and profile picture
- Employees can edit limited fields (address, phone, profile picture)
- Admins can edit all employee details

### 4. Attendance Management
- Daily and weekly attendance views
- Check-in/check-out functionality
- Status types: Present, Absent, Half-day, Leave
- Employees view only their own records; Admin/HR views all

### 5. Leave & Time-Off Management
- Apply for leave by type (Paid, Sick, Unpaid), date range via calendar, and remarks
- Monthly calendar view with Present/Absent markers
- Leave status: Pending, Approved, Rejected
- Admin can view, approve/reject, and comment on requests; changes reflect immediately

### 6. Payroll/Salary Management
- Employees: read-only payroll view
- Admin: view all payroll, update salary structures, ensure payroll accuracy

## Definitions

- **Admin / HR Officer**: User with management and approval privileges
- **Employee**: Regular user with limited access
- **Time-Off**: Paid leave, sick leave, unpaid leave, etc.

## Design Reference

Wireframes/mockups: [Excalidraw Design](https://link.excalidraw.com/l/65VNwvy7c4X/58RLEJ4oOwh)

---

*This README is based on the HRMS Requirements Specification document.*
