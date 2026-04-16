# EmeraldQuest — Backlog

## Bugs
- [ ] API key doesn't sync across devices — must re-enter on each new browser/device. Add option to save key in GitHub cloud save (save-data.json) so it auto-syncs.
- [ ] Chat history not saving to GitHub — currently cleared on save (state.js line 165). Need to debug and include chat transcript in cloud saves so conversations can be reviewed/troubleshot.
- [ ] GitHub save may be failing silently — sync says success but save-data.json not appearing in repo. Debug token permissions and error handling.

- [ ] Chat history has no message limit — currently sending full history to API every call. Collect per-page message counts via chatStats over 50-100 real homework sessions, analyze the distribution, then set a data-driven limit to optimize cost and speed.

## Future Features

