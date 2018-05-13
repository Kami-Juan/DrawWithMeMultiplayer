let vm = new Vue({
  el: "#app",
  delimiters: ['${', '}'],
  data: {
    epochCounter: 0,
    nn: "",
    len: 784,
    totalData: 1000,    
    socket: "",
    puntaje: "",
    labels :
    [
      {
        nombre: "gato",
        valor: 0,
        dataRaw: "",
        data: {}
      },
      {
        nombre: "tren",
        valor: 1,
        dataRaw: "",
        data: {}
      },
      {
        nombre: "arcoiris",
        valor: 2,
        dataRaw: "",
        data: {}
      },
      {
        nombre: "pajaro",
        valor: 3,
        dataRaw: "",
        data: {}
      }
    ],
    training: [],
    testing: [],
    score: 0,
    nombreDibujo: "",
    usuarios: "",
    msg: "",
    isTrained: false,
    mensajes: [],
    tipoDibujo: [
      {
        tipo:"gato",
        valor: 0
      },
      {
        tipo:"tren",
        valor: 1
      },
      {
        tipo:"arcoiris",
        valor: 2
      },
      {
        tipo:"pajaro",
        valor: 3
      }
    ]
  },
  methods: {
    enviarScore() {
      this.socket.emit("puntaje", this.puntaje);
    },
    prepareData (category, data, label) {
      category.training = [];
      category.testing = [];
      for (let i = 0; i < this.totalData; i++) {
        let offset = i * this.len;
        let threshold = floor(0.8 * this.totalData);
        if (i < threshold) {
          category.training[i] = data.bytes.subarray(offset, offset + this.len);
          category.training[i].label = label;
        } else {
          category.testing[i - threshold] = data.bytes.subarray(offset, offset + this.len);
          category.testing[i - threshold].label = label;
        }
      }
    },
    trainEpoch () {
      shuffle(this.training, true);
      for (let i = 0; i < this.training.length; i++) {
        let data = this.training[i];
        let inputs = Array.from(data).map(x => x / 255);
        let label = this.training[i].label;
        let targets = [0, 0, 0, 0];
        targets[label] = 1;
        this.nn.train(inputs, targets);
      }
    },
    testAll () {
      let correct = 0;
      // Train for one epoch
      for (let i = 0; i < this.testing.length; i++) {
        let data = this.testing[i];
        let inputs = Array.from(data).map(x => x / 255);
        let label = this.testing[i].label;
        let guess = this.nn.predict(inputs);

        let m = max(guess);
        let classification = guess.indexOf(m);

        if (classification === label) {
          correct++;
        }
      }
      let percent = 100 * correct / this.testing.length;
      return percent;
    },
    loadNeuralNetwork () {
      if( localStorage.getItem("nn") ){
        this.nn = NeuralNetwork.deserialize(localStorage.getItem("nn"));    
        this.isTrained = true;
      }else{
        // Making the neural network      
        this.nn = new NeuralNetwork(784, 64, this.labels.length);    
      }
    },
    train () {
      this.trainEpoch();
      this.epochCounter++;
      const dataTrain = this.nn.serialize();
      localStorage.removeItem("nn");
      localStorage.setItem("nn", dataTrain);
      console.log("Epoch: " + this.epochCounter);
    },
    test () {
      let percent = this.testAll(this.testing);
      console.log("Percent: " + nf(percent, 2, 2) + "%");
    },
    clearCanvas () {
      background(255);
      this.nombreDibujo = "";
    },
    guess () {
      let inputs = [];
      let img = get();
      img.resize(28, 28);
      img.loadPixels();
      for (let i = 0; i < this.len; i++) {
        let bright = img.pixels[i * 4];
        inputs[i] = (255 - bright) / 255.0;
      }
  
      let guess = this.nn.predict(inputs);
      let m = max(guess);
      let classification = guess.indexOf(m);
      // console.log(classification);
      this.playGame(classification);
      this.nombreDibujo = "";
    },
    playGame (type) {
      console.log(type);
      let isError = true;
      for (let i = 0; i < this.labels.length; i++) {
        if(type === this.tipoDibujo[0].valor){
          console.log(this.tipoDibujo[0].tipo);
          this.score++;
          this.clearCanvas();
          shuffle(this.tipoDibujo, true)
          // console.log(this.tipoDibujo)
          isError = false
          this.socket.emit('updateScore', this.score);
        }      
      }
      if(isError) {
        this.score--;
        this.socket.emit('updateScore', this.score);
      }
    },
    guessPress () {
      let inputs = [];
      let img = get();
      img.resize(28, 28);
      img.loadPixels();
      for (let i = 0; i < this.len; i++) {
        let bright = img.pixels[i * 4];
        inputs[i] = (255 - bright) / 255.0;
      }
  
      let guess = this.nn.predict(inputs);
      let m = max(guess);
      let classification = guess.indexOf(m);

      switch (classification) {
        case 0:
          this.nombreDibujo = "Es un gato!";
        break;
        case 1:
          this.nombreDibujo = "Es un tren!";          
        break;
        case 2:
          this.nombreDibujo = "Es un arcoiris!";          
        break;
        case 3:
          this.nombreDibujo = "Es un pájaro!";          
        break;
        default:
          this.nombreDibujo = "NO se que es :c!";
        break;
      }
    }
  },
  mounted() {
    this.socket = io();
    let params = {};
    params.room = localStorage.getItem("room");
    params.name = localStorage.getItem("username");

    this.socket.on('connect', () => {
      
      this.socket.emit('join', params ,(err) =>{
        if(err){
          console.log(err)
          localStorage.removeItem("room");
          localStorage.removeItem("username");
          window.location.href = '/login';    
        }else{
          console.log('No hay errores');
          this.socket.emit('roomie', params, () => {});
        }
      });
    });

    this.socket.on('disconnect',() => {
      console.log('servidor desconectado');
    });

    this.socket.on('updateUserList', (users) => {
      this.usuarios = users;
      console.log(users)
    });

    this.socket.on('newMensaje', (msg) => {
      this.mensajes.push(msg);
    });

    this.socket.on('newScoreUser',  (msg) => {
      this.mensajes.push(msg);
    });
  }
});

let nn;

function preload() {
  vm.loadNeuralNetwork();

  vm.labels[0].dataRaw = loadBytes('data/cats1000.bin');
  vm.labels[1].dataRaw = loadBytes('data/trains1000.bin');
  vm.labels[2].dataRaw = loadBytes('data/rainbows1000.bin');
  vm.labels[3].dataRaw = loadBytes('data/bird1000.bin');
}


function setup() {
  const cv = createCanvas(400, 400);
  cv.parent('sketch-holder');
  background(255);

  for (let i = 0; i < vm.labels.length; i++) {
    vm.prepareData(vm.labels[i].data, vm.labels[i].dataRaw, vm.labels[i].valor)    
  }

  let training = [];
  let testing = [];

  for (let x = 0; x < vm.labels.length; x++) {
    training = training.concat(vm.labels[x].data.training);
    testing = testing.concat(vm.labels[x].data.testing);
  }  

  vm.training = training;
  vm.testing = testing;
  
}

function draw() {
  strokeWeight(8);
  stroke(0);
  /* WIDTH HEIGHT */
  if (mouseIsPressed && (pmouseY <= width) && (pmouseY > 0) && (pmouseX <= height) && (pmouseX > 0)) {
    line(pmouseX, pmouseY, mouseX, mouseY);
    console.log("here!")
    vm.guessPress();
  }
}


