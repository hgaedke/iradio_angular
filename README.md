# iradio_angular
Internet radio website based on Angular2.
Related project for pure Javascript / HTML: https://github.com/hgaedke/iradio_js .

This readme file contains a how-to for Windows as well as for Rasbian (running on Raspberry Pi).

# How-to for Windows
![Screenshot of the internet radio app in Firefox browser on Windows.](/../main/docs/iradio_home_windows.png)

## Internet Radio: Install, build, run
* Make sure you have NodeJS >= v18 and npm installed.
* Make sure you have a webserver installed. E.g. use http-server (use version 13 to prevent incompatibilities with certain npm versions):  
        `npm install --global http-server@13`
* Clone the repository. We assume here you clone it to "c:\iradio_angular".
* Collect the dependencies via  
        `npm install`
* Build as single-page application (i.e. create "c:\iradio_angular\dist\iradio\browser") with  
        `npm build`
* Use your webserver to serve "c:\iradio_angular\dist\iradio\browser", in case of http-server:  
        `http-server c:\iradio_angular\dist\iradio\browser`
* Open "http://localhost:8080" in your local browser.
* Click one of the radio station buttons and listen to the music.
* To adjust the radio stations to use and the background colors, edit "c:\iradio_angular\iradio\src\app\shared\app-radio-stations.ts" and rebuild.

## Use the local music and video playback
In addition to the previous steps:
* Copy MP3 music files of your choice to the music folder, where each music file needs to be located in an album directory, e.g.  
        `c:\iradio_js\music\my_album\my_music.mp3`  
You can have multiple files per album and multiple albums as well.
* Copy video files (.mp4) of your choice to folder  
        `c:\iradio_js\video`  
* Start the media server by going to the servers/media_server subdirectory and running  
        `node app.js "c:/iradio_js/music" "c:/iradio_js/video"`  
where "c:/iradio_js/music" is used as global music directory and "c:/iradio_js/video" is used as global video directory in this example.
* Open "http://localhost:8080" in your local browser.
* Click on the flash button in the left toolbar to show your music albums. Click on an album to enter it and to play the music inside.
* Click on the play button in the left toolbar to show your videos. Use the HTML media controls to start/stop a video. Scroll down to see the other videos.

## Use the command server for remote-controlling
In addition to the previous steps:
* Start the command server by going to the servers/command_server subdirectory and running  
        `node app.js`  
This will establish a small server app which connects to the Angular frontend of the internet radio on port 8082, and to some available mobile device on port 8081. You can then use the mobile device to remote-control the internet radio. Supported commands are: 
    * `{"notification": "This is a test notification"}` => Shows the given string for some seconds on the internet radio screen.
    * `{"app": "radio1" | "radio2" | "music" | "video"}` => Switches to the given app.
    * `{"radio1_station": 0..5}` => Switches the radio station of the radio1 app to the given station number.
    * `{"radio2_station": 0..5}` => Switches the radio station of the radio2 app to the given station number.
    * `{"music": "playNextFile"}` => If the music app is active and a file is currently played, switch to the next file.
    * `{"status": "get"}` => Request the current internet radio status. The internet radio will then send a IRStatus data package.
* IRStatus packages come in this (self-explaining) format:  
        `{`  
        `  "app": "radio1" | "radio2" | "music" | "video",`  
        `  "radio1_station": 0..5,`  
        `  "radio2_station": 0..5,`  
        `  "music": {`  
        `    "viewMode": "VIEW_MODE_FOLDER" | "VIEW_MODE_PLAYBACK",`  
        `    "albumName": string,`  
        `    "currentSongName": string,`  
        `  },`  
        `  "video": {`  
        `    "dummy": string` (not yet implemented)  
        `  }`  
        `}`


# How-to for Rasbian
This assumes that you have a Raspberry Pi with Rasbian OS and a touch screen attached, and that you use username "pi".

## Install, run
* Make sure you have NodeJS >= v18 and npm installed.
* Make sure you have a webserver installed. You can e.g. use http-server (use version 13 to prevent incompatibilities with certain npm versions):  
        `npm install --global http-server@13`
* Clone and build the repository on a desktop machine as described above for Windows. We assume here you have afterwards copied the built contents of folder "c:\iradio_angular\dist\iradio\browser" to "/home/pi/Desktop/iradio_angular".
* Use your webserver to serve "/home/pi/Desktop/iradio_angular"; in case of http-server:  
        `http-server /home/pi/Desktop/iradio_angular`
* Open "http://localhost:8080" in your local browser.
* Click one of the radio station buttons and listen to the music.
* See above notes for Windows on how to adjust the radio stations to use and the background colors.
* Chromium-browser:
    * To enable the auto-play feature, i.e. to playback internet radio music without the user clicking somewhere beforehand, use this start option:  
        `--autoplay-policy=no-user-gesture-required`
    * For fullscreen display, use this start option:  
        `--start-fullscreen`
    * As you typically don't need any user-specific settings, use this start option:  
        `--incognito`
    * Full command line:  
        `chromium-browser --start-fullscreen --incognito --autoplay-policy=no-user-gesture-required http://localhost:8080`
* To show the internet radio on startup of your Raspberry Pi, add the following to "/etc/xdg/lxsession/LXDE-pi/autostart":  
        `@http-server /home/pi/Desktop/iradio_angular`  
        `@chromium-browser --start-fullscreen --incognito --autoplay-policy=no-user-gesture-required http://localhost:8080`  

## Install and use the local music and video playback in addition
In addition to the previous steps:
* Copy MP3 music files of your choice to folder "/music", where each music file needs to be located in an album directory, e.g. "/music/my_album/my_music.mp3". You can have multiple files per album and multiple albums as well.
* Copy video files (.mp4) of your choice to folder "/video".
* Have the MediaServer started automatically on login by adding this line to "/etc/xdg/lxsession/LXDE-pi/autostart":  
        `@node /home/pi/Desktop/iradio_angular/servers/media_server/app.js /music /video`
    * The full iradio-related content of "/etc/xdg/lxsession/LXDE-pi/autostart" then is:  
        `@node /home/pi/Desktop/iradio_angular/server/media_server/app.js /music /video`  
        `@http-server /home/pi/Desktop/iradio_angular`  
        `@chromium-browser --start-fullscreen --incognito --autoplay-policy=no-user-gesture-required http://localhost:8080`
* Restart your Raspberry.
* Click on the flash button in the left toolbar to show your music albums. Click on an album to enter it and to play the music inside.
* Click on the play button in the left toolbar to show your videos. Use the HTML media controls to start/stop a video. Scroll down to see the other videos.

## Use the command server for remote-controlling
See the explanation for Windows above to get informed about the features and communication protocol.

To start the command_server on Rasbian, call  
        `node /home/pi/Desktop/iradio_angular/command_server/app.js`

Don't forget to copy the servers/shared folder to the Raspberry as well.

To have the command server started on startup, add the following to "/etc/xdg/lxsession/LXDE-pi/autostart":  
        `@node /home/pi/Desktop/iradio_angular/command_server/app.js`