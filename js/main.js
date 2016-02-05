(function(self) {

	self.init = function() {
		engin.init();
	};

})( this.kernel = {} );
$(function() {//точка входа
	kernel.init();
	events.init();
});