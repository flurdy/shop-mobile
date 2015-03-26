var Guid = function() {
  this.s4 = function() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  this.guid = function(){
    return  this.s4() + this.s4() + '-' + 
            this.s4() + '-' + 
            this.s4() + '-' + 
            this.s4() + '-' + 
            this.s4() + this.s4() + this.s4();
  };
};
