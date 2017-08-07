# Shadertoy Exporter

I used [tdhooper's shadertoy-frame-exporter](https://github.com/tdhooper/shadertoy-frame-exporter) a lot. It's a great tool, but I felt some limitations: downloading lots of images in the browser can be annoying, settings have to be changed every time, and I had to manually convert the images into GIF or MP4 videos.

This project solves these problems. It is a desktop application based on [electron](https://electron.atom.io/) so it can save images directly, convert them automatically to GIF or MP4 videos, and save the settings.

## From source

	git clone https://github.com/KoltesDigital/shadertoy-exporter
	cd shadertoy-exporter
	npm i
	npm run jspmi
	npm start
