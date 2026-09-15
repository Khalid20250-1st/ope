#!/bin/zsh
# Three runs with OPE added as files (AGENTS.md, CLAUDE.md, ope-system/).
work=${1:-/private/tmp/ope-bench/runs}
here=${0:a:h}
node "$here/run.mjs" files 1 "$work" &
node "$here/run.mjs" files 2 "$work" &
wait
node "$here/run.mjs" files 3 "$work"
echo files done
