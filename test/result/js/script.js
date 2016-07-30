$(function () {
/*------------------------------- Modal constructor -------------------*/
  var Modal = function () {
/*------------------------------- Model -------------------------------*/
  var Model = function () {
    var self = this;
    self.tempList = [];
    self.getById = function (list, id) {
      return _.find(list, function (o) {
        return o.id == id;
      });
    };
  };
/*------------------------------- View -------------------------------*/
  var View = function (model) {
    var self = this;
    function init() {
      var html = $('#modal__template').html();
      var tmpl = _.template(html);
      var modalBox = tmpl();
      $('.wrapper').append(modalBox);
    };
/* Reload left and right lists in modal window */
    self.reloadMainList = function (users) {
      var tmpl = _.template(mainListHtml);
      var list;
      if (!self.filter.isOn) {
        var list = tmpl({users: users});
      } else {
        var list = tmpl({users: self.filter.sortUsers(self.filter.value)});
      }
      mainList.html(list);
      return self;
    };
    self.reloadInvitedList = function () {
      var tmpl = _.template(invitedListHtml);
      var list = tmpl({users: model.tempList});
      invitedList.html(list);
    };
/* Takes value from search form and sorts active list */
    self.filter = {
      value: '',
      isOn: false,
      sortUsers: function (input) {
        self.filter.value = input;
        if (input.length > 0) {
          self.filter.isOn = true;
          return _.filter(model.activeList, function (o) {
            return _.toLower(o.name).indexOf(_.toLower(input)) != -1;
          });
        } else {
          self.filter.isOn = false;
          return model.activeList;
        }
      }
    };
/* Shows and hides arrows on main list entries */
    self.arrowShow = function (e) {
      var id = e.currentTarget.getAttribute('data-id');
      var current = model.getById(model.activeList, id);
      var invite = current.invite;
      if(!invite) {
        var arrow = $('<div class="arrow" data-id="' + id + '"><i class="fa fa-arrow-right" aria-hidden="true"></i></div>');
        $(this).append(arrow);
      }
    };
    self.arrowRemove = function (e) {
      $(this).find('.arrow').remove();
    };
/* Shows and hides crosses on invited list entries */
    self.crossShow = function (e) {
      var id = e.currentTarget.getAttribute('data-id');
      var cross = $('<div class="cross" data-id="' + id + '"><i class="fa fa-times" aria-hidden="true"></i></div>');
      $(this).append(cross);
    };
    self.crossRemove = function (e) {
      $(this).find('.cross').remove();
    };
/* Shows and hides tooltips */
    self.tooltipMainShow = function (e) {
      var parent = $(this).closest('.main-list__entry');
      var id = parent.attr('data-id');
      var current = model.getById(model.activeList, id);
      if (!current.invite) {
        var tooltip = $('<div class="tooltip"><div class="tooltip__inner"></div></div>');
        for (i = 0; i < current.streams.length; i++) {
          tooltip.find('.tooltip__inner').append($('<p class="tooltip__entry">' + current.streams[i] + '<p>'));
        };
        if (($(this).closest('.main-list__entry').position().top - (current.streams.length*16 + 10)) <= 0) {
          tooltip.addClass('tooltip--bottom');
        } else {
          tooltip.addClass('tooltip--top');
        };
        $(this).append(tooltip);
      }
    };
    self.tooltipInvitedShow = function (e) {
      var parent = $(this).closest('.invited-list__entry');
      var id = parent.attr('data-id');
      var current = model.getById(model.tempList, id);
      var tooltip = $('<div class="tooltip"><div class="tooltip__inner"></div></div>');
      for (i = 0; i < current.streams.length; i++) {
        tooltip.find('.tooltip__inner').append($('<p class="tooltip__entry">' + current.streams[i] + '<p>'));
      };
      if (($(this).closest('.invited-list__entry').position().top - (current.streams.length*16 + 10)) <= 0) {
        tooltip.addClass('tooltip--bottom');
      } else {
        tooltip.addClass('tooltip--top');
      };
      $(this).append(tooltip);
    };
    self.tooltipRemove = function (e) {
      $(this).find('.tooltip').remove();
    };
/* Initiated modal and caches templates and DOM-nodes */
    init();
    var mainList = $('.users__list__main');
    var mainListHtml = $('#modal__main-list__template').html();
    var invitedList = $('.users__list__invited');
    var invitedListHtml = $('#modal__invited-list__template').html();
  };
/*------------------------------- Conroller ---------------------------*/
  var Controller = function (model, view) {
    var self = this;
/* First lists taken with an AJAX GET-request in JSON format from a folder */
    function getUsers() {
      $.getJSON('js/friends.json', function (friends) {
        model.friends = friends;
        $.getJSON('js/stream_participants.json', function (stream_participants) {
          model.stream_participants = stream_participants;
          model.activeList = model.friends;
          view.reloadMainList(model.activeList).reloadInvitedList();
        })
      });
    };
/* On each key press in search form filters active list and reloads it */
    var filterForm = $('#users__filter');
    filterForm.keyup(function (e) {
      var input = this.value;
      var filteredList = view.filter.sortUsers(input);
      view.reloadMainList(filteredList);
    });
/* Adds events listeners for arrows, crosses, tooltips in main and invited lists */
    var mainList = $('.users__list__main');
    mainList.on('mouseenter', '.main-list__entry', view.arrowShow)
            .on('mouseleave', '.main-list__entry', view.arrowRemove)
            .on('click', '.arrow', function (e) {
              var id = $(this).attr('data-id');
              var current = model.getById(model.activeList, id);
              current.invite = !current.invite;
              model.tempList.push(current);
              view.reloadMainList(model.activeList).reloadInvitedList();
            })
            .on('mouseenter', '.list__entry__inner__streams', view.tooltipMainShow)
            .on('mouseleave', '.list__entry__inner__streams', view.tooltipRemove);;
    var invitedList = $('.users__list__invited');
    invitedList.on('mouseenter', '.invited-list__entry', view.crossShow)
               .on('mouseleave', '.invited-list__entry', view.crossRemove)
               .on('click', '.cross', function (e) {
                  var id = e.currentTarget.getAttribute('data-id');
                  var current = model.getById(model.stream_participants, id) || model.getById(model.friends, id);
                  current.invite = !current.invite;
                  _.remove(model.tempList, function (o) {
                    return o.id == current.id;
                  });
                  view.reloadMainList(model.activeList).reloadInvitedList();
                })
                .on('mouseenter', '.list__entry__inner__streams', view.tooltipInvitedShow)
                .on('mouseleave', '.list__entry__inner__streams', view.tooltipRemove);
/* Adds events listeners for the footer buttons. Switches active list. Closes modal and adds "start" button after it */
    var footer = $('.modal__footer');
      footer.on('click', '.btn--user-type:not(.btn--user-type__active)', function (e) {
                var list = e.currentTarget.getAttribute('data-list');
                model.activeList = model[list];
                view.reloadMainList(model.activeList);
                footer.find('.btn--user-type').toggleClass('btn--user-type__active');
              })
              .on('click', '.btn__modal-submit', function (e) {
                $('.modal__overlay').remove();
                addInviteButton();
              });
/* AJAX request for users lists */
    getUsers();
  };
/* Modal constructor returns an object with one publec method */
    return {
      show: function () {
        var model = new Model();
        var view = new View(model);
        var controller = new Controller(model, view);
      }
    };
  };
/*------------------------------- End of Modal constructor -----------*/
/* This func adds a "start" button */
  function addInviteButton() {
    var btn__invite = $('<button class="btn center" id="btn__invite">Пригласить</button>');
    btn__invite.one('click', modalShow);
    $('.wrapper').append(btn__invite);
  };
/* This func initiates and shows a modal window */
  function modalShow() {
    $(this).remove();
    var modal = new Modal;
    modal.show();
  };
/* Adding a start button on the page */
  addInviteButton();
});
