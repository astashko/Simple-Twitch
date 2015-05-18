enyo-ilib
=========

Enyo and nodejs wrapper for ilib globalization/internationalization library.

Both Enyo and nodejs wrappers define the $L function used to wrap localizable
strings and perform translations.

enyo-ilib is licensed under the Apache 2.0 open source license.  See
LICENSE-2.0.txt in this folder for details.

This work is based on the Apache-2.0 licensed [iLib](http://sourceforge.net/projects/i18nlib/)
from [JEDLsoft](http://jedlsoft.com/index.html).

Enyo
----

To use this in an Enyo application, put this library in your Enyo libs
directory, then edit your package.js:

    enyo.depends(
        "$lib/enyo-ilib",
	<rest of your dependencies>
    );

Now the "ilib" namespace is available to use in your app.

If you want the core (resources and string translation) or full versions, you should instead use

    enyo.depends(
        "$lib/enyo-ilib/core-package.js",
	<rest of your dependencies>
    );

or

    enyo.depends(
        "$lib/enyo-ilib/full-package.js",
	<rest of your dependencies>
    );


nodejs
------

To use this under nodejs, check out this module under your nodejs app/service. Then, in your js, do:

    var ilibmodule = require("./enyo-ilib");
    var ilib = ilibmodule.ilib;
    var $L = ilibmodule.$L;

Now the ilib namespace is available to use as normal.
