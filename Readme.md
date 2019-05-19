# Shadertoy Exporter

[Download the application for Windows, Mac OS, and Linux.](https://github.com/KoltesDigital/shadertoy-exporter/releases)

Features:

- Fully support Shadertoy as it is embedded in a web view.
- Saves frames directly as PNG images.
- Can generate GIF and MP4 videos using the image sequence.
- Configurable, persisting settings: resolution, FPS, filenames...
- If the clipboard contains a shader URL at startup, opens it directly.

<img src="/Screenshot.jpg?raw=true" alt="Screenshot" width="100%"/>

I used [tdhooper's shadertoy-frame-exporter](https://github.com/tdhooper/shadertoy-frame-exporter) a lot. It's a great tool, but I felt some limitations: downloading lots of images in the browser can be annoying, settings have to be changed every time, and I had to manually convert the images into GIF or MP4 videos. This project solves these problems.

## FFMPEG for GIF and MP4

In order to export either GIF or MP4 videos, FFMPEG must be installed. [Download the package that suits you best](https://ffmpeg.org/download.html) (Windows and Mac OS packages will be downloaded from another site).

For Windows users: In the export settings, locate the `ffmpeg` application. It should be in the *bin* directory within where you unzipped the package. For instance, if you unzipped the package in *C:\\Tools*, the path should look like `C:\Tools\ffmpeg-20191231-a1b2c3-win64-static\bin\ffmpeg.exe`.

For Mac OS users: I don't know the instructions yet, please contact me for helping filling this section.

For Linux and advanced users: the command is also searched in the PATH directories.
