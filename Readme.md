# Shadertoy Exporter

[Download the application for Windows, Mac OS X, and Linux.](https://github.com/KoltesDigital/shadertoy-exporter/releases)

Features:

- Fully support Shadertoy as it is embedded in a web view.
- Saves frames directly as PNG images.
- Can generate GIF and MP4 videos using the image sequence.
- Configurable, persisting settings: resolution, FPS, filenames...
- If the clipboard contains a shader URL at startup, opens it directly.

<img src="/Screenshot.jpg?raw=true" alt="Screenshot" width="100%"/>

I used [tdhooper's shadertoy-frame-exporter](https://github.com/tdhooper/shadertoy-frame-exporter) a lot. It's a great tool, but I felt some limitations: downloading lots of images in the browser can be annoying, settings have to be changed every time, and I had to manually convert the images into GIF or MP4 videos. This project solves these problems.
