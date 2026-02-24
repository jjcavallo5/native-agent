#!/bin/bash

# Gets latest device name
device=$($ANDROID_HOME/cmdline-tools/latest/bin/avdmanager list avd | grep Name | tail -n 1 | sed 's/Name\: / /g' | sed 's/[[:space:]]//g')

# Opens that device with emulator cmd
$ANDROID_HOME/emulator/emulator -avd $device
