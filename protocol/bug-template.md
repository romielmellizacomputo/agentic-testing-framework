# Bug template

`tools/report.mjs` writes one of these per defect into `bugs/<runId>/` (rows recorded with `--same-as` appear inside under "Also seen in"), copies the evidence next to it and lists every bug in `bugs/INDEX.md`. Review, file it in your tracker, then change **Status** to the issue link.

```markdown
## [<module>] <what is broken, in one line>

**Severity:** S1 / S2 / S3 / S4
**Status:** draft (not filed yet)
**Environment:** <env name>
**Role:** <role key>
**Test case:** <CASE-ID> — <case title>
**Agent run:** <runId>

### Steps to reproduce
1. ...

### Expected (from test case)
### Actual
### Also seen in
### Evidence
```
