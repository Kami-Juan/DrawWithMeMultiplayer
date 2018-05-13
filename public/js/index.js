new Vue({
  el: "#app",
  data: {
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
