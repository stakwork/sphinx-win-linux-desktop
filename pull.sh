

#!/bin/sh

adb -d shell "run-as com.sphinx cat /data/data/com.sphinx/cache/$1" > $1

# adb shell "run-as com.sphinx cat '/data/data/com.sphinx/cache/$1' > '/sdcard/$1'"
# sleep 10
# adb pull "/sdcard/$1"
# adb shell "rm '/sdcard/$1'"