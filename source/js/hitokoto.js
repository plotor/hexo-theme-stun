(function () {
  var Stun = window.Stun || {};

  Stun.hitokoto = {
    _timer: null,
    _loading: false,

    _typeText: function (el, text, callback) {
      var i = 0;
      el.textContent = '';
      el.classList.add('hitokoto-typing');

      this._timer = setInterval(function () {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(Stun.hitokoto._timer);
          Stun.hitokoto._timer = null;
          el.classList.remove('hitokoto-typing');
          if (typeof callback === 'function') callback();
        }
      }, 80);
    },

    init: function () {
      var config = CONFIG.hitokoto;
      if (!config || !config.enable) return;
      if (this._loading) return;

      var $subtitle = document.querySelector('.hitokoto-subtitle');
      var $source = document.querySelector('.header-banner-info__subtitle-source');
      if (!$subtitle) return;

      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }

      var url = 'https://v1.hitokoto.cn/?encode=json';
      if (config.category) {
        var categories = config.category;
        if (typeof categories === 'string') {
          categories = categories.split(',');
        }
        categories.forEach(function (c) {
          url += '&c=' + c.trim();
        });
      }
      if (config.maxLength) {
        url += '&max_length=' + config.maxLength;
      }

      $subtitle.textContent = '';
      $subtitle.classList.remove('hitokoto-typing');
      if ($source) {
        $source.textContent = '';
        $source.classList.remove('hitokoto-source-visible');
      }

      this._loading = true;

      fetch(url)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          Stun.hitokoto._loading = false;
          var text = data.hitokoto || '';
          var from = data.from || '';
          var fromWho = data.from_who || '';

          Stun.hitokoto._typeText($subtitle, text, function () {
            if ($source && config.showSource) {
              var sourceParts = [];
              if (fromWho) sourceParts.push(fromWho);
              if (from) sourceParts.push(from);
              if (sourceParts.length > 0) {
                $source.textContent = '—— ' + sourceParts.join(' · ');
                $source.classList.add('hitokoto-source-visible');
              }
            }
          });
        })
        .catch(function () {
          Stun.hitokoto._loading = false;
          $subtitle.textContent = '';
        });
    }
  };

  window.Stun = Stun;
})();
