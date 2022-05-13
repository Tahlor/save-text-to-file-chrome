source="/home/taylor/Downloads/"
destination="/home/taylor/shares/pi3/Flash128/Downloads/Politics/National Review/"
pi3_local_destination="~/Flash128"
HOME_DOMAIN="fife.asuscomm.com"

pi3_unmount="sudo umount -f -l /home/${USER}/shares/pi3"
pi3_mount="/usr/bin/sshfs -p 57321 -o reconnect,umask=0000,allow_other,nonempty,IdentityFile=~/.ssh/id_rsa  pi@${HOME_DOMAIN}:/home/pi /home/${USER}/shares/pi3"

connect_to_pi3="ssh -t pi@$HOME_DOMAIN -p 57321 mountpoint $pi3_local_destination"

#$pi3_unmount
#$pi3_mount

if df -P -T "$destination" | tail -n +2 | awk '{print $2}' | grep 'cifs\|fuse'; then # are we connected to the network drive
    echo "we are connected!"
    if $connect_to_pi3 | grep "is a mountpoint"; then  # is network drive mounted
        echo "drive is mounted!"

        rsync -vurlt --size-only "$source" "$destination" --include=NR_AUDIO*.mp3 --exclude=* --info=progress >> ./logs/pi3_sync.log

        # v: verbose
        # u: update - only update when size/time is mismatched/newer
        # r: recursive
        # l: copy symlinks
        # t: preserve modification times
        # --size-only - only use size
        # --modify-window=3660 - modified times can be off this much; TIMEZONE ISSUES SOMEHOW!!
    fi
fi
