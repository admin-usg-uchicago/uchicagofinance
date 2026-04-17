# Context

## Project overview
Build a permanent, USG-managed two-part system:

### Internal allocation platform
- Used by committee chairs, selected committee members, Center for Leadership and Involvement advisors, College Council representatives, Vice President of Student Organizations, and top-level USG cabinet leadership
- Stores allocation data
- Supports committee-specific input, review, approval visibility, audit logs, version history, notifications, and publishing workflow

### Public website
- Displays official allocation results to the public (UChicago students)
- Shows historical and current-year allocation data
- Updates daily from published internal data
- Supports search, filtering, rankings, visualizations, and downloads

## Core purpose of System
- Store USG allocation results
- Display official allocation results publicly
- Preserve historical records
- Allow USG to analyze data over time
- Separate RSO allocations from other USG spending categories where relevant

## Likely User groups

### Public users
- Students at UChicago

### Internal users
- Student Organizations Committee chairs
  - Student Government Finance Committee Chair
  - Program Coordinating Council Chair
  - Community Service Fund Chair
  - Sports Club Finance Committee Chair
  - Committee on Academic Teams Chair
- Student Organizations Committee members
- CLI advisors
- College Council representatives
- College Council Chair
  - College Council Vice Chair
- Vice President of Student Organizations
- USG President
  - Executive Vice President

## Allocation Stages and Workflow

### Committee stage
- Committee chairs input allocation suggestions for allocation requests in their own committee purview
- Committee-specific editors only edit their own committee's records

### Review stage
- College Council can view these unpublished committee suggestions
- College Council approval is required before an allocation becomes official

### Publication stage
- VPSO publishes final approved allocation results
- President, Executive Vice President, College Council Chair, and VPSO should all have owner-level or highest-level administrative access for accountability and continuity
  - Previously VPSO Nevin Hall handled all allocation documents and data
  - Problematic as Nevin took away access to these documents and data

## Public facing website requirements

### Publicly displayed data
- Total allocation to RSOs year over year
- Current-year allocation totals
- Allocation amounts by event
- Allocation amounts by RSO
  - Allocation amounts by RSO specific events
- Rankings over a selected period
- Separate view or reporting for USG internal spending distinct from RSO allocations

### Public features
- Home page
- Search/query by RSO name
- Search/query by event
- Filter by:
  - year
  - category of RSO
  - committee
  - total allocation amount
- Historical data browsing
- Default view should show overall data for the current academic year
- Visualizations/charts
- Downloadable standard-format data export
- Daily refresh from published data

### Public visibility rule
- Sensitive information is excluded based on determination by Cabinet or VPSO

## Internal platform requirements

### Core functions
- Manual input of allocation data
- Committee-specific editing
- Bulk upload from spreadsheet/CSV
- Bulk edit
- Archive old records rather than delete
- Version history
- Audit log of all changes
- Recoverable past versions
- Published snapshot separate from working data
- Safeguards against accidental overwrite
- Notifications to relevant actors

### Record lifecycle
1. Committee enters suggested allocation
2. Suggested allocation becomes viewable to College Council Chair and VPSO
3. College Council reviews and approves
4. VPSO publishes approved allocation
5. Published data appears on public website via daily update

### Post-publication correction rule
- Published allocations are generally not edited
- Errors may be corrected when needed

## Roles and permissions

### Viewer
- Public-facing read access only to published data

### Committee member
- View committee-specific internal data for their committee

### Committee chair
- View and edit their committee's allocation inputs

### CLI advisor
- View and edit committee-related inputs, depending on committee scope

### College Council representative
- View unpublished suggestions from committees

### College Council Chair
- View unpublished committee suggestions
- High-level administrative access

### VPSO
- View everything
- Confirm allocations across committees
- Publish final allocation results
- Highest-level administrative access

### President / Executive Vice President
- Highest-level administrative access
- Full visibility for accountability and continuity

## Data model

### Main entity: RSO
Stored separately as its own entity. Possible fields:
- RSO ID
- RSO name
- RSO category
- committee assignment
- status
- other fixed metadata

### Main entity: Allocation record
Required fields currently identified:
- RSO name
- committee
- year
- date
- month
- amount requested
- amount approved
- specific event name
- status of allocation

### Extra structural logic
- One RSO can have multiple allocations
- There is both:
  - a major annual allocation
  - additional event-based allocations during the year
- Categories are fixed
- Committees are fixed
- Allocation revisions or linked versions may exist

## Workflow status model
Suggested status states based on what we need:
- Requested
- Committee Suggested
- Under College Council Review
- College Council Approved
- Published

## Audit and accountability requirements
System must:
- Record every change
- Record who changed what and when
- Preserve old versions
- Support recovery of previous versions
- Maintain a published snapshot separate from internal working edits
- Prevent accidental overwrite or silent replacement

## Scale and usage assumptions
- Roughly 2,000 lines of allocation data per year
- Fewer than 50 concurrent users expected (Not entirely sure)
- Mobile support is not at all important

## Integrations
- Spreadsheet import/export is likely needed
- No existing USG system integration required
- No public API required

## Constraints
- Timeline: preferably by end of spring quarter
- Budget: about $3,000
- Login system required
- Hosting should be chosen for low cost, admin simplicity, and permission control
