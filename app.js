$(function() {

	var Subject = Backbone.Model.extend({
		defaults: {
			subject: null,
			credits: null,
			years: null,
			courses: [
			{
				name: null,
				subject: null,
				grades: null,
				rec: null, // recommended
				uc: null // uc/csu requirement
			}
			]
		}
	});

	var CourseList = Backbone.Collection.extend({
		model: Subject,
		url: './courses.json'
	});

	var courses = new CourseList();
	courses.fetch({async:false});

	var CourseListView = Backbone.View.extend({
		el: $('.course-list'),
		initialize: function() {
			_.bindAll(this,'render');
			this.render();
		},
		events: {
			'click .subject': 'expandList'
		},
		expandList: function(e) {
			$(e.currentTarget.nextSibling).slideToggle();
			if($(e.currentTarget.firstChild).attr('class').split(" ")[2]=='fa-rotate-90')
				$(e.currentTarget.firstChild).removeClass('fa-rotate-90');
			else
				$(e.currentTarget.firstChild).addClass('fa-rotate-90');
		},
		render: function() {
			ind = 0;
			courses.each(function(subject) {
				$(this.el).append('<li class="subject"><i class="fa fa-caret-right"></i>'+subject.get('subject')+'</li>');
				subjectCourses = new CourseList();
				subjectCourses.add(subject.get('courses'));
				subjectCourseList = $('<ul class="course-list courses-'+ind+'"></ul>');
				subjectCourses.each(function(course) {
					item = $('<li class="courseItem">'+course.get('name')+'</li>');
					item.data('subject',subject.get('subject'));
					$(subjectCourseList).append(item);
				},this);
				$(this.el).append(subjectCourseList);
				$(subjectCourseList).hide();
				ind++;
			},this);
			$(this.el).find('.courseItem').prop('draggable',true);
		}
	});

	var list = new CourseListView();

	var CourseTable = Backbone.View.extend({
		el: $('.course-table'),
		initialize: function() {
			_.bindAll(this,'render');
			this.render();
		},
		events: {
			'drop td': 'incrementNumbers',
			'click .x': 'decrementNumbers',
		},
		incrementNumbers: function(e) {
			if($(e.currentTarget).attr('class').split(" ")[0]!='filled' && 
				$(e.currentTarget).attr('class').split(" ")[1]!='filled' &&
				$(e.currentTarget).data('subject')==$(beingDragged).data('subject')) {
				creditsCell = '.credits-' + $(e.currentTarget).data('row');
				yearsCell = '.years-' + $(e.currentTarget).data('row');
				$(creditsCell).data('creditsSoFar',$(creditsCell).data('creditsSoFar')+10);
				$(yearsCell).data('yearsSoFar',$(yearsCell).data('yearsSoFar')+1);
				this.updateNumbers(creditsCell,yearsCell);
			}
		},
		decrementNumbers: function(e) {
			creditsCell = '.credits-' + $(e.currentTarget.parentNode).data('row');
			yearsCell = '.years-' + $(e.currentTarget.parentNode).data('row');
			$(creditsCell).data('creditsSoFar',$(creditsCell).data('creditsSoFar')-10);
			$(yearsCell).data('yearsSoFar',$(yearsCell).data('yearsSoFar')-1);
			this.updateNumbers(creditsCell,yearsCell);
			this.removeCourse(e);
		},
		updateNumbers: function(creditsCell,yearsCell) {
			$(creditsCell).html($(creditsCell).data('creditsSoFar')+' / '+$(creditsCell).data('creditsNeeded'));
			if($(creditsCell).data('creditsSoFar') >= $(creditsCell).data('creditsNeeded'))
				$(creditsCell).addClass('good');
			else
				$(creditsCell).removeClass('good');
			$(yearsCell).html($(yearsCell).data('yearsSoFar')+' / '+$(yearsCell).data('yearsNeeded'));
			if($(yearsCell).data('yearsSoFar') >= $(yearsCell).data('yearsNeeded'))
				$(yearsCell).addClass('good');
			else
				$(yearsCell).removeClass('good');
		},
		removeCourse: function(e) {
			cell = e.currentTarget.parentNode;
			$(cell).removeClass('filled');
			$(cell).addClass('empty');
			$(cell).html($(cell).data('subject'));
		},
		markDroppable: function() {

		},
		render: function() {
			rowInd = 0;
			courses.each(function(subject) {
				row = $('<tr></tr>');
				years = subject.get('years');
				credits = subject.get('credits');
				needed = years>credits/10 ? years-1 : credits/10-1;
				if(subject.get('subject')=="Social Science")
					needed++;
				for(i=0;i<4;i++) {
					cell = $('<td class="empty"><div>'+subject.get('subject')+'</div></td>');
					cell.data('subject',subject.get('subject'));
					cell.data('row',rowInd);
					if(i>needed || i==0 && subject.get('subject')=="Social Science") {
						cell.addClass('unneeded');
					}
					row.append(cell);
				}
				cCell = $('<td class="credits-'+rowInd+'"></td>');
				cCell.data('creditsSoFar',0)
				cCell.data('creditsNeeded',subject.get('credits'));
				cCell.html(cCell.data('creditsSoFar')+' / '+cCell.data('creditsNeeded'));
				row.append(cCell);
				rCell = $('<td class="years-'+rowInd+'">0 / '+subject.get('years')+'</td>');
				rCell.data('yearsSoFar',0);
				rCell.data('yearsNeeded',subject.get('years'));
				rCell.html(rCell.data('yearsSoFar')+' / '+rCell.data('yearsNeeded'));
				row.append(rCell);
				$(this.el).append(row);
				rowInd++;
			},this);
		}
	});

	var table = new CourseTable();

	// binded events need to be moved to CourseTable View events

	var beingDragged;
	var dropTarget;

	$('[draggable]').bind('dragstart', function(e) {
		beingDragged = this;
	}).bind('dragend', function(e) {
		if($(this).data('subject') == $(dropTarget).data('subject')) {
			$(dropTarget).html('<span class="x"></span>'+$(this).html());
			$(dropTarget).removeClass('empty');
			$(dropTarget).removeClass('dragOver');
			$(dropTarget).addClass('filled');
		}
	});

	$('.empty').bind('dragover', function(e) {
		e.preventDefault ? e.preventDefault() : e.returnValue = false; 
		dropTarget = this;
		if($(this).data('subject') == $(beingDragged).data('subject'))
			$(this).addClass('dragOver');
	}).bind('dragenter', function(e) {
		e.preventDefault ? e.preventDefault() : e.returnValue = false; 
		dropTarget = this;
		if($(this).data('subject') == $(beingDragged).data('subject'))
			$(this).addClass('dragOver');
	}).bind('dragleave', function(e) {
		$(this). removeClass('dragOver');
	});

});