const urlParams = new URLSearchParams(window.location.search);

const channelId = urlParams.get("channelId") || "five-ixlsr8b94mc";
const fpsString = urlParams.get("fps") || "1";
const fullScreen = urlParams.get("fullscreen") === "true" || false;
const orderBy = urlParams.get("orderBy") || null;

let images = []; // array to store the images
let currentImageIndex = 0; // variable to keep track of the current image

let requestsNeeded = 0;
let requestsCounter = 0;

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

      requestsNeeded = Math.ceil(blocksInChannel / pageSize);

      const fetchImages = () => {
        fetch(
          `https://api.are.na/v2/channels/${channelId}/contents?per=${pageSize}&page=${
            requestsCounter + 1
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
          })
          .finally(() => {
            requestsCounter++;

            if (requestsCounter < requestsNeeded) {
              fetchImages();
            }
          });
      };

      fetchImages();
    });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(parseInt(fpsString));

  background(25);
}

function draw() {
  if (requestsCounter < requestsNeeded) {
    background(25);
    textAlign(CENTER, CENTER);
    fill(100);
    textSize(20);
    text(
      `Loading (${requestsCounter}/${requestsNeeded})…`,
      width / 2,
      height / 2
    );
  } else if (!mouseIsPressed) {
    const currentImage = images[currentImageIndex];

    if (currentImage) {
      let drawWidth;
      let drawHeight;

      if (!fullScreen) {
        drawWidth = currentImage.width;
        drawHeight = currentImage.height;
      } else {
        if (windowWidth > windowHeight) {
          drawWidth = windowWidth;
          drawHeight = (windowWidth / currentImage.width) * currentImage.height;
        } else {
          drawWidth = (windowHeight / currentImage.height) * currentImage.width;
          drawHeight = windowHeight;
        }
      }

      drawingContext.drawImage(
        currentImage,
        width / 2 - drawWidth / 2,
        height / 2 - drawHeight / 2,
        drawWidth,
        drawHeight
      );

      currentImageIndex = (currentImageIndex + 1) % images.length;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
