# unix-hollymonitor
Hollywood movie-style unix server monitoring interface, with both functional and non-functional graphical elements.

![Screenshots](https://cloud.githubusercontent.com/assets/3391199/6630086/3cace91a-c8eb-11e4-950b-5adaf4c4f4df.png)

# Features
* CPU usage line plots
* Temperature bar graphs
* Stream of running processes as vertical text
* Cube colored according to highest core temperature
* Cube rotation speed proportional to average CPU usage
* Completely irrelevant source code scrolling in background

Future features include easily configuring what source file scrolls in the background (currently this can be changed by editing a line in status.html).

# Installation
unix-hollymonitor should be installed on the unix system to be monitored. 
The system in question must have a web server (such as apache).

To install on a webserver, after cloning the repo, run:

`./build install=/path/to/web/dir`

Eg, on a typical apache server, you might run

`./build install=/var/www/html`

The files in `src/cgi` should be installed to a directory that supports executing cgi-scripts.

# Requirements
The following executables are required to be on the system path: 
* mpstat
* ps
* sensors
* git
* python
