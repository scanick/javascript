(function(self) {

	self.init = function() {
		addEventListener("keydown", function(event) {
			switch(event.keyCode){
				case 32: engin.events("pause","pause"); break;
				case 37: engin.events("key","left"); break;
				case 38: engin.events("key","up"); break;
				case 39: engin.events("key","right"); break;
				case 40: engin.events("key","down"); break;
				default: break;
			}
		});
		$('#field').mousemove(function( event ) {
			//console.log("x:" + event.pageX + " y:" + event.pageY);
			engin.events( "mousemove", [event.clientX, event.clientY] );
		});
		$('#field').click(function(event){
			engin.events( "mouseClick", [event.clientX - 6, event.clientY - 6]);
		});
	};

})( this.events = {} );