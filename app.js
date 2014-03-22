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
		render: function() {
			courses.each(function(subject) {
				$(this.el).append('<li class="subject">'+subject.get('subject')+'</li>');
				subjectCourses = new CourseList();
				subjectCourses.add(subject.get('courses'));
				subjectCourses.each(function(course) {
					item = $('<li class="courseItem">'+course.get('name')+'</li>');
					item.data('subject',subject.get('subject'));
					$(this.el).append(item);
				},this)
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
			'drop .dragOver': 'updateNumbers'
		},
		updateNumbers: function(e) {
			if($(e.currentTarget).attr('class').split(" ")[0]!='filled') {
				creditsCell = '.credits-' + $(e.currentTarget).data('row');
				yearsCell = '.years-' + $(e.currentTarget).data('row');
				$(creditsCell).data('creditsSoFar',$(creditsCell).data('creditsSoFar')+10);
				$(yearsCell).data('yearsSoFar',$(yearsCell).data('yearsSoFar')+1);
				$(creditsCell).html($(creditsCell).data('creditsSoFar')+' / '+$(creditsCell).data('creditsNeeded'));
				$(yearsCell).html($(yearsCell).data('yearsSoFar')+' / '+$(yearsCell).data('yearsNeeded'));
			}
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
					cell.data("subject",subject.get('subject'));
					cell.data("row",rowInd);
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

	// binded events need to be moved to view events

	var beingDragged;
	var dropTarget;

	$('[draggable]').bind('dragstart', function(e) {
		beingDragged = this;
	}).bind('dragend', function(e) {
		if($(this).data('subject') == $(dropTarget).data('subject')) {
			$(dropTarget).html($(this).html());
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
		$(this).removeClass('dragOver');
	});

});