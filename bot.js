const tmi = require("tmi.js");
const fetch = require("node-fetch");
const tracker = require("rocket-league-apis-client");
const fs = require("fs");
require('dotenv').config();

let safe = true;
let single;
let twopart;
let joke;
let setup;
let punchline;

const my_channel_id = 56093517;

const greetings = [
  "hej",
  "hey",
  "hello",
  "goddag",
  "god aften",
  "goddav",
  "møjn",
  "hi",
];

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: "qiTsuBot",
    password: process.env.OAUTH,
  },
  channels: ["qitsuk"],
});

client.connect();

setInterval(() => {
  tellJokeWithDelay(client).then(function(result) {
    console.log(result);
  });
}, 30 * 60 * 1000);

setInterval(() => {
  announceGiveAwayWithDelay(client);
}, 25 * 60 * 1000);

client.on("message", async (channel, tags, message, self) => {
  for (let i = 0; i < greetings.length; i++) {
    if (message.toLowerCase().startsWith(greetings[i])) {
      client.say(
        channel,
        `/me qitsukHI ${tags["display-name"]}. qiTsuk skal nok svare dig, men jeg kom først! qitsukCLOSEUP`
      );
    }
  }
  if (message.length > 275) {
    client.say(channel, "CoolStoryBob");
  }
  if (self || !message.startsWith("!")) return;

  const args = message.slice(1).split(" ");
  const command = args.shift().toLowerCase();

  if (command === "valorank") {
    const data = await getValoRank();
    client.say(
      channel,
      `${tags["display-name"]} - qiTsuk er ` +
        data +
        ". Han er dog rimelig hardstuck (læs 'noob'), så regn ikke med det bliver bedre! xD"
    );
  }
  if (command === "onlyfans") {
    let count = await readFile();
    client.say(channel, `🔞 Nååå, så du vil gerne have linket til min OnlyFans ${tags["display-name"]}?? 🔞`);
    client.say(channel, `qitsukCLOSEUP - Jeg har ikke en OnlyFans!! Din perv!!! HENTAI! HENTAAAAIII!!!! Du er den ${count}. perv der har spurgt!! WutFace`
    );
    updateFile(count);
  }
  if (command === "giveaway") {
    client.say(
      channel,
      "Jeg kører ugentlige giveaways på min discord!! qitsukYAY Du skal bare followe mig og joine min Discord: https://discord.gg/aFsV7sA4fH - Så er du helt automatisk med! 🎁 | Alle de spil du kan vinde er på denne liste: shorturl.at/bmP27"
    );
  }
  if (command === "discord") {
    client.say(
      channel,
      `Eeey, ${tags["display-name"]} - FEDT du vil være en del af qiTsuTopia!! qitsukYAY VirtualHug Her er der et link: https://discord.gg/aFsV7sA4fH | Husk at læse og acceptere reglerne (ellers kommer du ikke ind på serveren! xD)`
    );
  }

  if (command === "mooh") {
    client.say(
      channel,
      "qitsukCOWRUN qitsukMOOH MoohDaCow!! You here?? qitsukMOOH qitsukCOWRUN"
    );
  }
  if (command === "join") {
    client.say(
      channel,
      `Selvfølgelig må du være med ${tags["display-name"]}! qitsukMICRO Gå ind og join et private game - navnet er qitsuk og koden er 1234`
    );
  }
  if (command === "alder") {
    client.say(
      channel,
      `qiTsuk er ${getAge()}`
    );
  }
  if (command === "donofun") { 
    client.say(channel, "⚠️ Hvis du donerer 250kr. æder jeg en 🌶️ habanero 🌶️! (live). ⚠️ Hvis du donerer 1000kr. klipper vi Moelletops øjenbryn af, LIVE - MED DET SAMME, og laver en animeret emoji ud af det! qitsukBEAVCRY"); 
  }

  if (command === "cat-mands") {
    client.say(channel, "Her er en liste over alle de commands jeg har indtil videre: " +
    "| !joke | !valorank | !onlyfans | !giveaway | !discord | !mooh | !join | !alder | !donofun | Use this knowledge wisely! qitsukEZ Hvis du har forslag til andre commands, så hiv fat i qiTsuk på Discord! qitsukQOT");
  }
  if (command === "joke") {
    await getJoke();
    if (!safe) {
      client.say(channel, "Careful, this one is a little saucy!!");
      if (single) {
        client.say(channel, `/me ${joke} qitsukLAUGH`);
      }
      else if (twopart) {
        client.say(channel, `/me ${setup}`);
        setTimeout(() => {
          client.say(channel, `/me ${punchline} qitsukLAUGH` );
        }, 2000);
      }
    } else if (safe) {
      if (single) {
        client.say(channel, `/me ${joke} qitsukLAUGH`);
      }
      if (twopart) {
        client.say(channel, `/me ${setup}`);
        setTimeout(() => {
          client.say(channel, `/me ${punchline} qitsukLAUGH` );
        }, 2000);
      }
    }
  }

  if (command === "test") {
    await getStats(await getToken());
  }

});


