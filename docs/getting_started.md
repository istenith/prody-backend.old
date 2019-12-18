TECHONOGIES
---
## pug
Python based indentation way to easily consvert to htmal with same tags

## less
Object oriented way of writing CSS, gets converted to CSS
SETUP
---
Install all node packages
```
$ ./npm_global_installs.sh
```

This would install global packages namely `pug, less, live-server`

BUILD
---
On `master` branch of the project run
```
$ ./build.sh -w
```
This will create a directory `site/public` in project folder.

**Note:** This is listener script and once your run it go ahead making changes.

To kill press `ctrl + C`

BACKEND SETUP GUIDE
---
On `master` branch of the project inside `site` directory run
```
$ npm install
```
this will install all the necessary packages for backend development
however this does not install the database service we are using which is `MongoDB`

To install MongoDB follow the instruction on the following link

https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04

after installation on MongoDB run the following command
```
$ sudo systemctl start mongodb
```

now all the necessary packages are installed to start running the website on the `localhost` run the following command in the `site` directory
```
$ npm start
```
this will start serving the website on the local host of your computer at `port:3000` you can access the website by typing the following address to your browser
`localhost:3000`
this is a listener script so you can make changes to your code and just save it to restart the server

the entry point for backend server is the file `app.js`

Test for features and bugs then push the changes.

CONTRIBUTION
---
Due to bug inducing workflow experienced in the past. The workflow adopted seems to be conservative but is necessary.
There are two branches of the project `master` and `gh-pages`. `master` is the main development branch where all the latest code exists. `gh-pages` branch is marked to be hosted by github and only thoroughly tested builds should be commited here.

All developers should volunteer to test the builds before updates to `gh-pages` branch.

Try to write most expressive code and avoid repetition.
