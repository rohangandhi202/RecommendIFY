import express from "express";
import fetch from "node-fetch";

const app = express();

app.set("views", "./views"); //use the views folder
app.set("view engine", "pug"); //using pug for the view engine

app.use(express.static("public")); //look at the static files in the public folder

const redirect_uri = "http://localhost:3000/callback";
const client_id = "6d19b366fb414f83bc7833cc7bacbb93";
const client_secret = "b264bde314e64cd7bb790121eff01d37";

global.access_token;

//renders the index page as the home page
app.get("/", function (req, res) {
  res.render("index");
});

//When User clicks login they get redirected to the authorize page
app.get("/authorize", (req, res) => {
  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: client_id,
    scope: "user-library-read",
    redirect_uri: redirect_uri,
  });

  res.redirect( //fetch redirect link
    "https://accounts.spotify.com/authorize?" + auth_query_parameters.toString()
  );
});

//The callback page after user logs in and authorizes account
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  //console.log(code) --> check to see if it shows up in terminal

  var body = new URLSearchParams({
    code: code,
    redirect_uri: redirect_uri,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "post",
    body: body,
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
  });

  const data = await response.json();
  //console.log(data); --> checked the token information
  global.access_token = data.access_token;

  res.redirect("/dashboard");
});

//The endpoint to get data on the user
async function getData(endpoint) {
  const response = await fetch("https://api.spotify.com/v1" + endpoint, { //get the data about the user using the endpoint
    method: "get",
    headers: {
      Authorization: "Bearer " + global.access_token,
    },
  });

  const data = await response.json();
  console.log(data); //--> print out the data about the user in the terminal
  return data;
}

//getting data from the endpoint and displaying it on webpage
app.get("/dashboard", async (req, res) => {
  const userInfo = await getData("/me"); //endpoint call #1
  const playlists = await getData("/me/playlists"); //endpoint call #2 to get User's saved tracks
  // const tracks = await getData("/me/playlists/");

  // res.render("dashboard", { user: userInfo }); //test out endpoint
  res.render("dashboard", { user: userInfo, playlists: playlists.items });
});

// // Route to handle setting a new alarm
// app.post('/set_alarm', async (req, res) => {
//   const alarmTime = req.body.alarm_time;
//   const selectedPlaylistId = req.body.playlist_id;
//   const selectedSongId = req.body.song_id;

//   // Save the alarm to the database
//   const newAlarm = {
//     id: uuidv4(), // Generate a unique ID for the alarm
//     time: alarmTime,
//     playlistId: selectedPlaylistId,
//     songId: selectedSongId,
//   };
//   alarmsDB.push(newAlarm);

//   // Call the alarm API to schedule the alarm
//   try {
//     await axios.post('https://your-alarm-api.com/schedule', newAlarm); // Replace with your actual alarm API endpoint
//     res.redirect('/?success_message=Alarm%20set%20successfully!');
//   } catch (error) {
//     console.error('Error scheduling alarm:', error);
//     res.redirect('/?error_message=Failed%20to%20schedule%20alarm.');
//   }
// });

// // Check and trigger alarms every minute
// setInterval(() => {
//   const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
//   alarmsDB.forEach((alarm, index) => {
//     if (alarm.time === now) {
//       playAlarm(alarm.playlistId, alarm.songId);
//       alarmsDB.splice(index, 1); // Remove the triggered alarm from the database
//     }
//   });
// }, 60000); // Check every minute

// function playAlarm(selectedPlaylistId, selectedSongId) {
//   console.log(`Alarm triggered! Playing playlist: ${selectedPlaylistId}, Song: ${selectedSongId}`);
//   // Add code here to play the selected playlist/song using Spotify API or any other music library
//   // You can also make an API call to your alarm API to stop the alarm once it's triggered
// }

//The port number is 3000

let listener = app.listen(3000, function () {
  console.log(
    "Your app is listening on http://localhost:" + listener.address().port //message that is displayed
  );
});