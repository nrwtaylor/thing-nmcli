#!/usr/bin/env node

require("dotenv").config();

net = require("net");

const axios = require("axios");

const datagrams = [{}];

const var_dump = require("var_dump");

// Use Gearman to provide the stack connector.
var gearmanode = require("gearmanode");

var sys = require("sys");
var exec = require("child_process").exec;

// 26 September 2021
console.log("thing-nmcl 1.0.2 18 July 2022");

const client = gearmanode.client();
//
/*
Standard stack stuff above.
*/
//var ping = require('ping');
//var Ping = require('ping-wrapper')
//Ping.configure();

var station = process.env.STATION;

var hosts = process.env.STATIONS.split(" ");
var channel = process.env.CHANNEL;
var transport = process.env.TRANSPORT;
var interval_minutes = process.env.INTERVAL;
var http_transport = process.env.HTTP_TRANSPORT;
var nuuid = process.env.NUUID;


//var minutes = 1,
the_interval = interval_minutes * 60 * 1000;

setInterval(function () {
  //exec("ping -c 3 localhost", puts);

  console.log("I am doing my 1 minute check again");
  // do your stuff here

  // nmcli d wifi
  text = "test";
  //console.log("hosts", hosts);
  //  hosts.map((h) => {
  //    var host = h;
  //console.log("ping host", host);
  const child = exec(
    "/bin/nmcli -m multiline d wifi",
    (error, stdout, stderr, text) => {
      //console.log("hostx", host);
      puts(error, stdout, stderr, text);
    }
  );
  // });
}, interval_minutes * 60 * 1000);

function parseLine(text) {
  var obj = {};
  parts = text.split(":");
  //console.log(parts);
  obj[parts[0].trim().trim("'")] = parts[1].trim();

  return obj;
}

function puts(error, stdout, stderr, text) {
  const timestamp = new Date().toISOString();

  //console.log("text", text);
  //  console.log("stdout",stdout);
  //console.log("puts");
  var count = 0;
  const lines = stdout.split("\n");

  var station_observation = [];
  const visible_stations = [];
  lines.map((line) => {
    if (line === "") {
      return;
    }
    const pair = parseLine(line);

    station_observation = { ...station_observation, ...pair };
    //console.log(Object.keys(pair)[0]);

    if (Object.keys(pair)[0] === "IN-USE") {
      // nom nom object
      delete station_observation["BSSID"];
      delete station_observation["SSID"];
      delete station_observation["SECURITY"];
      station_observation["SIGNAL"] = parseInt(station_observation["SIGNAL"]);
      count = 0;
      visible_stations.push(station_observation);

      station_observation = [];
    }
    count += 1;
  });

  //const sumSignal = visible_stations.reduce((total, visibleStation)=> ( (total) + +visibleStation.SIGNAL)),0);
  //const sumSignal = visible_stations.reduce((acc, visibleStation) => (acc + visibleStation.SIGNAL), 0)

  var sumSignal = 0;
  var bandSignal = {};
  var bandCount = {};

  visible_stations.map((visibleStation) => {
    if (visibleStation.SIGNAL === undefined) {
      return;
    }
    if (isNaN(visibleStation.SIGNAL)) {
      return;
    }

    if (isNaN(bandSignal[visibleStation.CHAN])) {
      bandSignal[visibleStation.CHAN] = 0;
    }

    if (isNaN(bandCount[visibleStation.CHAN])) {
      bandCount[visibleStation.CHAN] = 0;
    }

    bandCount[visibleStation.CHAN] = bandCount[visibleStation.CHAN] + 1;
    bandSignal[visibleStation.CHAN] =
      bandSignal[visibleStation.CHAN] + visibleStation.SIGNAL;

    //    sumSignal += visibleStation.SIGNAL;
  });

  const data = btoa(visible_stations);

  var to = channel;
  var from = "nmcli";

  //  const timestamp = new Date().toISOString();
  //const timestamp = new Date().toISOString().slice(0, 17) + "00";
  //const timestamp = new Date().toISOString();
  //const textBandSignal = flattenObject(bandSignal);
  const textBandCount = "";
  //flattenObject(bandCount);

  textBandSignal = Object.keys(bandSignal).reduce(function (r, k) {
    return r + "" + k + " " + bandSignal[k] + " " + bandCount[k] + " / ";
  }, []);
  //textBandSignal.replace("-"," ");
  console.log(textBandSignal);

  const subject =
    "THING " + nuuid + " " + station + " " + textBandSignal;

  //const base64Data = btoa(stdout);

  //const data = nomnomText(stdout);

  var agentInput = { data: data, surveyedAt: timestamp };

  const datagram = {
    to: to,
    from: from,
    subject: subject,
    agentInput: agentInput,
  };

  handleDatagram(datagram);

  return;
  console.log("test", lines[lines.length - 2]);
  const line = text + " " + lines[lines.length - 2]; // Because last lin>
  console.log("line", line);
  handleLine(line);
}

