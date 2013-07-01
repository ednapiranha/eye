define(['jquery', 'moment'],
  function($, moment) {
  'use strict';

  var body = $('body');

  var generatePost = function (post, admin, isSubscription) {
    var isPrivate = '';
    var shared = '';
    var permalink = '';
    var isAdmin = '';
    var location = '';
    var urls = [];

    var breakify = function (text) {
      return text.replace(/[\n]/gi, '<br>');
    };

    if (post.meta.isPrivate) {
      isPrivate = 'private';
    }

    if (post.content.urls) {
      for (var i = 0; i < post.content.urls.length; i ++) {
        var url = post.content.urls[i];

        var result = '<a class="image" title="' +
          url.title + '">' +
          '<img src="' + url.url + '"></a>';

        urls.push('<li>' + result + '</li>');
      }
    }

    if (urls) {
      urls = '<ul class="links">' + urls.join('') + '</ul>';
    }

    if (admin) {
      isAdmin = '<a href="/edit/' + post.id + '" title="Edit">E</a>' +
        '<a href="javascript:;" data-url="/delete/' + post.id +
        '" data-action="delete-post" title="Delete">D</a>';
    }

    permalink = '<a href="javascript:;" ' +
      'data-action="get-post" data-url="/post/' + post.id + '" ' +
      'class="permalink" title="Permalink">P</a>';

    if (post.meta.location) {
      post.meta.location = post.meta.location.replace(/\s/gi, '');
      location = '<a href="https://maps.google.com/maps?ll=' + post.meta.location + '" ' +
        'target="_blank" title="' + post.meta.location + '" class="location"></a>';
    }

    return $('<article id="post_' + post.id + '" class="article ' +
      isPrivate + '">' + urls +
      '<div class="actions">' + isAdmin + permalink + shared + '</div>' + location +
      '</article>' + '<p>' + breakify(post.content.message) + '</p>');
  };

  var getRecent = function (paginated) {
    var prev;
    var next;
    var start = document.location.search.split('start=')[1] || 0;

    if (paginated) {
      if (paginated.hasClass('prev')) {
        start = parseInt(paginated.attr('data-prev'), 10);
      } else {
        start = parseInt(paginated.attr('data-next'), 10);
      }
    }

    $.getJSON('/all', {
      start: start
    }, function (data) {
      if (data.posts) {
        history.pushState(data.posts, 'posts', '/?start=' + start);
        body.find('.messages').empty();

        for (var i = 0; i < data.posts.length; i ++) {
          body.find('.messages').append(generatePost(data.posts[i], data.isAdmin, false));
        }

        var next = body.find('.pagination .next');

        if (data.next !== false) {
          next.attr('href', '/all?start=' + data.next)
              .removeClass('hidden');
        } else {
          next.addClass('hidden');
        }

        var prev = body.find('.pagination .prev');

        if (data.prev !== false) {
          prev.attr('href', '/all?start=' + data.prev)
              .removeClass('hidden');
        } else {
          prev.addClass('hidden');
        }

        body[0].scrollIntoView(true);

        body.find('.pagination a').attr('data-prev', data.prev)
                                  .attr('data-next', data.next);
      }
    });
  };

  var self = {
    getAll: function () {
      getRecent();
    },

    getPaginated: function (self) {
      getRecent(self);
    },

    getOne: function (self) {
      $.getJSON(self.data('url'), function (data) {
        if (data.post) {
          var dateInfo = '<p class="created">' + moment.unix(data.post.content.created).fromNow() + '</p>';
          history.pushState(data.post, 'post ' + data.post.id, '/post/' + data.post.id);
          body.attr('data-page', 'post')
              .attr('data-url', '/post/' + data.post.id);
          body.find('.messages').html(generatePost(data.post, data.isAdmin, false)).append(dateInfo);
          body.find('.pagination a').addClass('hidden');
          body[0].scrollIntoView(true);
        }
      });
    },

    deleteOne: function (self) {
      $.post(self.data('url'), function (data) {
        self.closest('article').addClass('hidden');
      });
    }
  };

  return self;
});
