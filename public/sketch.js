// const len = 784;
// const totalData = 1000;

// let labels = 
// [
//   {
//     nombre: "arcoiris",
//     valor: 0,
//     dataRaw: "",
//     data: {}
//   },
//   {
//     nombre: "gato",
//     valor: 1,
//     dataRaw: "",
//     data: {}
//   },
//   {
//     nombre: "tren",
//     valor: 2,
//     dataRaw: "",
//     data: {}
//   }
// ];

// let targets = [0, 0, 0];

// let nn;
// let test;

// function preload() {

//   $(document).ready(function(){
//     $('.sidenav').sidenav();
//   });

//   if (localStorage.getItem("nn")) {
//     //nn = NeuralNetwork.deserialize(localStorage.getItem("nn"));
//     //test = loadStrings("data/childNetwork.txt");
//     //console.log(test);
//   } else {
//     // Making the neural network
//     nn = new NeuralNetwork(784, 64, labels.length);
//   }

//   labels[0].dataRaw = loadBytes("data/rainbows1000.bin");
//   labels[1].dataRaw = loadBytes("data/cats1000.bin");
//   labels[2].dataRaw = loadBytes("data/trains1000.bin");
//   /* labels[3].dataRaw = loadBytes("data/triangle1000.bin"); */
// }

// function setup() {
//   let cv;  
//   if( windowWidth <= 459){
//     cv = createCanvas(windowWidth-60, windowWidth-60);    
//   }else{
//     cv = createCanvas(400, 400);        
//   }

  
//   cv.parent("sketch-holder");
//   background(255);

//   // Preparing the data
//   for(let z = 0; z < labels.length; z++){
//     prepareData(labels[z].data, labels[z].dataRaw, labels[z].valor);  
//   }

  

//   // Randomizing the data
//   let training = [];
//   let testing = [];

//   for( let r = 0; r < labels.length; r++ ){
//     training = training.concat(labels[r].data.training);
//     testing = testing.concat(labels[r].data.testing);  
//   }

//   let trainButton = select("#train");
//   let epochCounter = 0;

//   trainButton.mousePressed(function() {
//     trainEpoch(training);
//     epochCounter = epochCounter + 1;
//     // const dataTrain = nn.serialize();
//     // localStorage.setItem("nn", dataTrain);
//     console.log("Epoch: " + epochCounter);
//   });

//   let testButton = select("#test");

//   testButton.mousePressed(function() {
//     let percent = testAll(testing);
//     console.log("Percent: " + nf(percent, 2, 2) + "%");
//   });

//   let nombreDibujo = select("#nameDraw");
//   nombreDibujo.html("arcoiris");  

//   let puntaje = select("#score");
//   puntaje.html(0);

//   let scoreCont = 0;
//   let guessButton = select("#guess");
//   let porcentDraw = select("#porcent");
//   let dataPorcent = $("#data-porcent");

//   let dibujos = labels;

//   guessButton.mousePressed(function() {
//     let inputs = [];
//     let img = get();
//     img.resize(28, 28);
//     img.loadPixels();
//     for (let i = 0; i < len; i++) {
//       let bright = img.pixels[i * 4];
//       inputs[i] = (255 - bright) / 255.0;
//     }

//     let guess = nn.predict(inputs);
//     console.log(guess);

//     let m = max(guess);    
//     let classification = guess.indexOf(m);
//     console.log(classification);
//     console.log(dibujos[0].valor);

//     /* let pI = "";

//     porcentDraw.html(guess[dibujos[0].valor]*100);
//      for (let f = 0; f < labels.length; f++) {
//       pI += "<li>"+ dibujos[f].nombre +" porcentaje: "+ guess[dibujos[f].valor] +"</li>";   
//     }

//     dataPorcent.append(pI); */

//     if(dibujos[0].valor === classification){
//       scoreCont++;
//       console.log(dibujos[0].nombre);
//       puntaje.html(scoreCont);
//       shuffle(dibujos, true);
//       nombreDibujo.html(dibujos[0].nombre);
//       background(255);  
//     }      
    
    
//   });

//   let clearButton = select("#clear");
//   clearButton.mousePressed(function() {
//     background(255);
//   });

//   let storeButton = select("#store");
//   storeButton.mousePressed(function() {
//     saveJSON(nn, "childNetwork");
//   });
// }

// function draw() {
//   strokeWeight(8);
//   stroke(0);
//   if (mouseIsPressed) {
//     line(pmouseX, pmouseY, mouseX, mouseY);
//   }
// }

