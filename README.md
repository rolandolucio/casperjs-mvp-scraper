# CasperJS MVP Web Scraper
CasperJS web scraping that interact with tab and form

Modify index variables & run
```
Invoke
npm run casper ${nCurrent} ${nStep} ${rndBase} ${rndTop} ${isSubSeq}

Random
npm run casper 20000000 10 1000000 9999999 0

Sequence
npm run casper 20000000 10 0 0 0

Multiples
node multi.js

If need to parse local htmls use parsers where it fit
node parser.group.regex.csv.js

```


AWS EC2's Deploy Instructions
=============================
if you already have the custom AMI go to first boot instructions


Deploy Ubuntu AMI

Login To instance
base storage 16GB cause tmps on caspers on npm folders

`ssh -i aws_key.pem ubuntu@ec2-dns.compute.amazonaws.com`

AWS AMIs Compatible

```
sudo apt-get update -y
sudo apt-get install libc6 libstdc++6 libgcc1 libgtk2.0-0 libasound2 libxrender1 libdbus-glib-1-2 -y
sudo apt-get install python -y
```

install max casperjs firefox version
```
wget https://ftp.mozilla.org/pub/firefox/releases/59.0/linux-x86_64/en-US/firefox-59.0.tar.bz2
tar xvjf firefox-59.0.tar.bz2
sudo apt-mark hold firefox
```

Create app folder
```
mkdir -p app/00
```

Install NodeJS in this case using nvm package
```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

Reload terminal to update and install to required version

```
nvm install node 
```

Add ENV vars to .bashrc at the end of file

```
vi ~/.bashrc
export SLIMERJSLAUNCHER="$HOME/firefox/firefox"
export PHANTOMJS_EXECUTABLE="./node_modules/.bin/slimerjs"
```

Volumes Setup
EFS libs to be availabe to mount later

```
sudo apt-get -y install nfs-common
```

mounting point 

```
sudo mkdir /mnt/efs
sudo chown ubuntu:ubuntu /mnt/efs
sudo chmod 777 /mnt/efs
```

NVM SSD , EBS or volumes

create mounting point
```
sudo mkdir /mnt/nvm
sudo chown ubuntu:ubuntu /mnt/nvm
sudo chmod 777 /mnt/nvm

sudo apt-get -y install linux-aws  
sudo reboot
```
upload app code from local /dont include packages
```
scp -i aws_key.pem -r ~/Documents/telexplorer ubuntu@ec2-dns.compute.amazonaws.com:~/app
```

login back &  customize packinstall

```
mv app/base app/00-replicas
cd app/00-replicas
npm install
```

exit Make AMI image or standalone install continue 


First run after AMI deployed 
===================================================
Add GUI to the Installation (if you do this before creating AWS AMI image for EC2s wont deploy)

```
sudo apt-get upgrade -y
```
Install new grub on EBS
```
sudo apt-get install ubuntu-desktop gnome-panel gnome-settings-daemon metacity nautilus gnome-terminal xfce4 vnc4server -y
```
install and set pass for vnc and replace config

```
vncserver
vi ~/.vnc/xstartup

#!/bin/sh
# Uncomment the following two lines for normal desktop:
unset SESSION_MANAGER
# exec /etc/X11/xinit/xinitrc
unset DBUS_SESSION_BUS_ADDRESS
startxfce4 &
[ -x /etc/vnc/xstartup ] && exec /etc/vnc/xstartup
[ -r $HOME/.Xresources ] && xrdb $HOME/.Xresources
xsetroot -solid grey
vncconfig -iconic &
gnome-panel &
gnome-settings-daemon &
metacity &
nautilus &
gnome-terminal &
```

mount EFS & check
```
sudo mount -t nfs -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport fs-id.efs.region.amazonaws.com:/ /mnt/efs
ls /mnt/efs/
```

define proper disk to use, depending on the type of ec2 could be efimeral or ebs 
use the proper one not partitioned
i.e.
nvme0n1     259:1    0 139.7G  0 disk 
nvme1n1     259:2    0 279.4G  0 disk 
```
lsblk
```

Configure disk USE proper name 
file sys and mount
```
sudo mkfs.ext4 -E nodiscard /dev/nvme0n1
sudo mount -o discard /dev/nvme0n1 /mnt/nvm
// lets check all is mounted
df -h
```

want to add to boot sequence lets extract ids
```
sudo blkid
```

i.e.
/dev/nvme0n1: UUID="8d1d3d75-3626-40e3-970a-40d8f6936c29" TYPE="ext4"

add to /etc/stab
```
sudo vi /etc/fstab
```

`UUID=<UUID> /mnt/nvm ext4 defaults 0 0`

UUID=8d1d3d75-3626-40e3-970a-40d8f6936c29 /mnt/nvm ext4 defaults 0 0


```
// permissions
sudo chown ubuntu:ubuntu /mnt/nvm & sudo chmod 777 /mnt/nvm

//Create Specific app folders

mkdir /mnt/nvm/raw /mnt/nvm/captures /mnt/nvm/results /mnt/nvm/tpl1 /mnt/nvm/error /mnt/nvm/uk
```

Reload ssh to run VNC 
if your Security group allows can connect direct to ip, or set ssh port fowarding
```
ssh -L 5902:localhost:5902 -i aws_key.pem ubuntu@ec2-dns.amazonaws.com
```
```
vncserver
vncserver -geometry 1340x750
```
try connecting with vncviewer



Done!


ON EC2 Reboots
================================ 
On each restart need to mount back EFS  ssh machine and start vnc  and or ephimeral disks
```
vncserver
vncserver -geometry 1340x750
sudo mount -t nfs -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport fs-id.efs.region.amazonaws.com:/ /mnt/efs
```