async function getValoRank() {
  const response = await fetch(
    "https://api.kyroskoh.xyz/valorant/v1/mmr/eu/WokeZilla/1987"
  );
  data = await response.text();
  return data;
}

async function getToken() {
  let url = "https://id.twitch.tv/oauth2/token";
  let params = new URLSearchParams();
  params.set("client_id", process.env.CLIENT_ID);
  params.set("client_secret", process.env.CLIENT_SECRET);
  params.set("grant_type", "client_credentials");
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  };

  let response = await fetch(url, options);
  let data = await response.json();
  const token = data.access_token;
  return token;
}

async function getStats(token) {
  let url = `https://api.twitch.tv/helix/videos?user_id=${my_channel_id}`;
  let options = {
    headers: {
      "Client-ID": process.env.CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  };
  let response = await fetch(url, options);
  let data = await response.json();

  console.log("STATS DATA: ", data);
}


async function readFile() {
  let fd;
  try {
    fd = await fs.promises.open("onlyfans.of", "r");
    const data = await fs.promises.readFile(fd);
    let number = data.toString();
    parseInt(number);
    number++;
    return number;
  } catch (error) {
    throw error;
  } finally {
    if (fd) {
      fd.close();
    }
  }
}

function updateFile(number) {
  fs.writeFile("onlyfans.of", number.toString(), (err) => {
    if (err) throw error;
  });
}

function getAge() {
  const now = new Date();
  const previousDate = new Date("1987-04-07");
  const differenceInMilliseconds = now.getTime() - previousDate.getTime();
  const differenceInSeconds = differenceInMilliseconds / 1000;
  const differenceInMinutes = differenceInSeconds / 60;
  const differenceInHours = differenceInMinutes / 60;
  const differenceInDays = differenceInHours / 24;
  const differenceInYears = differenceInDays / 365;

  return Math.floor(differenceInYears) + " år, " + Math.floor(differenceInDays % 365)
  + " dage, " + Math.floor(differenceInHours % 24) + " timer, " + Math.floor(differenceInMinutes % 24)
  + " minutter, " + " og " + Math.floor(differenceInSeconds % 60) + " sekunder gammel!";
}

async function getJoke() {
  let response = await fetch('https://v2.jokeapi.dev/joke/Any?type=twopart');
  let data = await response.json();

  if (data.safe === false) {
    safe = false;
  } else {
    safe = true;
  }
  if (data.type === 'single') {
    single = true;
    twopart = false;
    joke = data.joke.replace(/\n/g, " ");
  } else if (data.type === 'twopart') {
    single = false;
    twopart = true;
    setup = data.setup.replace(/\n/g, " ");
    punchline = data.delivery.replace(/\n/g, " ");
  }
}

async function tellJokeWithDelay(client) {
  await getJoke();
    if (!safe) {
      client.say('qitsuk', "Careful, this one is a little saucy!!");
      if (single) {
        client.say('qitsuk', `/me ${joke} qitsukLAUGH`);
      }
      else if (twopart) {
        client.say('qitsuk', `/me ${setup}`);
        setTimeout(() => {
          client.say('qitsuk', `/me ${punchline} qitsukLAUGH` );
        }, 2000);
      }
    } else if (safe) {
      if (single) {
        client.say('qitsuk', `/me ${joke} qitsukLAUGH`);
      }
      if (twopart) {
        client.say('qitsuk', `/me ${setup}`);
        setTimeout(() => {
          client.say('qitsuk', `/me ${punchline} qitsukLAUGH` );
        }, 2000);
      }
    }
}

function announceGiveAwayWithDelay(client) {
  client.say("qitsuk", "Jeg kører ugentlige giveaways på min discord!! " +
   "qitsukYAY Du skal bare followe mig og joine min Discord: " +
   "https://discord.gg/aFsV7sA4fH - Så er du helt automatisk med! 🎁 |"+
   " Alle de spil du kan vinde er på denne liste: shorturl.at/bmP27");
}