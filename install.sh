#!/bin/bash
echo "Installing tidalupnp Dependencies"
# If you need to differentiate install for armhf and i386 you can get the variable like this
#DPKG_ARCH=`dpkg --print-architecture`
# Then use it to differentiate your install
DPKG_ARCH=`dpkg --print-architecture`
sudo apt-get update
sudo apt-get -y install dirmngr
gpg --keyserver pool.sks-keyservers.net --recv-key F8E3347256922A8AE767605B7808CE96D38B9201
gpg --export '7808CE96D38B9201' | sudo apt-key add -
if [ "$DPKG_ARCH" = "i386" ]; then
        echo "deb http://www.lesbonscomptes.com/upmpdcli/downloads/debian/ jessie main" | sudo tee -a /etc/apt/sources.list;
        echo "deb-src http://www.lesbonscomptes.com/upmpdcli/downloads/debian/ jessie main" | sudo tee -a /etc/apt/sources.list;
else
        echo "deb http://www.lesbonscomptes.com/upmpdcli/downloads/raspbian/ jessie main" | sudo tee -a /etc/apt/sources.list;
        echo "deb-src http://www.lesbonscomptes.com/upmpdcli/downloads/raspbian/ jessie main" | sudo tee -a /etc/apt/sources.list;
fi
sudo apt-get -y install upmpdcli-tidal --no-install-recommends
sudo cp ./upmpdcli.conf.tmpl0 /volumio/app/plugins/audio_interface/upnp/
sudo chmod 777 /volumio/app/plugins/audio_interface/upnp/upmpdcli.conf.tmpl0
#required to end the plugin install
echo "plugininstallend"