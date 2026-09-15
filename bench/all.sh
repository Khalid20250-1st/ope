#!/bin/zsh
# Three rounds, each one OPE run and one plain run side by side.
work=${1:-/private/tmp/ope-bench/runs}
mkdir -p "$work"
here=${0:a:h}
for i in 1 2 3; do
  node "$here/run.mjs" ope $i "$work" &
  node "$here/run.mjs" plain $i "$work" &
  wait
done
echo all done
