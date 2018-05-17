new Vue({
  el: "#app",
  delimiters: ['${', '}'],
  data: {
    room: "",
    username: "",
    rooms: []
  },
  methods: {
    login() {
      localStorage.setItem("room", this.room);
      localStorage.setItem("username", this.username);
      window.location.href = "/";
    }
  },
  mounted() {
    if (localStorage.getItem("room") && localStorage.getItem("username")) {
      window.location.href = "/";
    }

    this.socket = io();

    this.socket.on('connect', () => {
      console.log('conectado...');
      this.socket.emit('sendRooms',{ k: null } ,(k) => {
        this.rooms = k;
      });
    });


    this.socket.on('room', (rooms) => {
      this.rooms = rooms;
    });

  }
});
