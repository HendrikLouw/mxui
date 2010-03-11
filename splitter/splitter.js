steal.plugins('jquery/controller','jquery/event/drag/limit','jquery/dom/dimensions').then(function($){
	
	
	$.Controller.extend("Phui.Splitter",
	{
		defaults : {
			child_class_names : "split",
			active : "active",
			types : [],
			hover : "split-hover",
			splitter : "splitter"
		},
		listensTo : ["insert","remove"]
	},
	{
		init : function(){
			//determine if horizontal or vertical ...
			this.element.mixin.apply(this.element, this.options.types).css("overflow","hidden")
			//insert splitter
			var c = this.element.children(":visible"), splitters = c.length - 1;
			for(var i=0; i < c.length - 1; i++){
				$(c[i]).after("<div class='hsplitter'/>")
			}
			var splitterHeight = this.element.children(".hsplitter").outerHeight()
			//size everything
			var total  = this.element.height() - splitterHeight* splitters;
			for(var i=0; i < c.length; i++){
				var $c = $(c[i]);
				var cheight = $c.outerHeight();
				if(cheight > total){
					cheight = total;
				}
				$c.height(cheight).addClass("split");
				total = total - cheight;
			}
			//space guys accordingly	
		},
		".hsplitter mouseenter" : function(el){
			el.addClass(this.options.hover)
		},
		".hsplitter mouseleave" : function(el){
			if(!this.dragging)
				el.removeClass(this.options.hover)
		},
		".hsplitter dragstart" : function(el, ev, drag){
			drag.limit(this.element)
			drag.vertical()
			drag.ghost().addClass("move").addClass(this.options.hover)
			this.dragging = true;
		},
		".hsplitter dragend" : function(el, ev, drag){
			//get top and size sibblings
			//get the difference ...
			this.dragging = false;
			
			var top = drag.movingElement.offset().top - el.offset().top || 0 ,
				prev = el.prev(),
				next = drag.movingElement.next(),
				//prevOH = prev.outerHeight(),
				prevH = prev.height()
				//nextOH = next.outerHeight(),
				nextH = next.height();
			//make sure we can't go to 0 height
			if(nextH - top < 0){
				top = nextH - top
			}
			if(prevH + top < 0){
				top = prevH + top
			}
			//do the shrinking one first
			if(top > 0){
				next.height( nextH - top)//.trigger("resize");
				prev.height( prevH + top)//.trigger("resize");
			}else{
				prev.height( prevH + top)//.trigger("resize");
				next.height( nextH - top)//.trigger("resize");
			}
		
			
			setTimeout(function(){
				prev.triggerHandler("resize")
				next.triggerHandler("resize")
			},13)
			
			//drag.movingElement.css("top","")
		},
		resize : function(el, ev){
			//if not visible do nothing
			if(!this.element.is(":visible"))
				return;
			var h = this.element.height(), w = this.element.width()
			if (this.oldHeight == h && this.oldWidth == w) {
				ev.stopPropagation();
				return;
			}
			this.oldHeight = h;
			this.oldWidth = w;
			//console.log("resizing splitter")
			//go through children and resize
			this.size()
			return;
		},
		insert : function(el, ev){
			ev.stopPropagation();
			if (ev.target.parentNode != this.element[0] ) {
				return;
			}
			var target = $(ev.target)
			if(target.hasClass('split')) return;
			target.addClass("split")
			target.before("<div class='hsplitter'/>")
			//add splitter before el
			this.size(null, true, target);
		},
		remove : function(el, ev){
			if (ev.target.parentNode != this.element[0]) {
				return;
			}
			//basically expand everyone else 
			
			
			var target = $(ev.target)
			//remove the splitter before us
			var prev = target.prev();
			if(prev.length){
				prev.remove()
			}else{
				target.next().remove()
			}
			
			this.size(this.element.children(":not(.hsplitter):visible").not(target), true )
		},
		/**
		 * Takes elements and animates them to the right size
		 * @param {Object} els
		 */
		size : function(els, animate, keep){
			els = els || this.element.children(":not(.hsplitter):visible")
			//makes els the right height
			if(keep){
				els = els.not(keep)
			}
			var splitters = this.element.children(".hsplitter"),
				splitterHeight = splitters.outerHeight(),
				total  = this.element.height() - splitterHeight* splitters.length;
			
			if(keep){
				total = total - $(keep).outerHeight();
			}
			
			//calculate current percentage of height
			var heights = [], sum = 0;
			
			for(var i =0; i < els.length; i++){
				var $c = $(els[i]), 
					height = $c.outerHeight();
				heights.push(height)
				sum += height;
			}
			var increase = total / sum, keepSized = false;
			if(increase > 0.99 && increase < 1.01) return;
			//go through and resize
			for(var i =0; i < els.length; i++){
				var $c = $(els[i]), 
					height = heights[i];
				console.log("splitter",height)
				if(animate){
					//console.log("animating", $c, Math.round(height* increase))
					
					$c.animate({outerHeight: Math.round(height* increase)}, "fast",function(){
						$(this).triggerHandler('resize');
						if(keep && !keepSized){
							keep.triggerHandler('resize')
							keepSized = true;
						}
					})
				}else{
					$c.outerHeight(height* increase).triggerHandler('resize');
				}
				
			}
			
			
			//first
		}
	})
})
