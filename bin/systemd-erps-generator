#!/bin/sh

# This systemd.generator detects if erps.service is running

PATH=/usr/sbin:$PATH
unitdir=/usr/lib/systemd/system

# If invoked with no arguments (for testing) write to /tmp.
earlydir="/tmp"

if [ -n "$2" ]; then
    earlydir="$2"
fi

set_target ()
{
    ln -sf "$unitdir/erps.service" "$earlydir/default.target"
}

#if selinuxenabled; then
#    if test -f /.autorelabel; then
#        set_target
#    elif grep -sqE "\bautorelabel\b" /proc/cmdline; then
#        set_target
#    fi
#fi
