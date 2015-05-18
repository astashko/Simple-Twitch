/* jshint node: true */
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var async = require('async');

var help = "USAGE: bootplate.sh/bat command [command-options]\n\n" +
	"  commands:\n\n" +
	"    init [remote-url]\n" +
	"      Pushes this project into a new repository, with submodules pointing\n" +
	"      to the original server.\n" +
	"      remote-url: URL of new repository to push into\n\n" +
	"    update\n" +
	"      Updates all submodules to the head of the 'pilot' branch.\n";

var cmds = {
	help: function() {
		console.log(help);
	},
	init: function(remote) {
		if (!remote) {
			console.error("You must specify a remote repository URL to duplifork to.");
			console.error(help);
			process.exit(1);
		}
		var username, email;
		async.series([
			// Checkout pilot branch of all submodules
			function(callback) {
				exec("git submodule foreach git checkout pilot", function(err, data) {
					if (err) { return callback(err); }
					if (data) { console.log(data); }
				});
				callback();
			},
			// Make sure we're on the head of pilot
			function(callback) {
				exec("git submodule foreach git pull origin pilot", function(err, data) {
					if (err) { return callback(err); }
					if (data) { console.log(data); }
				});
				callback();
			},
			// Re-write relative submodule URL's in .gitmodules to target the server this bootplate was cloned from
			function(callback) {
				exec("git config --get remote.origin.url", function(err, data) {
					if (err) { return callback(err); }
					var origin = path.dirname(data) + "/";
					data = fs.readFileSync(".gitmodules", "utf8");
					data = data.replace(new RegExp("(url\\ ?=\\ ?)\\.\\.\/", "g"), "$1" + origin);
					fs.writeFileSync(".gitmodules", data);
					callback();
				});
			},
			// Commit change to .gitmodules
			function(callback) {
				exec("git commit -a -m \"Re-target submodules.\"", function(err, data) {
					//if (err) return callback(err);
					if (data) { console.log(data); }
					callback();
				});
			},
			// Read git user name
			function(callback) {
				exec("git config --get user.name", function(err, data) {
					if (err) { return callback(err); }
					username = data.trim();
					if (!username) {
						return callback(new Error("Your .git/config has no user.name set; this must be set correctly in order to duplifork."));
					}
					callback();
				});
			},
			// Read git user email
			function(callback) {
				exec("git config --get user.email", function(err, data) {
					if (err) { return callback(err); }
					email = data.trim();
					if (!email) {
						return callback(new Error("Your .git/config has no user.email set; this must be set correctly in order to duplifork."));
					}
					callback();
				});
			},
			// Shady: re-write history so all commits are authored by current user
			// (Required to push into gerrit, since it only accepts commits by the current user)
			function(callback) {
				exec("git filter-branch -f --env-filter \"GIT_AUTHOR_NAME='" + username + "'; GIT_AUTHOR_EMAIL='" + email + "'; GIT_COMMITER_NAME='" + username + "'; GIT_COMMITTER_EMAIL='" + email + "';\" HEAD", function(err, data) {
					if (err) { return callback(err); }
					if (data) { console.log(data); }
					username = data;
					callback();
				});
			},
			// Sync submodules
			function(callback) {
				exec("git submodule sync", function(err, data) {
					if (err) { return callback(err); }
					if (data) { console.log(data); }
					callback();
				});
			},
			// Set origin to new remote
			function(callback) {
				exec("git remote set-url origin " + remote, function(err, data) {
					if (err) { return callback(err); }
					if (data) { console.log(data); }
					callback();
				});
			},
			// Push the repo to the new remote origin
			function(callback) {
				exec("git push origin master", function(err, data) {
					if (err) { return callback(err); }
					if (data) { console.log(data); }
					callback();
				});
			},
			// Done
			function(callback) {
				console.log("Success!");
			}
		], function(err) {
			if (err) {
				console.error("An error occurred: " + err);
				process.exit(1);
			}
		});
	},
	update: function() {
		exec("git submodule foreach git pull origin pilot", function(err, data) {
			if (err) {
				console.error("An error occurred: " + err);
				process.exit(1);
			}
			if (data) { console.log(data); }
			console.log("Success!");
		});
	}
};

var args = process.argv.slice(2);
var cmd = args.shift();
if (cmds[cmd]) {
	cmds[cmd].apply(this, args);
} else {
	console.error("Command '" + cmd + "' not valid.");
	cmds.help();
}