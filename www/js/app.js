// Dom7
var $$ = Dom7;

// Framework7 App main instance
var app  = new Framework7({
  root: '#app', // App root element
  id: 'io.framework7.testapp', // App bundle ID
  name: 'Framework7', // App name
  theme: 'auto', // Automatic theme detection
  // App root data
  data: function () {
    return {
      user: {
        firstName: 'John',
        lastName: 'Doe',
      },
    };
  },
  // App root methods
  methods: {
    helloWorld: function () {
      app.dialog.alert('Hello World!');
    },
  },
  // App routes
  routes: routes,
  panel: {
    swipe: true,
  }
});

// Init/Create main view
var mainView = app.views.create('.view-main', {
  url: '/'
});

// create searchbar
var searchbar = app.searchbar.create({
  el: '.searchbar',
  searchContainer: '.list',
  searchIn: '.item-title',
});

var request = new XMLHttpRequest();
request.open('GET', 'https://okomemode.com/api/recipe', true);
request.responseType = 'json';

request.onload = function () {
  var data = this.response;
  var list = document.getElementById('recipe_list');

  list.innerHTML="";

  data.forEach((value) => {
    list.insertAdjacentHTML('afterbegin', 
      `<li>`+
        `<a href="/detail/${value.recipe_id}/" class="item-link item-content">`+
        `<div class="item-media"><img src="${value.hd_img}"/></div>`+
        `<div class="item-inner">`+
          `<div class="item-title-row">`+
            `<div class="item-title">${value.title}</div>`+
          `</div>`+
          `<div class="item-text">posted by</div>`+
          `<div class="item-subtitle">${value.user_name}</div>`+
        `</div>`+
        `</a>`+
      `</li>`
    );
  });

};
request.send();


// WEBへのリンク
function ChangePassword() {
  window.open("https://okomemode.com/password/reset", '_system', 'location=yes');
}

var id_val = sessionStorage.getItem("id");
function ChangeUserInfo() {
  window.open("https://okomemode.com/useredit/"+id_val, '_system', 'location=yes');
}