(function(self) {

	self.init = function() {
		engin.init();
	};

})( this.kernel = {} );
$(function() {
	kernel.init();
	events.init();
});