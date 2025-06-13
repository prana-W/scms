# Society Complaint Management System (SCMS)

## *Features*

- User can register as Resident, Worker or Maintenance Manager.
- Login using Phone number.
- 

## *Problem Statement*

### 🏢 Challenge Overview
   Create a full-stack web application for residential societies that streamlines complaint management. Residents report issues with photo evidence, maintenance staff assigns tasks to specialized workers, and QR-based verification ensures accountability. Employees earn token rewards for resolved complaints.

### 🎯 Core Requirements
1. Multi-Role Ecosystem
   Residents
   Login/register (flat number, contact).
   Launch complaints: Category (plumbing/electrical/etc.), description, photo upload.
   Receive unique complaint code + QR code upon submission.
   Maintenance Managers
   Dashboard: View new complaints, assign to workers by specialization.
   Set priority (High/Medium/Low) based on issue type.
   Workers
   Receive assigned complaints (with priority ranking).
   Mark complaints as "In Progress"/"Completed."
   Scan resident’s QR code to verify resolution.
2. Complaint Lifecycle Workflow
   Resident Submission:
   Photo upload with issue description → Auto-generate complaint ID (e.g., COMP-7B3A) + QR code.
   Manager Assignment:
   assign workers by trade (electrician, plumber, etc.).
   Priority rules (e.g., "Electrical fault = High").
   Worker Verification:
   QR scan at resident’s flat → Auto-mark as resolved + timestamp.
3. Token Reward System
   Workers earn tokens per resolved complaint:
   High Priority = 5 tokens, Medium = 3, Low = 1.
   Token dashboard: View balance, redeem rewards (e.g., "100 tokens = ₹500 voucher").
4. Real-Time Tracking
   Resident View: Complaint status (Submitted → Assigned → Resolved).
   Manager Dashboard:
   Worker load analytics (e.g., "Electrician: 5 pending tasks").
   Resolution time reports.
