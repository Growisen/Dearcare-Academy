# New Attendance System - Four Session Implementation

## Overview

The attendance system has been completely updated to support **four distinct sessions per day** instead of a single daily attendance. This implementation follows the new database schema requirements and includes mutual exclusion logic.

## Database Schema Changes

### Updated `academy_student_attendance` Table

```sql
CREATE TABLE public.academy_student_attendance (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  student_id bigint,
  date date,
  fn_theory boolean,      -- Forenoon Theory Session
  an_theory boolean,      -- Afternoon Theory Session
  fn_practical boolean,   -- Forenoon Practical Session
  an_practical boolean,   -- Afternoon Practical Session
  CONSTRAINT academy_student_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT academy_student_attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
```

## Session Structure

### 1. **Forenoon (FN) Sessions**

- **FN Theory**: Morning theory classes
- **FN Practical**: Morning practical classes

### 2. **Afternoon (AN) Sessions**

- **AN Theory**: Afternoon theory classes
- **AN Practical**: Afternoon practical classes

## Business Logic: Mutual Exclusion

**Critical Rule**: A student can only attend **ONE session per time period**.

### Implementation:

- If `fn_theory = true`, then `fn_practical` is automatically set to `false`
- If `fn_practical = true`, then `fn_theory` is automatically set to `false`
- If `an_theory = true`, then `an_practical` is automatically set to `false`
- If `an_practical = true`, then `an_theory` is automatically set to `false`

### Example Scenarios:

```
✅ Valid: fn_theory=true, fn_practical=false, an_theory=true, an_practical=false
✅ Valid: fn_theory=false, fn_practical=true, an_theory=false, an_practical=true
❌ Invalid: fn_theory=true, fn_practical=true (not allowed - mutual exclusion)
❌ Invalid: an_theory=true, an_practical=true (not allowed - mutual exclusion)
```

## Updated Components

### 1. **Supervisor Attendance Page** (`/supervisor-dashboard/supervisor-attendance`)

#### Features:

- **Four-session marking interface** with visual separation between FN and AN
- **Automatic mutual exclusion** - buttons are disabled when conflicting session is marked
- **Color-coded sessions**:
  - Forenoon sessions: Blue background
  - Afternoon sessions: Orange background
- **Real-time statistics** showing total sessions attended
- **Session-wise Present/Absent marking**

#### UI Structure:

```
Student Card
├── Forenoon (FN) [Blue Section]
│   ├── Theory [Present/Absent buttons]
│   └── Practical [Present/Absent buttons - disabled if Theory=Present]
└── Afternoon (AN) [Orange Section]
    ├── Theory [Present/Absent buttons]
    └── Practical [Present/Absent buttons - disabled if Theory=Present]
```

### 2. **Student Attendance Page** (`/student-dashboard/student-attendance`)

#### Features:

- **Session-based statistics** instead of daily statistics
- **Detailed session breakdown** for each date
- **Visual session indicators** showing which sessions were attended
- **Updated attendance percentage** calculation based on total sessions

#### Statistics Display:

- **Total Sessions**: Count of all recorded sessions
- **Present Sessions**: Count of sessions marked as present
- **Absent Sessions**: Count of sessions marked as absent
- **Attendance Rate**: Percentage based on session attendance

### 3. **API Endpoints**

#### Updated `/api/supervisor-attendance` (POST)

```json
{
  "supervisorId": 123,
  "studentId": 456,
  "date": "2024-01-15",
  "session": "fn|an",
  "type": "theory|practical",
  "isPresent": true|false
}
```

#### Updated `/api/student-attendance` (GET)

- Returns session-based statistics
- Provides detailed session breakdowns
- Calculates attendance percentage based on total sessions

## Data Migration Considerations

### For Existing Data:

1. **Backup existing data** before migration
2. **Map old `present` field** to appropriate new fields based on business rules
3. **Consider default values** for unmapped sessions
4. **Update reporting queries** to use new session-based calculations

### Migration Script Example:

```sql
-- Example migration (adjust based on your business logic)
UPDATE academy_student_attendance
SET
  fn_theory = present,
  an_theory = false,
  fn_practical = false,
  an_practical = false
WHERE present IS NOT NULL;

-- Remove old column after verification
ALTER TABLE academy_student_attendance DROP COLUMN present;
```

## Benefits of New System

### 1. **Granular Tracking**

- Track attendance for specific session types
- Better insights into student engagement patterns
- Separate theory vs practical attendance analytics

### 2. **Accurate Reporting**

- Session-based attendance percentages
- Theory vs Practical attendance comparison
- Time-period specific analysis (FN vs AN)

### 3. **Compliance Ready**

- Detailed audit trails for each session type
- Meets educational compliance requirements
- Supports complex attendance policies

### 4. **Enhanced User Experience**

- Intuitive session-based interface
- Visual feedback for mutual exclusion
- Clear session breakdowns for students

## Testing Checklist

### Supervisor Dashboard:

- [ ] Can mark FN Theory attendance
- [ ] FN Practical is disabled when FN Theory is present
- [ ] Can mark AN Theory attendance
- [ ] AN Practical is disabled when AN Theory is present
- [ ] Statistics update correctly
- [ ] Data persists after page refresh

### Student Dashboard:

- [ ] Session statistics display correctly
- [ ] Attendance records show session breakdown
- [ ] Attendance percentage calculates based on sessions
- [ ] Month/year filtering works

### API Endpoints:

- [ ] Mutual exclusion logic works in API
- [ ] Session data saves correctly
- [ ] Statistics calculate properly
- [ ] Error handling works for invalid data

## Usage Instructions

### For Supervisors:

1. **Navigate** to Supervisor Attendance page
2. **Select date** using date picker
3. **For each student**:
   - Choose Forenoon session type (Theory OR Practical)
   - Mark Present/Absent for chosen session
   - Choose Afternoon session type (Theory OR Practical)
   - Mark Present/Absent for chosen session
4. **Save** automatically happens on each selection

### For Students:

1. **View attendance** on Student Attendance page
2. **Select month/year** for filtering
3. **Review session breakdown** for each date
4. **Monitor attendance percentage** to ensure compliance

## Future Enhancements

### Potential Additions:

- **Session scheduling**: Link sessions to actual class schedules
- **Bulk attendance marking**: Mark multiple students simultaneously
- **Attendance notifications**: Alert students about low attendance
- **Advanced reporting**: Generate session-wise attendance reports
- **Mobile optimization**: Responsive design for mobile devices

---

## Technical Implementation Notes

### Mutual Exclusion Logic:

```typescript
// Frontend validation
if (session === 'fn') {
  if (type === 'theory') {
    updateData.fn_practical = false;
  } else {
    updateData.fn_theory = false;
  }
}

// Database constraint (recommended addition)
ALTER TABLE academy_student_attendance
ADD CONSTRAINT check_fn_mutual_exclusion
CHECK (NOT (fn_theory = true AND fn_practical = true));

ALTER TABLE academy_student_attendance
ADD CONSTRAINT check_an_mutual_exclusion
CHECK (NOT (an_theory = true AND an_practical = true));
```

### Performance Considerations:

- **Indexed date column** for faster queries
- **Compound indexes** on (student_id, date) for frequent lookups
- **Session-based aggregation** queries for statistics

---

**✅ Status**: Implementation Complete
**🔄 Next Steps**: User testing and feedback collection
**📊 Impact**: Enhanced attendance tracking with 4x granularity
