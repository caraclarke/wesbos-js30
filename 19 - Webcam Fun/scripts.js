const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
  // get webcam w/ mediaDevices.getUserMedia
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      video.src = window.URL.createObjectURL(localMediaStream);
      video.play();
    })
    .catch(err => {
      console.error('getVideo err: ', err);
    })
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  setInterval(() => {
    // pass DI an img or video and will paint to context
    ctx.drawImage(video, 0, 0, width, height);

    // take pixels out
    let pixels = ctx.getImageData(0, 0, width, height);
    // add color effects
    // pixels = redEffect(pixels);
    // pixels = greenScreen(pixels);

    pixels = rgbSplit(pixels);
    // ctx.globalAlpha = 0.1;

    // put pixels back
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto() {
  snap.currentTime = 0;
  snap.play();

  // take data out of canvas
  const data = canvas.toDataURL('image/jpeg'); // or png or anything(ish)
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'snapshot');
  // link.textContext('Download Img');
  link.innerHTML = `<img src="${data}" alt="Snapshot" />`;
  strip.insertBefore(link, strip.firstChild);
}

// color effects
function redEffect(px) {
  for(let i = 0; i < px.data.length; i+=4) {
    px.data[i + 0] = px.data[i + 0] + 200; // RED
    px.data[i + 1] = px.data[i + 1] - 50; // GREEN
    px.data[i + 2] = px.data[i + 2] * 0.5; // BLUE
  }
  return px;
}

function rgbSplit(px) {
  for(let i = 0; i < px.data.length; i+=4) {
    px.data[i - 150] = px.data[i + 0]; // RED
    px.data[i + 500] = px.data[i + 1]; // GREEN
    px.data[i - 550] = px.data[i + 2]; // BLUE
  }
  return px;
}

function greenScreen(px) {
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < px.data.length; i = i + 4) {
    red = px.data[i + 0];
    green = px.data[i + 1];
    blue = px.data[i + 2];
    alpha = px.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      px.data[i + 3] = 0;
    }
  }

  return px;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);