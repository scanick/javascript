(function(self) {
/*===============================================================================================================
* private variables
**===============================================================================================================*/
	var canva, ctx;

	var year;

	var dates = {
		now: new Date(),
		year: 0,
		month: 0,
		week: [ 1, 2, 3, 4, 5, 6, 7],
		dayofweek:0,
		day: 0,
		months:[ ['Январь','', 31], ['Февраль','', 28], ['Март','', 31],
				['Апрель','', 30], ['Май','', 31], ['Июнь','', 30],
				['Июль','', 31], ['Август','', 31], ['Сентябрь','', 30],
				['Октябрь','', 31], ['Ноябрь','', 30], ['Декабрь','', 31] ],
		dayofweeks:[ ["Пн", 1], ["Вт", 2], ["Ср", 3], ["Чт", 4], ["Пт", 5], ["Сб", 6], ["Вс", 7] ],
		amount_of_days: 365,
		init: function(){
			this.year = this.now.getFullYear();
			if( (this.year % 4 == 0) && (this.year % 100 != 0 || this.year % 400 == 0)){//Если год високосный
				this.amount_of_days = 366;
				this.months[1][2] = 29;
			}
			this.month = this.now.getMonth() + 1;
			this.dayofweek = this.now.getDay() ? this.now.getDay(): (this.now.getDay() + 1);
			this.day = this.now.getDate();
			for(var dw = 0; dw < 7; dw++){
				this.week[dw] = this.day - this.dayofweek + dw + 1;
			}
			console.log( this.now.getFullYear() + "/" + this.now.getMonth() + "/" + this.now.getDate() +
						"//" + this.amount_of_days + "///" + this.months[1][2] + "////" + this.dayofweek + "/////" + this.week);
		},
	}

	var color = {
		ground: '#F8F8FF',
		external: '#000000',
		edgeDay: [ ['#081472','#717DD7'], ['#62DA97','#007633'], ['#FFBE73','#FF8900'], ['#63ADD0','#086FA1'] ],
		obj: ['#029DAF', '#E5D599', '#FFC219', '#F07C19', '#E32551'],
		selObj: '#FF0044',
	};

	var field = {
		fWidth: window.innerWidth,	// Ширина поля
		fHeight: window.innerHeight,// Высота поля
		center: [0, 0],				// ХУ центра поля
		radiusExternal: 0,			// Внешний радиус календаря
		radiusInner: 0, 			// Внутренний радиус календаря
		radiusInnerMonth: 0,		// Внутренний радиус для подписи месяцев календаря
		radiusMonthСurrent: 0,		// Внешний радиус текущего месяца календаря
		radiusWeekCurrent: 0,		// Внешний радиус текущей недели календаря
		radiusDayСurrent: 0,		// Внешний радиус текущего дня календаря
		init: function() {
			this.fWidth *=0.98; // Ширина поля
			this.fHeight *=0.97; // Высота поля
			this.center[0] = this.fWidth/2; // Х центра поля
			this.center[1] = this.fHeight/2;// У центра поля
			this.radiusExternal = this.fWidth > this.fHeight ? 3*this.fHeight/7 : 3*this.fWidth/7; // Внешний радиус календаря
			this.radiusInner = this.radiusExternal/1.5; // Внутренний радиус календаря
			this.radiusInnerMonth = this.radiusExternal/1.65; // Внутренний радиус для подписи месяцев календаря
			this.radiusMonthСurrent = this.radiusExternal * 1.10; // Внешний радиус текущего месяца календаря
			this.radiusWeekCurrent = this.radiusExternal * 1.15; // Внешний радиус текущей недели календаря
			this.radiusDayСurrent = this.radiusExternal * 1.20; // Внешний радиус текущего дня календаря
		},
	};

/*===============================================================================================================
* private Class day
**===============================================================================================================*/
	function classDay(){
		/*=======================================================================================================
		* private variables
		**=======================================================================================================*/
		var self = this;
		var color = ['#086A87', '#0B4C5F'];
		var surface = [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ];//[X1,Y1], [X2,Y2], [X3,Y3], [X4,Y4]
		var sector = [0, 0]; //[phi1, phi2]
		var date = 0;//1-31
		var dayofweek = 0;
		var dayIsCurrent = false;//Является ли день текущим
		var d_angelDay = 0;//
		var startAngleDay = 0;//
		var otstup = 0.0009;
		var radiusInner = field.radiusInner;
		var radiusExternal = field.radiusExternal;
		/*========================================================================================================
		* public function
		**========================================================================================================*/
		this.init = function(d, dow){//d - номер дня
			date = d;	dayofweek = dow;
		};
		
		this.set_d_angelDay = function(da){//Установить раствор угла дня
			d_angelDay = da;
			calculationSector();
		};
		
		this.setStartAngleDay = function(sa){//Установить начальный угол месяца
			startAngleDay = sa;
		};
		
		this.setCurrent = function(){//Этот день будет текущим
			radiusExternal = field.radiusDayСurrent;
			dayIsCurrent = true;
		};
		
		this.setRadiusExternal = function(re){
			radiusExternal = re;
		};
		
		this.setColor = function(col){
			color = col || color;
		};
		
		this.isCurrent = function(){//Является ли этот день текущим
			return dayIsCurrent;
		};
		
		this.getDate = function(){
			return date;
		};
		
		this.getSector = function(){
			return sector;
		};
		
		this.getRadiusInner = function(){
			return radiusInner;
		};
		
		this.getRadiusExternal = function(){
			return radiusExternal;
		};
		
		this.getType = function(){
			return 'day';
		};
		
		this.getColor = function(){
			return color;
		};
		
		this.getDayofweek = function(){
			return dayofweek;
		};
		
		this.getSurface = function(){
			return surface;
		};
		
		this.calculationSurface = function(){
			surface[0][0] = field.center[0] + radiusInner * Math.cos(sector[0]);
			surface[0][1] = field.center[1] + radiusInner * Math.sin(sector[0]);
			surface[1][0] = field.center[0] + radiusExternal * Math.cos(sector[0]);
			surface[1][1] = field.center[1] + radiusExternal * Math.sin(sector[0]);
			surface[2][0] = field.center[0] + radiusInner * Math.cos(sector[1]);
			surface[2][1] = field.center[1] + radiusInner * Math.sin(sector[1]);
			surface[3][0] = field.center[0] + radiusExternal * Math.cos(sector[1]);
			surface[3][1] = field.center[1] + radiusExternal * Math.sin(sector[1]);
			/* var chet = Math.abs(sector[1]-sector[0])/4;
			surface[4][0] = field.center[0] + radiusExternal * Math.cos(sector[0] + chet);
			surface[4][1] = field.center[1] + radiusExternal * Math.sin(sector[0] + chet);
			surface[5][0] = field.center[0] + radiusExternal * Math.cos(sector[1] - chet);
			surface[5][1] = field.center[1] + radiusExternal * Math.sin(sector[1] - chet); */
			surface[4][0] = surface[1][0];
			surface[4][1] = surface[1][1];
			surface[5][0] = surface[3][0];
			surface[5][1] = surface[3][1];
		};
		
		this.ingoing = function(position){
			if( position[0] >= (sector[0] - otstup) && position[0] <= (sector[1] + 2*otstup) )
				if(position[1] >= radiusInner && position[1] <= radiusExternal)
					return date;
			return 0;
		}
		
		/*========================================================================================================
		* private function
		**========================================================================================================*/
		var calculationSector = function(){//
			sector[0] = startAngleDay + (date - 1) * d_angelDay + otstup;
			sector[1] = startAngleDay + date * d_angelDay - otstup;
		}.bind(this);
	};

/*===============================================================================================================
* private Class month
**===============================================================================================================*/
	function classMonth(){
		/*=======================================================================================================
		* private variables
		**=======================================================================================================*/
		var self = this;
		var color = ['#2E2E2E', '#2E2E2E'];
		var surface = [ [0, 0], [0, 0], [0, 0], [0, 0] ];//[X1,Y1], [X2,Y2], [X3,Y3], [X4,Y4]
		var sector = [0, 0]; //[phi1, phi2]
		var month = 0;//0-11
		var monthIsCurrent = false;//Является ли месяц текущим
		var name = '';
		var amountDays = 0;//Колличество дней
		var days_list = [];//Массив дней
		var d_angelMonth = 2*Math.PI/12;
		var startAngleMonth = -Math.PI/2;
		var otstup = 0.006;
		var radiusInner = field.radiusInner;
		var radiusExternal = field.radiusExternal;
		/*========================================================================================================
		* public function
		**========================================================================================================*/
		this.init = function(attributes, dow){//attributes[0-2] - номер месяца, название месяца, количество дней в месяце соответственно, dow - день недели первого дня месяца
			month = attributes[0]; name = attributes[1]; amountDays = attributes[2];
			var dayOfWeek = dow ? dow : 7;//если день недели == 0, это воскресение, делаем его 7
			for(var i = 1; i <= amountDays; i++){
				var d = new classDay();
				d.init(i, dayOfWeek++);
				days_list.push(d);
				if( dayOfWeek > 6)	d.setColor(['#FA5858', '#610B0B']);
				if( dayOfWeek > 7)	dayOfWeek = 1;
			}
			calculationSector();
		};
		
		this.getSector = function(){
			return sector;
		};
		
		this.setCurrent = function(d){
			monthIsCurrent = true;//Этот месяц будет текущим
			radiusExternal = field.radiusMonthСurrent;//Изменить внешний радиус
			for(var day of days_list){
				day.setRadiusExternal(radiusExternal);
			}
			days_list[d-1].setCurrent();//Назначаем текущий день
		};
		
		this.isCurrent = function(){//Является ли этот месяц текущим
			return monthIsCurrent;
		};
		
		this.getRadiusInner = function(){
			return radiusInner;
		};
		
		this.getRadiusExternal = function(){
			return radiusExternal;
		};
		
		this.getName = function(){
			return name;
		};
		
		this.getType = function(){
			return 'month';
		};
		
		this.getColor = function(){
			return color;
		};
		
		this.getSurface = function(){
			return surface;
		};
		
		this.draw = function(){
			drawDay();
		};
		
		this.calculationSurface = function(){
			surface[0][0] = field.center[0] + radiusInner * Math.cos(sector[0]);
			surface[0][1] = field.center[1] + radiusInner * Math.sin(sector[0]);
			surface[1][0] = field.center[0] + radiusExternal * Math.cos(sector[0]);
			surface[1][1] = field.center[1] + radiusExternal * Math.sin(sector[0]);
			surface[2][0] = field.center[0] + radiusInner * Math.cos(sector[1]);
			surface[2][1] = field.center[1] + radiusInner * Math.sin(sector[1]);
			surface[3][0] = field.center[0] + radiusExternal * Math.cos(sector[1]);
			surface[3][1] = field.center[1] + radiusExternal * Math.sin(sector[1]);
			for(var day of days_list){
				day.calculationSurface();
			}
		};
		
		this.ingoing = function(position){//Определение попадания точки касания в день, position[0] - угол, position[1] - длина радиус-вектора
			if( position[0] >= (sector[0] - otstup) && position[0] <= (sector[1] +otstup) )
				if(position[1] >= radiusInner && position[1] <= (monthIsCurrent ? field.radiusDayСurrent : radiusExternal) ){
					for(var day of days_list){
						var d = day.ingoing(position);
						if(d){
							return [d, name];
						}
					}
				}
			return 0;
		};
		
		/*========================================================================================================
		* private function
		**========================================================================================================*/
		var calculationSector = function(){//
			sector[0] = startAngleMonth + month * d_angelMonth + otstup;
			sector[1] = startAngleMonth + (month +1) * d_angelMonth - otstup;
			
			var d_angelDay = Math.abs(sector[0] - sector[1])/amountDays;
			for(var day of days_list){
				day.setStartAngleDay(sector[0]);
				day.set_d_angelDay(d_angelDay);
			}
		}.bind(this);
		var drawDay = function(){//
			for(var day of days_list){
				draw(day);
			}
			/* draw(days_list[days_list.length-1]);
			draw(days_list[0]); */
		}.bind(this);
	};

/*===============================================================================================================
* private Class year
**===============================================================================================================*/
	function classYear(){
		/*=======================================================================================================
		* private variables
		**=======================================================================================================*/
		var self = this;
		var now;
		var year;
		var months = [ [0, 'Январь', 31], [1, 'Февраль', 28], [2, 'Март', 31],
					[3, 'Апрель', 30], [4, 'Май', 31], [5, 'Июнь', 30],
					[6, 'Июль', 31], [7, 'Август', 31], [8, 'Сентябрь', 30],
					[9, 'Октябрь', 31], [10, 'Ноябрь', 30], [11, 'Декабрь', 31] ];
		var months_list = [];//Массив месяцев
		/*========================================================================================================
		* public function
		**========================================================================================================*/
		this.init = function(){
			now = new Date();
			year = now.getFullYear();
			if( (year % 4 == 0) && (year % 100 != 0 || year % 400 == 0)){//Если год високосный
				//amount_of_days = 366;
				months[1][2] = 29;//в феврале будет 29 дней
			}
			for(var i = 0; i < 12; i++){//инициализация месяцев
				var m = new classMonth();
				m.init(months[i],new Date(year, i, 1).getDay() );
				months_list.push(m);
			}
			months_list[now.getMonth()].setCurrent(now.getDate());//Установка текущих месяца и дня
			for(var mon of months_list){
				mon.calculationSurface();
			}
		};
		
		this.draw = function(){
			drawMonath();
		};
		
		this.ingoing = function(position){//Определение попадания точки касания в месяц
			var katx = field.center[0] - position[0]; //катет по ОХ от центра поля
			var katy = field.center[1] - position[1]; //катет по ОУ от центра поля
			var angle = Math.atan( katy/katx ); // угол (меж радиус-вектором точки касания от центра поля и ОХ) = арктангенс(такетОУ / катетОХ)
			if( field.center[0] > position[0] ) //т.к. арктангенс возвращает угол от -Пи/2 до Пи/2, получается вырождение
				angle = Math.PI + angle;		//что бы его снять, в левой полуоси ОХ относительно центра добавляем Пи
			var hyp = Math.hypot(katx, katy);//длина радиус-вектора от центра поля до точки касания
			for(var mon of months_list){
				var dm = mon.ingoing([angle, hyp]);//В случае попадания вернёт массив [0] - день, [1] - название месяца
				if(dm){
					console.log( dm[0] + "." +dm[1] + "." + year);
					break;
				}
			}
		}
		/*========================================================================================================
		* private function
		**========================================================================================================*/
		var drawMonath = function(){//
			for(var mon of months_list){
				mon.draw();
				draw(mon);
			}
			/* draw(months_list[0]);
			months_list[0].draw(); */
		}.bind(this);
	};

/*===============================================================================================================
* public function
**=================================================================================================================*/
	self.init = function() {
		//dates.init();
		field.init();
		
		canva = $("#field")[0];
		canva.width = field.fWidth;
		canva.height = field.fHeight;
		ctx = canva.getContext('2d');
		clear();
		year = new classYear();
		year.init();
		year.draw();
	};

	self.events = function(eve, data){
		switch(eve){
			case "pause": 
				break;
			case "mousemove": 
				break;
			case "mouseClick": 
				year.ingoing(data);
				drawPunkt(data);
				break;
			default: break;
		}
	}

/*===============================================================================================================
* private function
**=================================================================================================================*/
	clear = function() {
		ctx.clearRect(0, 0, field.fWidth, field.fHeight)
		ctx.fillStyle = color.ground; // меняем цвет
		ctx.fillRect(0, 0, field.fWidth, field.fHeight);//Закрашиваем область
		ctx.fill();
	};

	draw = function(obj){
		var surface = obj.getSurface();
		var re = field.radiusExternal;
		var lw = 0;
		/*createRadialGradient(X_star, Y_start, Radius_inner, X_end, Y_end, Radius_external)*/
		var grdr = ctx.createRadialGradient(field.center[0],field.center[1],field.radiusInner, field.center[0], field.center[1], field.radiusDayСurrent);
		grdr.addColorStop( 0, obj.getColor()[0] );//Color_start
		grdr.addColorStop( 1, obj.getColor()[1] );//Color_end
		ctx.strokeStyle = grdr; // меняем цвет
		switch(obj.getType()){
			case 'day': lw = 1;
						/* if( obj.isCurrent() ){
							re = field.radiusDayСurrent;
						} */
				break;
			case "month": lw = 2;
						/* if( obj.isCurrent() ){
							re = field.radiusMonthСurrent;
						} */
				break;
			default: break;
		}
		for(var i = 0; i < surface.length; i += 2){
			ctx.beginPath();
				ctx.moveTo( surface[i][0], 		surface[i][1] );
				ctx.lineTo( surface[i+1][0], 	surface[i+1][1] );
			ctx.closePath();
			ctx.lineWidth = lw;
			ctx.stroke();
		}
		//Первая линия  - начало объекта
		/* ctx.beginPath();
			ctx.moveTo( surface[0][0], 	surface[0][1] );
			ctx.lineTo( surface[1][0], 	surface[1][1] );
		ctx.closePath();
		ctx.lineWidth = lw;
		ctx.stroke();
		//Вторая линия - конец объекта
		ctx.beginPath();
			ctx.moveTo( surface[2][0], 	surface[2][1] );
			ctx.lineTo( surface[3][0], 	surface[3][1] );
		ctx.closePath();
		ctx.lineWidth = lw;
		ctx.stroke(); */
	};

	drawPunkt = function(punkt){
		ctx.fillStyle = color.selObj; // меняем цвет
		ctx.fillRect(punkt[0]-2, punkt[1]-2, 2, 2);//Закрашиваем область
		ctx.fill();
	};

})( this.engin = {});