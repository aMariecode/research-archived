# ADMIN MANUAL
## Research Archived: Capstone Repository System

---

## TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Getting Started](#2-getting-started)
   - 2.1 Accessing the Admin Panel
   - 2.2 Admin Login
3. [Dashboard Overview](#3-dashboard-overview)
   - 3.1 Analytics Overview
   - 3.2 Quick Statistics
4. [Managing Capstones](#4-managing-capstones)
   - 4.1 Viewing All Capstones
   - 4.2 Adding a New Capstone
   - 4.3 Approving Capstones
   - 4.4 Rejecting Capstones
   - 4.5 Editing Capstone Details
   - 4.6 Archiving Capstones
   - 4.7 Restoring Archived Capstones
   - 4.8 Deleting Capstones
5. [Managing Users](#5-managing-users)
   - 5.1 Viewing All Users
   - 5.2 Viewing User Details
   - 5.3 Disabling User Accounts
   - 5.4 Enabling User Accounts
   - 5.5 Archiving Users
   - 5.6 Restoring Archived Users
6. [Analytics and Reports](#6-analytics-and-reports)
   - 6.1 Overview Statistics
   - 6.2 Capstones by Year
   - 6.3 Capstones by Adviser
   - 6.4 User Activity
7. [Profile Management](#7-profile-management)
   - 7.1 Updating Admin Profile
   - 7.2 Changing Password
8. [System Maintenance](#8-system-maintenance)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. SYSTEM OVERVIEW

### 1.1 Introduction

**Research Archived** is a web-based capstone repository system that enables the university to store, manage, and provide access to capstone projects. As an administrator, you have full control over the system including managing capstones, users, and viewing analytics.

### 1.2 Admin Responsibilities

As a system administrator, you are responsible for:
- Reviewing and approving/rejecting capstone submissions
- Managing the capstone repository (add, edit, archive, delete)
- Managing user accounts
- Monitoring system usage through analytics
- Ensuring data integrity and system maintenance

### 1.3 Admin Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | View system statistics and overview |
| **Capstone Management** | Add, approve, reject, edit, archive, restore, delete capstones |
| **User Management** | View, disable, enable, archive, restore users |
| **Analytics** | View reports on capstones, users, and system usage |
| **Profile Management** | Update admin information and password |

### 1.4 Capstone Workflow

```
Submitted → Pending → Approved/Rejected → Published/Not Published
                           ↓
                      Archived (if needed)
                           ↓
                      Restored (if needed)
```

### 1.5 Capstone Status Types

| Status | Description |
|--------|-------------|
| **Pending** | Newly submitted, awaiting admin review |
| **Approved** | Reviewed and published, visible to all users |
| **Rejected** | Reviewed and declined, not visible to users |
| **Archived** | Removed from active list but preserved in system |

---

## 2. GETTING STARTED

### 2.1 Accessing the Admin Panel

1. Open your web browser
2. Navigate to the system URL
3. Click on **"Admin"** or access the admin login page

### 2.2 Admin Login

1. Enter your admin **Email** address
2. Enter your admin **Password**
3. Click **"Login"**
4. You will be redirected to the Admin Dashboard

---

## 3. DASHBOARD OVERVIEW

### 3.1 Analytics Overview

The dashboard displays key metrics including:
- Total number of capstones
- Total registered users
- Pending submissions
- Approved capstones
- Rejected capstones
- Archived items

### 3.2 Quick Statistics

| Metric | Description |
|--------|-------------|
| **Total Capstones** | All capstones in the system |
| **Active Approved** | Currently published capstones |
| **Pending** | Capstones awaiting review |
| **Rejected** | Declined capstones |
| **Archived** | Removed from active list |
| **Total Users** | All registered users |
| **Active Users** | Users who can access the system |
| **Page Views** | Total views of capstone pages |
| **Downloads** | Total PDF downloads |

---

## 4. MANAGING CAPSTONES

### 4.1 Viewing All Capstones

1. Navigate to **Capstones** in the admin menu
2. View the list of all capstones with:
   - Title
   - Year
   - Status (Pending/Approved/Rejected)
   - Created By
   - Date Submitted

### 4.2 Adding a New Capstone

1. Click **"Add Capstone"** or **"+"** button
2. Fill in the required information:
   - **Title** – Capstone project title
   - **Abstract** – Summary of the research
   - **Members** – Names of the researchers (comma-separated)
   - **Adviser** – Faculty adviser name
   - **Year** – Year of completion
   - **Technologies** – Tools used (comma-separated)
   - **PDF File** – Upload the capstone document
   - **GitHub URL** – Source code link (optional)
3. Click **"Submit"** to add the capstone
4. The capstone will be automatically approved when added by admin

### 4.3 Approving Capstones

1. Go to **Pending Capstones** section
2. Click on a capstone to view details
3. Review the submitted information and PDF
4. Click **"Approve"** button
5. The capstone status changes to **Approved**
6. The capstone becomes visible to all users

### 4.4 Rejecting Capstones

1. Go to **Pending Capstones** section
2. Click on a capstone to view details
3. Review the submitted information
4. Click **"Reject"** button
5. The capstone status changes to **Rejected**
6. The capstone remains hidden from users

### 4.5 Editing Capstone Details

1. Find the capstone in the list
2. Click **"Edit"** or the edit icon
3. Modify the necessary fields:
   - Title
   - Abstract
   - Members
   - Adviser
   - Year
   - Technologies
   - GitHub URL
4. Click **"Save"** to apply changes

### 4.6 Archiving Capstones

1. Find the capstone to archive
2. Click **"Archive"** or the archive icon
3. Confirm the action
4. The capstone is moved to the Archived section
5. It will no longer appear in the active list

### 4.7 Restoring Archived Capstones

1. Go to **Archived Capstones** section
2. Find the capstone to restore
3. Click **"Restore"** button
4. The capstone returns to the active list

### 4.8 Deleting Capstones

1. Find the capstone to delete
2. Click **"Delete"** button
3. Confirm the deletion
4. **Warning:** This action may be permanent

---

## 5. MANAGING USERS

### 5.1 Viewing All Users

1. Navigate to **Users** in the admin menu
2. View the list of registered users:
   - Full Name
   - Email
   - Role (Viewer/Faculty/Admin)
   - Status (Active/Disabled)
   - Last Login

### 5.2 Viewing User Details

1. Click on a user's name
2. View complete user information:
   - Account details
   - Registration date
   - Last login date
   - Account status

### 5.3 Disabling User Accounts

1. Find the user in the list
2. Click **"Disable"** button
3. Confirm the action
4. The user can no longer access the system

### 5.4 Enabling User Accounts

1. Find the disabled user
2. Click **"Enable"** button
3. The user regains access to the system

### 5.5 Archiving Users

1. Find the user to archive
2. Click **"Archive"** button
3. Confirm the action
4. The user is moved to Archived Users

### 5.6 Restoring Archived Users

1. Go to **Archived Users** section
2. Find the user to restore
3. Click **"Restore"** button
4. The user account is reactivated

---

## 6. ANALYTICS AND REPORTS

### 6.1 Overview Statistics

Navigate to **Analytics** to view:
- Total capstones by status
- User registration trends
- System usage metrics
- Downloads and views

### 6.2 Capstones by Year

- View breakdown of capstones per academic year
- Identify trends in submissions over time

### 6.3 Capstones by Adviser

- View capstones grouped by adviser
- See which advisers have supervised the most projects

### 6.4 User Activity

- Monitor total registered users
- Track active vs. disabled accounts
- View login activity

---

## 7. PROFILE MANAGEMENT

### 7.1 Updating Admin Profile

1. Click on your name or **Profile**
2. Click **"Edit Profile"**
3. Update your information:
   - Full Name
   - Email
4. Click **"Save"**

### 7.2 Changing Password

1. Go to Profile settings
2. Click **"Change Password"**
3. Enter **Current Password**
4. Enter **New Password**
5. Confirm **New Password**
6. Click **"Update Password"**

---

## 8. SYSTEM MAINTENANCE

### Best Practices

| Task | Recommendation |
|------|----------------|
| **Review Pending** | Check pending submissions daily |
| **Backup Data** | Ensure regular database backups |
| **Monitor Users** | Review user accounts periodically |
| **Check Analytics** | Monitor system usage weekly |
| **Archive Old Records** | Archive inactive or outdated capstones |

---

## 9. TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Cannot access admin panel | Verify you have admin role. Contact system developer. |
| Capstone not appearing after approval | Refresh the page. Check if capstone is marked as deleted. |
| PDF upload fails | Check file size limit. Ensure file is a valid PDF. |
| User cannot login | Check if account is disabled. Reset their password. |
| Analytics not loading | Refresh the page. Clear browser cache. |
| Slow system performance | Check server status. Contact technical support. |

---

## ADMIN QUICK REFERENCE

### Capstone Actions
- ✅ **Approve** – Publish capstone for all users
- ❌ **Reject** – Decline submission
- ✏️ **Edit** – Modify capstone details
- 📦 **Archive** – Move to archived section
- ♻️ **Restore** – Bring back from archive
- 🗑️ **Delete** – Remove permanently

### User Actions
- 👁️ **View** – See user details
- 🚫 **Disable** – Block user access
- ✅ **Enable** – Restore user access
- 📦 **Archive** – Archive user account
- ♻️ **Restore** – Restore archived user

---

**For technical support, please contact the system developer.**

