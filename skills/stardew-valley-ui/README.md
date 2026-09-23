# stardew-valley-ui skill

An installable knowledge package for agents that support `SKILL.md`, including Codex,
Claude Code, Cursor, and compatible coding agents. It teaches an agent how to integrate
the `stardew-valley-ui` React component library without guessing its public API or losing
its original pixel-art design language.

## Install

```bash
# From this public repository (recommended)
skills add a985987819/stardewUi
```

Or copy the `skills/stardew-valley-ui/` directory into the skills location recognized by
your agent. The exact target directory is agent-specific; project-scoped installation is
preferable when all contributors should share the same UI guidance.

## Layout

```text
stardew-valley-ui/
├── SKILL.md                         # trigger description, visual rules and workflow
├── README.md                        # human-facing installation notes
└── references/
    ├── react-project.md             # installation, styles, SSR and validation
    └── component-catalog.md         # public component families and selection guide
```

The skill contains documentation, not executable application code. An agent loads it only
when the task matches its `description`, then follows the scenario links it needs.

## License

This skill documents a project under the StardewValley UI Non-Commercial License. It does
not grant commercial-use rights or rights to Stardew Valley names, trademarks, characters,
music, or artwork. See the repository [LICENSE](../../LICENSE).
