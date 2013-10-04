
function printObject(object) {
	var output = '';
	for (property in object) {
	  output += property + ': ' + object[property]+'; ';
	}
}


$(function() {
	
	/**
	  *  ARTICLE MODEL, LIST, VIEW
	  * 
	  **/
	var inCryptMode = false;

	var Article = Backbone.Model.extend({
		
		defaults : function() {
			return {
				sectionID : 22,
				content: '',
				isHTML: 0
			}
		},
				
		url: function() {
			var base = this.urlRoot || (this.collection && this.collection.url) || "/";
			if (this.isNew()) return base;
			return base + "&id=" + encodeURIComponent(this.id);
		},
		
		clear: function() {
			this.destroy();
		}
		
	});
	
	///////////////////////////////////////////////////////////////////////////////////
	
	
	var ArticlePages = Backbone.Paginator.requestPager.extend({
			
			model: Article,
			
			url: 'server/data.php?collection=articles&',
			
			paginator_core: {
				type: 'GET',
				dataType: 'json',
				url: 'server/data.php?collection=articles&'
			},
			
			paginator_ui: {
				firstPage: 0,
				currentPage: 0,
				perPage: 10, 
				totalPages: 10
			},
			
			morePages: true,
			
			server_api: {
				'top': function() { return this.perPage },
				'skip': function() { return this.currentPage * this.perPage },                                   
			},
			
			parse: function(resp, xhr) {
		      	this.totalPages = Math.floor((resp[resp.length -1] / this.perPage));
		      	resp.pop();
		      	if(this.currentPage == this.totalPages) {
		      		this.morePages = false;
		      	}
		      	return resp;
		    }
			
	});
	
	var Articles = new ArticlePages();
	
	
	///////////////////////////////////////////////////////////////////////////////////
	
	var mouseOverArticle = false;
	var mouseOverControls = false;
	
	var ArticleView = Backbone.View.extend({
		
		tagName : 'article',
						
		saving: false,
		
		editing: false,
						
		template: _.template($('#article-template').html()),
		
		events : {
			'click .delete-article-btn' : 'clear',
			'click div[contentEditable="true"]' : 'editableClick',
			'click .editing-overlay' : 'exitEdit',
			'click .html-toggle' : 'toggleHTML',
			'mouseenter .editable' : 'editableOver',
			'mouseleave .editable' : 'editableLeave',
			'mouseenter .article-controls' : 'controlsOver',
			'mouseleave .article-controls' : 'controlsLeave'
		},
		
		editableClick : function(e) {
			if($(e.target).hasClass('editable')) {
				var rootEdit = $(e.target);
				this.edit(rootEdit);			
			} else {
				var rootEdit = $(e.target).closest('.editable');
				this.edit(rootEdit);
			}
		},
		
		edit : function(rootEdit) {
			if(!rootEdit.hasClass('editing')) {
				rootEdit.addClass('editing');
				rootEdit.css({'z-index':100});
				rootEdit.siblings('.editing-overlay').show();
				App.editing = true;
				var cid = rootEdit.attr("data-id");
				var model = Articles.getByCid(cid);
				var isHTML = model.get('isHTML');
				if(isHTML == 1) {
					//console.log('isHTML true');
					var encodedHTML = $('<div/>').text(rootEdit.html());
					rootEdit.html(encodedHTML);
				}
			}
		},
		
		exitEdit: function(e) {
			this.editing = false;
			var cid = $('.editing').attr("data-id");
			var model = Articles.getByCid(cid);
			if(!model) {
				alert('Error: entry not found. Please refresh your browser');
			}
			var isHTML = model.get('isHTML');
			if(isHTML == 1 ) {
				var newContent = $('.editing').text();
				$('.editing').html(newContent);
				model.set({content: newContent});
			} else {
				var newContent = $('.editing').html();
				model.set({content: newContent});	
			}
			model.save();
			$('.editing-overlay').hide();
			$('.editing').css({'z-index':0});
			$('.editing').removeClass('editing');
		},
		
		toggleHTML : function(e) {
			$(e.target).css({'background': 'red'});
			var cid = $(e.target).parent().siblings('.editable').attr("data-id");
			var model = Articles.getByCid(cid);
			var isHTML = model.get('isHTML');
			setTimeout(function() {
				if(isHTML == 1) {
					model.set({isHTML: 0});
				} else {
					model.set({isHTML: 1});
				}
				model.save();
			}, 200)
			
		},
				
		mouseOverTimeout : function() {
			setTimeout( function() {
				if(!mouseOverArticle && !mouseOverControls) {
					$('.mouseover').removeClass('mouseover');
					$('.visible').removeClass('visible');
				}
			}, 1);
		},
		
		editableOver : function(e) {
			if($('.mouseover').length != 0) {
				$('.visible').removeClass('visible');
				$('.mouseover').removeClass('mouseover');
			}	
			$(e.currentTarget).siblings('.article-controls').addClass('visible');
			$(e.currentTarget).addClass('mouseover');
			mouseOverArticle = true;
		},
		
		editableLeave : function(e) {
			mouseOverArticle = false;
			this.mouseOverTimeout();
		},
		
		controlsOver : function(e) {
			mouseOverControls = true;
		},
		
		controlsLeave : function(e) {
			mouseOverControls = false;
			this.mouseOverTimeout();
		},
		
		initialize : function() {
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);
		},
		
		
		render : function() {
			var jsonModel = this.model.toJSON();
			jsonModel.cid = this.model.cid;
			jsonModel.inCryptMode = inCryptMode;
			var rendered = this.template(jsonModel);
			this.$el.html(rendered);
			return this;
		},
		
		clear : function() {
			var answer = confirm ("Are you sure you want to delete this article?");
			if (answer) {
				this.model.clear();
			}
			
		}
		
	});
	
	
	
	/**
	  *  APPLICATION VIEW
	  * 
	  **/
	
	var AppView = Backbone.View.extend({
	
	
		el : $('#app'),
		
		events: {
			'click #add-article' : 'createArticle',
			'click #crypt-mode' : 'cryptMode',
			'click a.show-more' : 'nextResults'
		},
		
		initialize: function() {
			this.main = $('#main');
			Articles.bind('add', this.addOneArticle, this);
			Articles.bind('addnew', this.addNewArticle, this);

			Articles.pager({
				add: true,
		        error:function(response, xhr){
		            //console.log('Error during fetch: '+response);
		        },
		        success:function(){
		        	$('.loading').css({display:'none'});
					if(Articles.morePages == false) {
						$('.show-more').hide();
					}
		            //console.log("Successful fetch");
		        }
		    });
		},
		
		nextResults: function (e) {
			e.preventDefault();
			Articles.requestNextPage({
				add: true,
		        error:function(response, xhr){
		            //console.log('Next page: error during fetch: '+response);
		        },
		        success:function(){
		        	$('.loading').css({display:'none'});
					if(Articles.morePages == false) {
						$('.show-more').hide();
					}
		            //console.log("Next page: successful fetch");
		        }
		    });
		},

		createArticle: function() {
			Articles.create({}, {newmodel:true});
		},
		
		addOneArticle: function(article) {
			//console.log('Adding 1 model');
			var view = new ArticleView({model: article});
			this.$('#main section').append(view.render().el);
		},
		
		
		addNewArticle: function(article) {
			var view = new ArticleView({model: article});
			this.$('#main section').prepend(view.render().el);
		},
		
		
		cryptMode: function(e) {
			if( !inCryptMode ) {
				  $('body article .editable').removeClass('decrypted');
				  $('#crypt-mode').removeClass('unlocked');
				  inCryptMode = true;
			} else {
				  $('body article .editable').addClass('decrypted');
				  $('#crypt-mode').addClass('unlocked');
				  inCryptMode = false;
			}
			
		}
	
	
	});
	
	var App = new AppView;

});