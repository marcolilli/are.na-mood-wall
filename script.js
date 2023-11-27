const urlParams = new URLSearchParams(window.location.search);

const channelId = urlParams.get("channelId") || "five-ixlsr8b94mc";
const fpsString = urlParams.get("fps") || "1";
const orderBy = urlParams.get("orderBy") || null;

let images = []; // array to store the images
let currentImageIndex = 0; // variable to keep track of the current image

function preload() {
  const pageSize = 100;
  let blocksInChannel = 0;

  fetch(`https://api.are.na/v2/channels/${channelId}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.contents) {
        throw new Error("No contents");
      }
      blocksInChannel = data.length;

      const requestsNeeded = Math.ceil(blocksInChannel / pageSize);

      for (let i = 0; i < requestsNeeded; i++) {
        fetch(
          `https://api.are.na/v2/channels/${channelId}/contents?per=${pageSize}&page=${
            i + 1
          }`
        )
          .then((response) => response.json())
          .then((data) => {
            if (!data.contents) {
              throw new Error("No contents");
            }

            images.push(
              ...data.contents
                .filter((block) => !!block.image)
                .map((block) => {
                  const img = new Image();
                  img.src = block.image.display.url;

                  return img;
                })
            );
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(parseInt(fpsString));

  background(25);
  textAlign(CENTER, CENTER);
  fill(100);
  textSize(20);
  text("Loading…", width / 2, height / 2);
}

function draw() {
  imageMode(CENTER);

  if (!mouseIsPressed) {
    const currentImage = images[currentImageIndex];

    if (currentImage) {
      drawingContext.drawImage(
        currentImage,
        width / 2 - currentImage.width / 2,
        height / 2 - currentImage.height / 2
      );

      currentImageIndex = (currentImageIndex + 1) % images.length;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
