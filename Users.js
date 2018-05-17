class Users {
  constructor() {
    this.users = [];
    this.room = [];
  }

  addUsers(id, name, room) {
    var user = { id, name, room, score: 0 };
    this.users.push(user);
    return user;
  }

  removeUser(id) {
    var user = this.getUser(id);
    if (user) {
      this.users = this.users.filter(user => user.id !== id);
    }
    return user;
  }

  getUser(id) {
    return this.users.filter(user => user.id === id)[0];
  }

  getUserList(room) {
    var users = this.users.filter(user => user.room === room);
    var namesArray = users.map(user => user);
    return namesArray;
  }

  addRoom(room) {
    if (this.room.indexOf(room) === -1) {
      this.room.push(room);
    }
  }

  getListRoom() {
    return this.room;
  }

  removeRoom(room) {
    this.room.splice(this.room.indexOf(room), 1);
    return room;
  }

  setScore(id, score) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === id) {
        this.users[i].score = score;
      }
    }
  }

  winner() {
    let winners = [];

    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === id) {
        if (this.users[i].score > 5) {
          winners.push(this.users[i]);
        }
      }
    }

    return winners;
  }
}

module.exports = { Users };
