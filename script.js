// Get the elements from the HTML file
const fileUpload = document.getElementById("file-upload");
const fileLabel = document.querySelector("label[for='file-upload']");
const uploadForm = document.getElementById("upload-form");
const output = document.getElementById("output");
const outputTitle = document.getElementById("output-title");
const numChecklists = document.getElementById("num-checklists");
const numSpecies = document.getElementById("num-species");
const totalBirds = document.getElementById("total-birds");
const mostOftenSpecies = document.getElementById("most-often-species");
const avgStartTime = document.getElementById("avg-start-time");
const totalDistance = document.getElementById("total-distance");
const mostOftenLocation = document.getElementById("most-often-location");

function processData(results) {
  /////////////////////////
  // Get data from file and filter by year
  const data = results.data; // Array of row objects

  // Select year to summarize - Turn into a user option
  //TODO;
  const selectYear = "2023";

  // Filtered data by year
  const filteredYear = data.filter((row) =>
    row["Date"]?.startsWith(selectYear)
  );

  /////////////////////////
  // Create obj of Submission IDs, get length for number of lists,
  // yearLists[1] is number of species reported
  //
  const yearLists = filteredYear.reduce((acc, cur) => {
    const key = cur["Submission ID"];
    if (!acc[key]) acc[key] = 0;
    acc[key]++;
    return acc;
  }, {});
  const listIDs = Object.keys(yearLists);
  const countLists = Object.keys(yearLists).length;

  /////////////////////////
  // SPECIES Info
  // Species and count of instances (number of lists it was on)
  const yearSpecies = filteredYear.reduce((acc, cur) => {
    const key = cur["Common Name"];
    if (!acc[key]) acc[key] = 0;
    acc[key]++;
    return acc;
  }, {});

  // Array of all species seen
  const countSpecies = Object.keys(yearSpecies);
  // Species with most occurences on lists
  const mostSpecies = Object.entries(yearSpecies).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );
  // console.log(yearSpecies);

  // Obj of species with total count for year
  const totalBySpecies = filteredYear.reduce((acc, cur) => {
    const key = cur["Common Name"];
    if (!acc[key]) acc[key] = 0;
    if (cur["Count"] !== "X") acc[key] += +cur["Count"];
    return acc;
  }, {});

  // Total birds counted
  const totalBirdCount = Object.values(totalBySpecies).reduce(
    (acc, cur) => acc + cur,
    0
  );
  // Species with highest count
  const mostSpeciesCount = Object.entries(totalBySpecies).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );

  /////////////////////////
  // LOCATION Info
  // Function to get location that matches id from unique id array
  const getLocation = (id) => {
    const obj = filteredYear.find((row) => row["Submission ID"] === id);
    return obj ? obj["Location"] : null;
  };

  // Array of locations used for the year (by list)
  const listLocations = listIDs.map((id) => getLocation(id));
  const yearLocations = listLocations.reduce((acc, cur) => {
    if (!acc[cur]) acc[cur] = 0;
    acc[cur]++;
    return acc;
  }, {});

  const countLocations = Object.keys(yearLocations).length;
  const highCountLocation = Object.entries(yearLocations).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );

  /////////////////////////
  //
  // TIME Info
  //
  const startTimes = filteredYear.reduce((acc, cur) => {
    const startTime = cur["Time"].split(" ");
    let hour = +startTime[0].split(":")[0];
    if (startTime[1] === "PM") {
      if (hour === "12") acc.push(startTime[0]);
      else {
        hour += 12;
        acc.push(`${hour}:${startTime[0].split(":")[1]}`);
      }
    } else if (hour === "12") acc.push(`00:${startTime[0].split(":")[1]}}`);
    else acc.push(startTime[0]);
    return acc;
  }, []);

  const avgStart = Math.floor(
    startTimes.reduce((acc, cur) => acc + +cur.split(":")[0], 0) /
      startTimes.length
  );

  console.log(avgStart);

  ///////////////////////////////////
  //
  // Display info
  //
  //
  outputTitle.innerHTML = `Your summary for ${selectYear}`;
  numChecklists.innerHTML = `You reported ${countLists} lists to eBird.`;
  numSpecies.innerHTML = `Total species for the year: ${countSpecies.length}`;
  mostOftenSpecies.innerHTML = `${mostSpecies[0]} was the most often seen species, appearing on ${mostSpecies[1]} lists.`;
  totalBirds.innerHTML = `You reported a total of ${totalBirdCount} individual birds.
  The high count was ${mostSpeciesCount[0]}, with ${mostSpeciesCount[1]} individuals.`;
  mostOftenLocation.innerHTML = `You reported lists from ${countLocations} different locations,
  most often from ${highCountLocation[0]} (${highCountLocation[1]} lists)`;
  avgStartTime.innerHTML = `On average, you started your lists in the ${
    avgStart > 12
      ? `${avgStart - 12} PM`
      : avgStart == 0
      ? "Midnight"
      : `${avgStart} AM`
  } hour.`;
}

function readAndProcessCSV(fileName) {
  Papa.parse(fileName, {
    header: true, // Recognize the header row
    download: true, // Download the file directly
    complete: processData, // Callback to handle results
    error: function (err, file) {
      console.error("Error during CSV parsing:", err, file);
    },
  });
}

/////////////////////////
// PREVENT REUPLOAD
//
// readAndProcessCSV("MyEBirdData.csv");

/////////////////////////
//
// Event Listeners
//
//

// Upload and process on submit
uploadForm.addEventListener("submit", function (event) {
  event.preventDefault();
  readAndProcessCSV(fileUpload.files[0]);
});

// Display filename when file is selected
fileUpload.addEventListener("change", function () {
  const fileName = fileUpload.value.split("\\").pop();
  fileLabel.textContent = fileName;
});

// Reset file input text when loaded
uploadForm.addEventListener("reset", function () {
  fileLabel.textContent = "Choose File";
});
