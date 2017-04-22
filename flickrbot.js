var env = require('node-env-file');
env(__dirname + '/miles.env');

var SlackBot = require('slackbots');
var Flickr = require('flickrapi'), 
  flickrOptions = {
    api_key: process.env.flickrtoken, 
    secret: process.env.flickrsecret
  };
var fli = null;
Flickr.tokenOnly(flickrOptions, function(error, flickr) {
  fli = flickr
});

var bot = new SlackBot({
  token: process.env.slacktoken,
  name: 'flickrbot'
});

var myId = '';

bot.on('message', function (data) {

  if (data.type == 'hello') {
    bot.getUser('flickrbot').then(function(data) { myId = data.id; } );
  }

  if (messageIsForMe(data)) {
    handleMessage(data);
  }

});

function messageIsForMe(data) {
  if (isRollCall(data)) {
    return true;
  }

  if (data.type != undefined && data.type == 'message' 
      && (data.text.includes(myId) || data.text.includes('flickrbot'))) {
    return true;
  }

  return false; 
}

function handleMessage(data) {
  if (isRollCall(data)) {
    postTextToChannel("Present!", data.channel);
  } else if (data.text.includes("show me")) {
    showThings(data.text, data.channel);
  }
}

function showThings(thingText, channel) {
  var startCut = thingText.indexOf("show me");
  var searchString = thingText.substring(startCut + 8);

  fli.photos.search({
    page:1,
    per_page:100,
    text: searchString
  }, function(err, result) {
    if (result != null && result.photos != null && result.photos.photo != null) {
      var p = result.photos.photo[Math.floor(Math.random() * result.photos.photo.length)];
      var url = "https://farm" + p.farm + ".staticflickr.com/" + p.server + "/" + p.id + "_" + p.secret + "_b.jpg"
      postTextToChannel(url, channel);
    }
  });
}

function postTextToChannel(text, channel) {
  bot.postMessage(channel, text);
}

function isRollCall(data) {
  return (data.type != undefined && data.type == 'message' 
          && (data.text == "roll call" || data.text == "rollcall"));
}
