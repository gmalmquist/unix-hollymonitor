# unix-hollymonitor
Hollywood movie-style unix server monitoring interface, with both functional and non-functional graphical elements.

# Installation
unix-hollymonitor should be installed on the unix system to be monitored. 
The system in question must have a web server (such as apache).

To install on a webserver, after cloning the repo, run:

`./build install=/path/to/web/dir`

Eg, on a typical apache server, you might run

`./build install=/var/www/html`

The files in `src/cgi` should be installed to a directory that supports executing cgi-scripts.

# Requirements
The following executables are required to be on the system path: mpstat, ps, sensors, git, python
