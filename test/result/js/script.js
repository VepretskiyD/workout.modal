$(function () {
  var modal = {
    getUsers: function () {
      $.getJSON('js/friends.json', function (friends) {
        modal.friends = friends;
        $.getJSON('js/stream_participants.json', function (stream_participants) {
          modal.stream_participants = stream_participants;
          modal.activeList = modal.friends;
          modal.reloadMainList(modal.activeList).reloadInvitedList();
        })
      });
    },
    show: function () {
      var html = $('#modal__template').html();
      var tmpl = _.template(html);
      var modalBox = tmpl();
      $('.wrapper').append(modalBox);
      modal.tempList = [];
      modal.mainList = $('.users__list__main');
      modal.mainListHtml = $('#modal__main-list__template').html();
      modal.invitedList = $('.users__list__invited');
      modal.invitedListHtml = $('#modal__invited-list__template').html();
      modal.footer = $('.modal__footer');
      modal.getUsers();

      modal.filterForm = $('#users__filter');
      modal.filterForm.keyup(function (e) {
        var input = this.value;
        modal.reloadMainList(modal.filter.sortUsers(input));
      });

      var arrowShow = function (e) {
        var id = e.currentTarget.getAttribute('data-id');
        var current = _.find(modal.activeList, function (o) {
          return o.id == id;
        });
        var invite = current.invite;
        if(!invite) {
          var arrow = $('<div class="arrow" data-id="' + id + '"><i class="fa fa-arrow-right" aria-hidden="true"></i></div>');
          arrow.one('click', function (e) {
            var id = $(this).attr('data-id');
            var current = _.find(modal.activeList, function (o) {
              return o.id == id;
            });
            current.invite = !current.invite;
            modal.tempList.push(current);
            modal.reloadMainList(modal.activeList).reloadInvitedList();
          });
          $(this).append(arrow);
        }
      };

      var arrowRemove = function (e) {
        $(this).find('.arrow').remove();
      };

      modal.mainList.on('mouseenter', '.main-list__entry', arrowShow)
                    .on('mouseleave', '.main-list__entry', arrowRemove);

    var crossShow = function (e) {
      var id = e.currentTarget.getAttribute('data-id');
      var cross = $('<div class="cross" data-id="' + id + '"><i class="fa fa-times" aria-hidden="true"></i></div>');
      cross.one('click', function () {
        var current = _.find(modal.stream_participants, function (o) {
          return o.id == id;
        }) || _.find(modal.friends, function (o) {
          return o.id == id;
        });
        current.invite = !current.invite;
        _.remove(modal.tempList, function (o) {
          return o.id == current.id;
        });
        modal.reloadMainList(modal.activeList).reloadInvitedList();
      });
      $(this).append(cross);
    };
    var crossRemove = function (e) {
          $(this).find('.cross').remove();
    };
      modal.invitedList.on('mouseenter', '.invited-list__entry', crossShow)
                       .on('mouseleave', '.invited-list__entry', crossRemove);
      modal.footer.on('click', '.btn--user-type:not(.btn--user-type__active)', function (e) {
        var list = e.currentTarget.getAttribute('data-list');
        modal.activeList = modal[list];
        modal.reloadMainList(modal.activeList);
        modal.footer.find('.btn--user-type').toggleClass('btn--user-type__active');
      })

      var tooltipMainShow = function (e) {
        var parent = $(this).closest('.main-list__entry');
        var id = parent.attr('data-id');
        var current = _.find(modal.activeList, function (o) {
          return o.id == id;
        });
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
      var tooltipInvitedShow = function (e) {
        var parent = $(this).closest('.invited-list__entry');
        var id = parent.attr('data-id');
        var current = _.find(modal.tempList, function (o) {
          return o.id == id;
        });
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
      var tooltipRemove = function (e) {
        $(this).find('.tooltip').remove();
      };
      modal.mainList.on('mouseenter', '.list__entry__inner__streams', tooltipMainShow)
                    .on('mouseleave', '.list__entry__inner__streams', tooltipRemove);
      modal.invitedList.on('mouseenter', '.list__entry__inner__streams', tooltipInvitedShow)
                    .on('mouseleave', '.list__entry__inner__streams', tooltipRemove);

    },
    hide: function () {
    },
    reloadMainList: function (users) {
        var tmpl = _.template(modal.mainListHtml);
        var list;
        if (!modal.filter.isOn) {
        var list = tmpl({users: users});
        } else {
        var list = tmpl({users: modal.filter.sortUsers(modal.filter.value)});
        }
        modal.mainList.html(list);
        return modal;
    },
    reloadInvitedList: function () {
      var tmpl = _.template(modal.invitedListHtml);
      var list = tmpl({users: modal.tempList});
      modal.invitedList.html(list);
    },
    filter: {
      value: '',
      isOn: false,
      sortUsers: function (input) {
        modal.filter.value = input;
        if (input.length > 0) {
          modal.filter.isOn = true;
          return _.filter(modal.activeList, function (o) {
            return _.toLower(o.name).indexOf(_.toLower(input)) != -1;
            // return _.startsWith(o.name, input) || _.startsWith(_.toLower(o.name), input);
          });
        } else {
          modal.filter.isOn = false;
          return modal.activeList;
        }
      }
    }
  }

  $('#btn__invite').click(function (e) {
    e.preventDefault();
    $(this).remove();
    modal.show();
  });

});