function nomnomText(text) {
  const lines = text.split(" \n").map((line) => {
    return line;
  });

  console.log(lines);
}

function systemPing(host) {
  console.log("making a systemPing call");
  try {
    var exec = require("child_process").exec;
    const makePingCall = (error, stdout, stderr) => {
      //console.log("makePingCall", error, stdout, stderr);
      //console.log("stdout", stdout);
      return stdout;
    };

    exec(`ping ${host} -c 3`, makePingCall);
    return makePingCall;
  } catch (error) {
    console.error("error", error);
  }
}

function handleLine(line) {
  var to = channel;
  var from = "ping";

  const subject = line;
  var agentInput = "ping";

  const datagram = {
    to: to,
    from: from,
    subject: subject,
    agentInput: agentInput,
  };

  handleDatagram(datagram);
}

function handleDatagram(datagram) {
  /*
        REFERENCE
        $datagram = [
            "to" => "null" . $this->mail_postfix,
            "from" => "job",
            "subject" => "s/ job stack",
        ];
  */
  console.log("handleDatagram", datagram);
  var to = datagram.to;
  var from = datagram.from;

  const subject = datagram.subject;
  var agent_input = datagram.agentInput;

  //  match = false;

  //  console.log(subject);

  // Otherwise this is a different datagram.
  // Save it in local memory cache.

  //console.log("SUBJECT", subject);
  const timestamp = new Date();
  const utc = timestamp.toUTCString();

  var arr = {
    from: from,
    to: to,
    subject: subject,
    agent_input: agent_input,
    precedence: "routine",
  };
  var datagram = JSON.stringify(arr);
  //       .post("https://stackr.ca/api/whitefox/message", datagram, {

  if (transport === "apache") {
    axios
      .post(http_transport, datagram, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((result) => {
        const thing_report = result.data.thingReport;

        console.log("thing_report", thing_report);

        // Create a fallback message.
        // Which says 'sms'.
        sms = "sms";
        message = "sms";

        try {
          //      var thing_report = JSON.parse(job.response);
          var sms = thing_report.sms;
          var message = thing_report.message;
          //var agent = thing_report.agent;
          //var uuid = thing_report.thing.uuid;
        } catch (e) {
          console.log(e);

          var sms = "quiet";
          var message = "Quietness. Just quietness.";
        }

        console.log(sms);
        console.log(message);
        console.log(thing_report.png);
        console.log(thing_report.pngs);

        thing_report.log = "nulled";
        console.log(thing_report);
        console.log(thing_report.link);
        //    const image_url = thing_report && thing_report.link ? thing_report.link + '.png' : null

        const image_url =
          thing_report && thing_report.image_url
            ? thing_report.image_url
            : null;

        console.log(image_url);
        if (sms !== null) {
          if (image_url === null) {
            console.log(sms);
            //        discordMessage.channel.send(sms);
          } else {
            console.log(sms);
            console.log("image(s) available");
            //        discordMessage.channel.send(sms, { files: [image_url] });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  if (transport === "gearman") {
    try {
      var job = client.submitJob("call_agent", datagram);
      console.log("SENT DATAGRAM TO GEARMAN");
      console.log(datagram);
    } catch (e) {
      console.log(e);

      var sms = "quiet";
      var message = "Quietness. Just quietness.";
    }

    job.on("workData", function (data) {
      // Uncomment for debugging/testing.
      //    console.log('WORK_DATA >>> ' + data);
    });

    job.on("error", function (err) {
      console.log("ERROR: ", err.message || err);
      gearman.close();
    });

    job.on("fail", function (handle) {
      console.log("FAIL");
    });

    job.on("failed", function () {
      console.log("FAILURE >>> " + job.handle);
      client.close();
    });
    job.on("exception", function (text) {
      // needs configuration of job server session (JobServer#setOption)
      console.log("EXCEPTION >>> " + text);
      client.close();
    });

    job.on("complete", function () {
      // Create a fallback message.
      // Which says 'sms'.
      sms = "sms";
      message = "sms";

      try {
        //console.log("Job complete",job);
        var thing_report = JSON.parse(job.response);
        var sms = thing_report.sms;
        var message = thing_report.message;
      } catch (e) {
        console.log(e);

        var sms = "quiet";
        var message = "Quietness. Just quietness.";
      }

      console.log(sms);
      console.log(message);

      // Respond to the channel with the sms
      // channel response.

      // No response to the message
      // Just log for now.
      //    discordMessage.channel.send(sms);

      // dev exploring ways to respond.
      // discordMessage.reply(sms);
      // message.lineReply(sms); //Line (Inline) Reply with mention
      // message.lineReplyNoMention(`My name is ${client.user.username}`); //L
    });
  }
}

function flattenObject(ob) {
  var toReturn = {};

  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if (typeof ob[i] == "object" && ob[i] !== null) {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + "." + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}
