# Playbook: run several agents in parallel

```bash
node tools/plan-run.mjs --suite regression --shard 1/4
node tools/plan-run.mjs --suite regression --shard 2/4
node tools/plan-run.mjs --suite regression --shard 3/4
node tools/plan-run.mjs --suite regression --shard 4/4
```

- Sharding keeps each dependency chain on one shard.
- Give each agent its own run id and its own browser profile/port (`AGT_CDP_PORT=9334 node tools/browser/launch.mjs`).
- Each run has its own data prefix, so created records don't collide.
- Two agents must not use the **same account** for destructive cases at the same time. With one account per role, shard by module instead (`--module a,b` per agent).
- Combine results with `reports/INDEX.md`, `bugs/INDEX.md`, or point CI at `reports/*/junit.xml`.
