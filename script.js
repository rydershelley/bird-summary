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
  const data = results.data; // Array of row objects

  // Select year to summarize - Turn into a user option
  //TODO;
  const selectYear = "2023";

  // Filtered data by year
  const filteredYear = data.filter(
    (row) => row["Date"].split("-")[0] === selectYear
  );

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

  // Function to get location that matches id from unique id array
  const getLocation = (id) => {
    const obj = filteredYear.find((row) => row["Submission ID"] === id);
    return obj ? obj["Location"] : null;
  };

  // Obj of locations used for the year
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

  outputTitle.innerHTML = `Your summary for ${selectYear}`;
  numChecklists.innerHTML = `You reported ${countLists} lists to eBird.`;
  numSpecies.innerHTML = `Total species for the year: ${countSpecies.length}`;
  mostOftenSpecies.innerHTML = `${mostSpecies[0]} was the most often seen species, appearing on ${mostSpecies[1]} lists.`;
  totalBirds.innerHTML = `You reported a total of ${totalBirdCount} individual birds.
  The high count was ${mostSpeciesCount[0]}, with ${mostSpeciesCount[1]} individuals.`;
  mostOftenLocation.innerHTML = `You reported lists from ${countLocations} different locations,
  most often from ${highCountLocation[0]} (${highCountLocation[1]} lists)`;

  for (const rowObj of filteredYear) {
    // const date = rowObj["Date"];
    // const name = rowObj["Name"];
  }
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

uploadForm.addEventListener("submit", function (event) {
  // Prevent the default form submission behavior
  event.preventDefault();
  readAndProcessCSV(fileUpload.files[0]);
});

fileUpload.addEventListener("change", function () {
  // Get the file name from the input value
  const fileName = fileUpload.value.split("\\").pop();
  // Update the label text with the file name
  fileLabel.textContent = fileName;
});

// Add a reset event listener to the form
uploadForm.addEventListener("reset", function () {
  // Change the label text back to Choose File
  fileLabel.textContent = "Choose File";
});
