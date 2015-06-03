<?php

if (!array_key_exists("channel", $_GET)) {
	die(0);
}

$quality = array_key_exists("quality", $_GET) ? $_GET["quality"] : "chunked";

$accessTokenUrl = "https://api.twitch.tv/api/channels/" . $_GET["channel"] . "/access_token";
$accessToken = json_decode(file_get_contents($accessTokenUrl));
$playlistUrl = "http://usher.twitch.tv/api/channel/hls/" . $_GET["channel"] . ".m3u8?player=twitchweb&token=" . $accessToken->token . "&sig=" . $accessToken->sig . "&allow_audio_only=true&allow_source=true&type=any&p=1";

$playlist = file_get_contents($playlistUrl);
$playlistLines = explode("\n", $playlist);

$videoLineIndex = -1;
foreach ($playlistLines as $key => $value) {
	if (strpos($value,'VIDEO="' . $quality) !== false) {
		$videoLineIndex = $key;
	}
}

if ($videoLineIndex < 2) {
	die(0);
}

$resultPlaylist[] = $playlistLines[0];
$resultPlaylist[] = $playlistLines[1];
$resultPlaylist[] = $playlistLines[$videoLineIndex-1];
$resultPlaylist[] = $playlistLines[$videoLineIndex];
$resultPlaylist[] = $playlistLines[$videoLineIndex+1];

header('Content-Type: application/vnd.apple.mpegurl');

echo implode("\n", $resultPlaylist);
?>