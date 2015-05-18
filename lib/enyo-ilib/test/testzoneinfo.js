/*
 * testzoneinfo.js - test the zoneinfo object
 *
 * Copyright © 2014, JEDLSoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function testZoneInfoFileConstructor() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");

    assertNotNull(zif);
}

function testZoneInfoFileConstructorBadFile() {
	try {
	    var zif = new ZoneInfoFile("/usr/share/zoneinfo/foobar");
	    assertFalse(true);
	} catch (e) {
		assertTrue(true);
	}
}

function testZoneInfoFileConstructor2() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/Los_Angeles");

    assertNotNull(zif);
}

function testZoneInfoBsearch() {
	var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");
    var array = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    
    assertEquals(4, zif.bsearch(10, array));
}

function testZoneInfoBsearchEmptyArray() {
	var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");
    var array = [];
    
    assertEquals(-1, zif.bsearch(10, array));
}

function testZoneInfoBsearchUndefinedArray() {
	var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");
    assertEquals(-1, zif.bsearch(10, undefined));
}

function testZoneInfoBsearchUndefinedTarget() {
	var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");
    var array = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    
    assertEquals(-1, zif.bsearch(undefined, array));
}

function testZoneInfoBsearchBefore() {
	var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");
    var array = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    
    assertEquals(-1, zif.bsearch(0, array));
}

function testZoneInfoBsearchAfter() {
	var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");
    var array = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    
    assertEquals(9, zif.bsearch(20, array));
}

function testZoneInfoBsearchExact() {
	var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");
    var array = [0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    
    // place it right after the exact match
    assertEquals(0, zif.bsearch(0, array));
}

function testZoneInfoBsearchExactEnd() {
	var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");
    var array = [0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    
    // place it right after the exact match
    assertEquals(10, zif.bsearch(19, array));
}

function testZoneInfoBsearchMonthEdge() {
	var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");
    var array = [0,31,60,91,121,152,182,213,244,274,305,335,366];
    
    assertEquals(6, zif.bsearch(182, array));
}

function testZoneInfoFileGetOffsetNone() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");

    assertNotNull(zif);

    assertEquals(0, zif.getRawOffset(2014));
}

function testZoneInfoFileGetOffsetWest() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/Los_Angeles");

    assertNotNull(zif);

    assertEquals(-480, zif.getRawOffset(2014));
}

function testZoneInfoFileGetOffsetEastNoDST() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/Australia/Perth");

    assertNotNull(zif);

    assertEquals(480, zif.getRawOffset(2014));
}

function testZoneInfoFileGetOffsetEastWithDST() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/Australia/Sydney");

    assertNotNull(zif);

    assertEquals(600, zif.getRawOffset(2014));
}

function testZoneInfoFileUsesDSTWest() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/Phoenix");

    assertNotNull(zif);
    
    assertFalse(zif.usesDST(2014));
}

function testZoneInfoFileUsesDSTTrue() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/Europe/Berlin");

    assertNotNull(zif);

    assertTrue(zif.usesDST(2014));
}

function testZoneInfoFileUsesDSTFalseEast() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/Asia/Shanghai");

    assertNotNull(zif);

    assertFalse(zif.usesDST(2014));
}

function testZoneInfoFileGetDSTSavings() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/New_York");

    assertNotNull(zif);

    assertEquals(60, zif.getDSTSavings(2014));
}

function testZoneInfoFileGetDSTSavingsOdd() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/Australia/Lord_Howe");

    assertNotNull(zif);

    assertEquals(30, zif.getDSTSavings(2014));
}

function testZoneInfoFileGetDSTSavingsNone() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/Phoenix");

    assertNotNull(zif);

    assertEquals(0, zif.getDSTSavings(2014));
}

function testZoneInfoFileGetDSTStartDateNorthernHemisphere() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/Los_Angeles");

    assertNotNull(zif);

    // unix time of March 9, 2014 2:00am PST -> 3:00am PDT
    assertEquals(1394359200000, zif.getDSTStartDate(2014));
}

function testZoneInfoFileGetDSTEndDateNorthernHemisphere() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/Los_Angeles");

    assertNotNull(zif);

    // unix time of Nov 2, 2014 2:00am PDT -> 1:00am PST
    assertEquals(1414918800000, zif.getDSTEndDate(2014));
}

function testZoneInfoFileGetDSTStartDateSouthernHemisphere() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/Australia/Sydney");

    assertNotNull(zif);

    // unix time of Oct 5, 2014 2:00am EST -> 3:00am EDT
    assertEquals(1412438400000, zif.getDSTStartDate(2014));
}

function testZoneInfoFileGetDSTEndDateSouthernHemisphere() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/Australia/Sydney");

    assertNotNull(zif);

    // unix time of Apr 6, 2014 3:00am EDT -> 2:00am EST
    assertEquals(1396713600000, zif.getDSTEndDate(2014));
}

function testZoneInfoFileGetDSTStartDateNone() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/Phoenix");

    assertNotNull(zif);

    // no DST in Arizona
    assertEquals(-1, zif.getDSTStartDate(2014));
}

function testZoneInfoFileGetDSTEndDateNone() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/Phoenix");

    assertNotNull(zif);

    // no DST in Arizona
    assertEquals(-1, zif.getDSTEndDate(2014));
}

function testZoneInfoFileGetAbbreviationSimple() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");

    assertNotNull(zif);

    // no DST in UTC
    assertEquals("UTC", zif.getAbbreviation(2014));
}

function testZoneInfoFileGetAbbreviationNoDST() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/Phoenix");

    assertNotNull(zif);

    // no DST in Arizona
    assertEquals("MST", zif.getAbbreviation(2014));
}

function testZoneInfoFileGetDSTAbbreviationNoDST() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/Phoenix");

    assertNotNull(zif);

    // no DST in Arizona
    assertEquals("MST", zif.getDSTAbbreviation(2014));
}

function testZoneInfoFileGetAbbreviationWithDST() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/Los_Angeles");

    assertNotNull(zif);

    // standard time
    assertEquals("PST", zif.getAbbreviation(2014));
}

function testZoneInfoFileGetDSTAbbreviationWithDST() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/Los_Angeles");

    assertNotNull(zif);

    // standard time
    assertEquals("PDT", zif.getDSTAbbreviation(2014));
}

function testZoneInfoFileGetDSTAbbreviationSimple() {
    var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");

    assertNotNull(zif);

    // no DST in UTC
    assertEquals("UTC", zif.getDSTAbbreviation(2014));
}

function testZoneInfoGetIlibFormatSimpleZone() {
	var zif = new ZoneInfoFile("/usr/share/zoneinfo/Etc/UTC");
    
	var info = {
		"o": "0:0",
		"f": "UTC"
	};
    assertObjectEquals(info, zif.getIlibZoneInfo(2014));
}

function testZoneInfoGetIlibFormatComplexZone() {
	var zif = new ZoneInfoFile("/usr/share/zoneinfo/America/Los_Angeles");
    
	var info = {
		"o": "-8:0",
		"f": "{c}",
		"s": {
			"c": "PDT",
			"j": 2456725.9166666665,
			"v": "1:0"
		},
		"e": {
			"c": "PST",
			"j": 2456963.875
		}
	};
    assertObjectEquals(info, zif.getIlibZoneInfo(2014));
}

function testZoneInfoGetIlibFormatSouthernHemisphere() {
	var zif = new ZoneInfoFile("/usr/share/zoneinfo/Australia/Sydney");
    
	var info = {
		"o": "10:0",
		"f": "{c}",
		"s": {
			"c": "EST",
			"j": 2456935.1666666665, // Oct 5, 2014 2:00am
			"v": "1:0"
		},
		"e": {
			"c": "EST",
			"j": 2456753.1666666665 // Apr 6, 2014 3:00am
		}
	};
    assertObjectEquals(info, zif.getIlibZoneInfo(2014));
}
