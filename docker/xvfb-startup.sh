#!/bin/bash
set -e
Xvfb :99 -ac -screen 0 1920x1080x24 -nolisten tcp >/dev/null 2>&1 &
XVFB_PID=$!
trap 'kill $XVFB_PID 2>/dev/null' EXIT
export DISPLAY=:99
exec "$@"
