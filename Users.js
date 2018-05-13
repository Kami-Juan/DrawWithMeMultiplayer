class Users{
   constructor(){
       this.users = [];
       this.room = [];
   }

   addUsers( id, name, room ){
       var user = { id, name, room };
       this.users.push(user);
       return user;
   }

   removeUser( id ){
       var user = this.getUser(id);
       if( user ){
          this.users = this.users.filter( (user) => user.id !== id);
       }
       return user;        
   }

   getUser( id ){
       return this.users.filter( (user) => user.id === id)[0];
   }

   getUserList( room ){
       var users = this.users.filter( (user) =>  user.room === room );
       var namesArray = users.map( (user) => user.name);
       return namesArray; 
   }

   addRoom( room ){
       if( this.room.indexOf(room) === -1 ){
           this.room.push(room);
       }     
   }

   getListRoom(){
       return this.room;
   }

   removeRoom( room ){
       this.room.splice(this.room.indexOf(room),1);
       return room;
   }
}

module.exports = { Users };