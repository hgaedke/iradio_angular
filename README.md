# iradio_angular
Internet radio website based on Angular2.
Related project for pure Javascript / HTML: https://github.com/hgaedke/iradio_js

This readme file contains a how-to for Windows as well as for Rasbian (running on Raspberry PI).

# How-to for Windows
![Screenshot of the internet radio app in Firefox browser on Windows.](/../main/docs/iradio_home_windows.png)

## Install, build, run
* Make sure you have npm installed.
* Make sure you have a webserver installed. E.g. use http-server (use version 13 to prevent incompatibilities with certain npm versions):
        ```
        npm install --global http-server@13
        ```
* Clone the repository. We assume here you clone it to "c:\iradio_angular".
* Build as single-page application (i.e. create "c:\iradio_angular\dist\iradio\browser") with
        npm build
* Use your webserver to serve "c:\iradio_angular\dist\iradio\browser", in case of http-server:
        http-server c:\iradio_angular\dist\iradio\browser
* Open "http://localhost:8080" in your local browser.
* Click one of the radio station buttons and listen to the music.
* To adjust the radio stations to use and the background colors, edit "c:\iradio_angular\iradio\src\app\shared\app-radio-stations.ts" and rebuild.


# How-to for Rasbian
This assumes that you have a Raspberry PI with Rasbian OS and a touch screen attached, and that you use username "pi".

## Install, run
* Make sure you have npm installed.
* Make sure you have a webserver installed. E.g. use http-server (use version 13 to prevent incompatibilities with certain npm versions):
        npm install --global http-server@13
* Clone and build the repository on a desktop machine as described above for Windows. We assume here you have afterwards copied the built contents of folder "c:\iradio_angular\dist\iradio\browser" to "/home/pi/Desktop/iradio_angular".
* Use your webserver to serve "/home/pi/Desktop/iradio_angular"; in case of http-server:
        http-server /home/pi/Desktop/iradio_angular
* Open "http://localhost:8080" in your local browser.
* Click one of the radio station buttons and listen to the music.
* See above notes for Windows on how to adjust the radio stations to use and the background colors.
* Chromium-browser:
    * To enable the auto-play feature, i.e. to playback internet radio music without the user clicking somewhere beforehand, use this start option:
        --autoplay-policy=no-user-gesture-required
    * For fullscreen display, use this start option:
        --start-fullscreen
    * As you typically don't need any user-specific settings, use this start option:
        --incognito
    * Full command line:
        chromium-browser --start-fullscreen --incognito --autoplay-policy=no-user-gesture-required http://localhost:8080
* To show the internet radio on startup of your Raspberry Pi, add the following to "/etc/xdg/lxsession/LXDE-pi/autostart":
        @http-server /home/pi/Desktop/iradio_angular
        @chromium-browser --start-fullscreen --incognito --autoplay-policy=no-user-gesture-required http://localhost:8080