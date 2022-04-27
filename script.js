const URL = "https://teachablemachine.withgoogle.com/models/TToCOdDzm/";
const labelContainer = document.getElementById("label-container");
const info = [
  {
    website: null,
    emoji: "😴",
  },
  { website: "https://zerotomastery.io/", emoji: "🤞" },
  { website: "https://www.youtube.com/", emoji: "😛" },
  // add more stuff if you have more audio classes
];

const openNewTabTo = (score, threshold, childNode, data, recognizer) => {
  const { website, emoji } = data;
  if (score > threshold && website) {
    window.open(website, "_blank");
    recognizer.stopListening(); // stop the recognition once it opens a new tab
  }
  childNode.innerHTML = `${(score * 100).toFixed(1)}% ${emoji} `;
};

async function createModel() {
  const checkpointURL = URL + "model.json"; // model topology
  const metadataURL = URL + "metadata.json"; // model metadata
  const recognizer = speechCommands.create(
    "BROWSER_FFT", // fourier transform type, not useful to change
    undefined, // speech commands vocabulary feature, not useful for your models
    checkpointURL,
    metadataURL
  );
  await recognizer.ensureModelLoaded();
  return recognizer;
}

async function init() {
  const recognizer = await createModel();
  const classLabels = recognizer.words;
  for (let i = 0; i < classLabels.length; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
  recognizer.listen(
    (result) => {
      const scores = result.scores;
      for (let i = 0; i < classLabels.length; i++) {
        openNewTabTo(
          scores[i],
          0.85,
          labelContainer.childNodes[i],
          info[i],
          recognizer
        );
      }
    },
    {
      includeSpectrogram: true, // in case listen should return result.spectrogram
      probabilityThreshold: 0.75,
      invokeCallbackOnNoiseAndUnknown: true,
      overlapFactor: 0.5, // probably want between 0.5 and 0.75. More info in README
    }
  );
}