let vm = new Vue({
  el: "#app",
  data: {
    len: 784,
    totalData: 1000,    
    socket: "",
    puntaje: ""
  },
  methods: {
    enviarScore() {
      this.socket.emit("puntaje", this.puntaje);
    }
  },
  mounted() {
    this.socket = io();
    this.socket.on("resultado", function(msg) {
      console.log(msg);
    });
  }
});
const CAT = 0;
const RAINBOW = 1;
const TRAIN = 2;

let catsData;
let trainsData;
let rainbowsData;

let cats = {};
let trains = {};
let rainbows = {};

let nn;

function preload() {
  if( localStorage.getItem("nn") ){
    nn = NeuralNetwork.deserialize(localStorage.getItem("nn"));    
  }else{
    // Making the neural network      
    nn = new NeuralNetwork(784, 64, 3);    
  }
  
  catsData = loadBytes('data/cats1000.bin');
  trainsData = loadBytes('data/trains1000.bin');
  rainbowsData = loadBytes('data/rainbows1000.bin');
}


function setup() {
  const cv = createCanvas(400, 400);
  cv.parent('sketch-holder');
  background(255);

  // Preparing the data
  prepareData(cats, catsData, CAT);
  prepareData(rainbows, rainbowsData, RAINBOW);
  prepareData(trains, trainsData, TRAIN);


  // Randomizing the data
  let training = [];
  training = training.concat(cats.training);
  training = training.concat(rainbows.training);
  training = training.concat(trains.training);

  let testing = [];
  testing = testing.concat(cats.testing);
  testing = testing.concat(rainbows.testing);
  testing = testing.concat(trains.testing);

  let trainButton = select('#train');
  let epochCounter = 0;
  trainButton.mousePressed(function() {
    trainEpoch(training);
    epochCounter++;
    const dataTrain = nn.serialize();
    localStorage.setItem("nn", dataTrain);
    console.log("Epoch: " + epochCounter);
  });

  let testButton = select('#test');
  testButton.mousePressed(function() {
    let percent = testAll(testing);
    console.log("Percent: " + nf(percent, 2, 2) + "%");
  });

  let guessButton = select('#guess');
  guessButton.mousePressed(function() {
    let inputs = [];
    let img = get();
    img.resize(28, 28);
    img.loadPixels();
    for (let i = 0; i < vm.len; i++) {
      let bright = img.pixels[i * 4];
      inputs[i] = (255 - bright) / 255.0;
    }

    let guess = nn.predict(inputs);
    //console.log(guess);
    let m = max(guess);
    let classification = guess.indexOf(m);
    if (classification === CAT) {
      console.log("cat");
    } else if (classification === RAINBOW) {
      console.log("rainbow");
    } else if (classification === TRAIN) {
      console.log("train");
    }
  });

  let clearButton = select('#clear');
  clearButton.mousePressed(function() {
    background(255);
  });
}

function trainEpoch(training) {
  shuffle(training, true);
  //console.log(training);
  // Train for one epoch
  for (let i = 0; i < training.length; i++) {
    let data = training[i];
    let inputs = Array.from(data).map(x => x / 255);
    let label = training[i].label;
    let targets = [0, 0, 0];
    targets[label] = 1;
    // console.log(inputs);
    // console.log(targets);
    nn.train(inputs, targets);
  }
}

function testAll(testing) {

  let correct = 0;
  // Train for one epoch
  for (let i = 0; i < testing.length; i++) {
    // for (let i = 0; i < 1; i++) {
    let data = testing[i];
    let inputs = Array.from(data).map(x => x / 255);
    let label = testing[i].label;
    let guess = nn.predict(inputs);

    let m = max(guess);
    let classification = guess.indexOf(m);
    // console.log(guess);
    // console.log(classification);
    // console.log(label);

    if (classification === label) {
      correct++;
    }
  }
  let percent = 100 * correct / testing.length;
  return percent;

}

function prepareData(category, data, label) {
  category.training = [];
  category.testing = [];
  for (let i = 0; i < totalData; i++) {
    let offset = i * vm.len;
    let threshold = floor(0.8 * totalData);
    if (i < threshold) {
      category.training[i] = data.bytes.subarray(offset, offset + vm.len);
      category.training[i].label = label;
    } else {
      category.testing[i - threshold] = data.bytes.subarray(offset, offset + vm.len);
      category.testing[i - threshold].label = label;
    }
  }
}


function draw() {
  strokeWeight(8);
  stroke(0);
  if (mouseIsPressed) {
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}


