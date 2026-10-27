# Playbook: exploratory testing

Time-box 20–30 minutes per module. Goal: new bugs **and** new test cases.

| Heuristic | Try |
|---|---|
| Boundaries | empty, 1 char, max length +1, 0, negative, huge numbers, far past/future dates, Feb 29, midnight in another timezone |
| Characters | emoji, accents, CJK, RTL, quotes, `<b>`, `' OR 1=1 --` (as plain text) |
| Interruptions | reload mid-save, Back during a dialog, two tabs editing the same item |
| Repetition | double-click submit, repeated Enter, rapid filter toggling |
| State | archived/closed/cancelled items: still editable? locked users? expired links? |
| Permissions | the same URL as each role in `config/roles.md` |
| Network | slow 3G, offline then online, one API call blocked |
| Layout | 375 px wide, 200% zoom, very long names in tables |
| Consistency | does a number match between list, detail, export and dashboard? |

Write each finding as a full case in `runs/<runId>/proposed-cases.md` (tag `exploratory`) and summarise it in `runs/<runId>/run-notes.md`, then re-run `report.mjs`.
