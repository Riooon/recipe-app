routes = [
  {
    path: '/',
    url: './index.html',
    on: {
      pageBeforeIn: function (event, page) {
        // do something before page gets into the view
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
      },
    }
  },
  {
    path: '/stock/',
    url: './pages/stock.html',
    on: {
      pageBeforeIn: function (event, page) {
        // do something before page gets into the view
        var id_val = sessionStorage.getItem("id");
        var id = JSON.parse(id_val);
        var request = new XMLHttpRequest();
        request.open('GET', 'https://okomemode.com/api/stock/'+id, true);
        request.responseType = 'json';

        request.onload = function () {
          var data = this.response;
          var stocked_recipes = document.getElementById('stocked_recipes');

          stocked_recipes.innerHTML="";

          data.recipes.forEach((value) => {
            stocked_recipes.insertAdjacentHTML('beforeend',
            `<li class="stocked_recipe_list">`+
              `<div class="item-content">`+
                `<div class="item-media"><a href="/detail/${value.recipe_id}/"><img src="https://okomemode.com/storage/img/${value.hd_img}" width="44"/></a></div>`+
                `<div class="item-inner">`+
                  '<div class="item-title-row">'+
                    `<div class="item-title">${value.title}</div>`+
                  '</div>'+
                  `<button name=${value.recipe_id} class="remove_stock col button button-fill button-round delete_stock_btn">削除する</button>`+
                '</div>'+
              '</div>'+
            '</li>'
            );
          });

          var stocked_ingredients = document.getElementById('stocked_ingredients'); 
          // stocked_ingredients.innerHTML="";

          data.ingredients.forEach((value) => {
            if(value[2]===0){
              stocked_ingredients.insertAdjacentHTML('beforeend',
              `<li>`+
                `<div class="item-content">`+
                  `<div class="item-inner">`+
                    `<div class="item-title ingredient_item">${value[0]} </div>`+
                    `<div class="item-title">${value[1]} </div>`+
                    `<div class="item-title">個 </div>`+
                  '</div>'+
                '</div>'+
              '</li>'
              );
            }
            if(value[2]===1){
              stocked_ingredients.insertAdjacentHTML('beforeend',
              `<li>`+
                `<div class="item-content">`+
                  `<div class="item-inner">`+
                    `<div class="item-title ingredient_item">${value[0]} </div>`+
                    `<div class="item-title">${value[1]} </div>`+
                    `<div class="item-title">g </div>`+
                  '</div>'+
                '</div>'+
              '</li>'
              );
            }
            if(value[2]===2) {
              stocked_ingredients.insertAdjacentHTML('beforeend',
              `<li>`+
                `<div class="item-content">`+
                  `<div class="item-inner">`+
                    `<div class="item-title ingredient_item">${value[0]} </div>`+
                    `<div class="item-title">${value[1]} </div>`+
                    `<div class="item-title">ml </div>`+
                  '</div>'+
                '</div>'+
              '</li>' 
              );
            }
          });
        };
        
        request.send();

        $(document).on("click", ".delete_stock_btn", function(){
          var id_val = sessionStorage.getItem("id");
          var id = JSON.parse(id_val);
          $(this).parent().parent().parent().remove();
          $.post( "https://okomemode.com/api/remove_stock", { user_id: id, recipe_id: this.name })
          .done(function( data ) {
            app.views.main.router.refreshPage({
              reloadCurrent: true,
              ignoreCache: true,
            });
          });
        });

        $("#destroy_stock").on("click", function(){
          $.post( "https://okomemode.com/api/destroy_stock", { user_id: id })
          .done(function(data){
            var recipes = document.getElementById('stocked_recipes');
            while(recipes.lastChild){
              recipes.removeChild(recipes.lastChild);
            }
            var stocked_ingredients = document.getElementById('stocked_ingredients');
            while(stocked_ingredients.lastChild){
              stocked_ingredients.removeChild(stocked_ingredients.lastChild);
            }
            stocked_ingredients.insertAdjacentHTML('afterbegin','<li class="list-group-title">材料一覧</li>');
          });
        })

        // ログイン画面
        $$('#my-login-screen .login-button').on('click', function () {
          var email = $$('#my-login-screen [name="email"]').val();
          var password = $$('#my-login-screen [name="password"]').val();

          var formData = app.form.convertToData('#my-login-screen');
          var jsonData = JSON.stringify(formData);
            $.post( "https://okomemode.com/api/auth/login", { email: formData.email, password: formData.password })
            .done(function( data ) {

                $.ajax( {
                type: 'post',
                url: 'https://okomemode.com/api/auth/me',
                dataType: 'json',
                beforeSend: function( xhr, settings ) { xhr.setRequestHeader( 'Authorization', 'Bearer '+ data.access_token ); }
                } )
                .done( ( data ) => {
                    console.log( data );

                    var ID = "id";
                    var id_val = data.id;
                    sessionStorage.setItem(ID, JSON.stringify(id_val));
                    var NAME = "name";
                    var name_val = data.name;
                    sessionStorage.setItem(NAME, JSON.stringify(name_val));
                    var ICON = "icon";
                    var icon_val = "https://okomemode.com/storage/img/" + data.icon;
                    sessionStorage.setItem(ICON, JSON.stringify(icon_val));
                    var EMAIL = "email";
                    var email_val = data.email;
                    sessionStorage.setItem(EMAIL, JSON.stringify(email_val));
                    var LEVEL = "level";
                    var level_val = data.level;
                    sessionStorage.setItem(LEVEL, JSON.stringify(level_val));
                    // Close login screen
                    app.loginScreen.close('#my-login-screen');
                    app.views.main.router.refreshPage({
                      reloadCurrent: true,
                      ignoreCache: true,
                    });
                } )
                .fail( ( data ) => {
                    app.loginScreen.close('#my-login-screen');
                    app.views.main.router.back();
                } );
            });
        });
      },
      pageAfterIn: function (event, page) {
        var id_val = sessionStorage.getItem("id");
        if(id_val===null){
          app.loginScreen.open('#my-login-screen');
        }
        $(".login-screen-close").on("click", function(){
          app.loginScreen.close('#my-login-screen');
          app.views.main.router.back();
        });
      },
    }
  },
  {
    path: '/userpage/',
    url: './pages/userpage.html',
    on: {
      pageBeforeIn: function (event, page) {
        data = Object.keys(sessionStorage);
        data.forEach((key) => {
          if(key === "icon"){
            var icon_val = sessionStorage.getItem("icon");
            var icon = JSON.parse(icon_val);
            document.getElementById("user_icon_1").src = icon;
            document.getElementById("user_icon_2").src = icon;
          }else if(key === "level"){
            var level_val = sessionStorage.getItem("level");
            var level = JSON.parse(level_val);
            var demoGauge = app.gauge.create({
            el: '.demo-gauge',
            type: 'circle',
            value: level - Math.floor(level),
            size: 250,
            borderColor: '#2196f3',
            borderWidth: 10,
            valueText: 'Lv.'+Math.floor(level),
            valueFontSize: 41,
            valueTextColor: '#2196f3',
            labelText: '次のレベルまで '+ (level-Math.floor(level))*1000 + '経験値',
          });
          }else{
            var obj = sessionStorage.getItem(key);
            var value = JSON.parse(obj);
            element = document.getElementById("user_"+key);
            element.innerHTML = value;
          }
        });
        function ChangePassword() {
          window.open("https://okomemode.com/password/reset", '_self', 'location=yes');
        }
        // ログイン画面
        $$('#my-login-screen .login-button').on('click', function () {
          var email = $$('#my-login-screen [name="email"]').val();
          var password = $$('#my-login-screen [name="password"]').val();

          var formData = app.form.convertToData('#my-login-screen');
          var jsonData = JSON.stringify(formData);
            $.post( "https://okomemode.com/api/auth/login", { email: formData.email, password: formData.password })
            .done(function( data ) {

                $.ajax( {
                type: 'post',
                url: 'https://okomemode.com/api/auth/me',
                dataType: 'json',
                beforeSend: function( xhr, settings ) { xhr.setRequestHeader( 'Authorization', 'Bearer '+ data.access_token ); }
                } )
                .done( ( data ) => {
                    console.log( data );

                    var ID = "id";
                    var id_val = data.id;
                    sessionStorage.setItem(ID, JSON.stringify(id_val));
                    var NAME = "name";
                    var name_val = data.name;
                    sessionStorage.setItem(NAME, JSON.stringify(name_val));
                    var ICON = "icon";
                    var icon_val = "https://okomemode.com/storage/img/" + data.icon;
                    sessionStorage.setItem(ICON, JSON.stringify(icon_val));
                    var EMAIL = "email";
                    var email_val = data.email;
                    sessionStorage.setItem(EMAIL, JSON.stringify(email_val));
                    var LEVEL = "level";
                    var level_val = data.level;
                    sessionStorage.setItem(LEVEL, JSON.stringify(level_val));
                    // Close login screen
                    app.loginScreen.close('#my-login-screen');
                    app.views.main.router.refreshPage({
                      reloadCurrent: true,
                      ignoreCache: true,
                    });
                } )
                .fail( ( data ) => {
                    app.loginScreen.close('#my-login-screen');
                    app.views.main.router.back();
                } );
            });
        });
      },
      pageAfterIn: function (event, page) {
        var id_val = sessionStorage.getItem("id");
        if(id_val===null){
          app.loginScreen.open('#my-login-screen');
        }
        $(".login-screen-close").on("click", function(){
          app.loginScreen.close('#my-login-screen');
          app.views.main.router.back();
        });
        function ChangeUserInfo() {
          window.open("https://okomemode.com/useredit/"+id_val, '_system', 'location=yes');
        }
      },
    }
  },
  {
    path: '/about/',
    url: './pages/about.html',
  },
  {
    path: '/form/',
    url: './pages/form.html',
  },
  {
    path: '/overview/',
    url: './pages/overview.html',
    on: {
      pageBeforeIn: function (event, page) {
        // do something before page gets into the view
        var user_id;
        if(sessionStorage.getItem("id")===null){
          user_id = 0;
        } else {
          user_id = sessionStorage.getItem("id");
        }

        var request = new XMLHttpRequest();
        request.open('GET', 'https://okomemode.com/api/courses/'+user_id, true);
        request.responseType = 'json';

        request.onload = function () {
          var data = this.response;
          var list = document.getElementById('course_list');

          list.innerHTML="";

          data.forEach((value) => {
            list.insertAdjacentHTML('beforeend',
              `<div class="card demo-card-header-pic">`+
                `<div class="course-bg card-header align-items-flex-end" style="background-image: url('${value.image}')">${value.name}</div>`+
                `<div class="card-content card-content-padding">`+
                  `<progress id="file" value="${value.completed_lesson_num/value.lesson_num*100}" max="100"></progress>`+
                `</div>`+
                `<div class="card-footer">`+
                  `<a href="/course/${value.course_id}" class="link">コースに進む</a>`+
                `</div>`+
              `</div>`
            );
          });
        };
        request.send();
      },
    }
  },
  {
    path: '/course/:courseId',
    url: './pages/course.html',
    on: {
      pageBeforeIn: function (event, page) {
        // do something before page gets into the view
        var user_id;
        if(sessionStorage.getItem("id")===null){
          user_id = 0;
        } else {
          user_id = sessionStorage.getItem("id");
        }

        var request = new XMLHttpRequest();
        request.open('GET', 'https://okomemode.com/api/course/'+page.route.params.courseId+'/'+user_id, true);
        request.responseType = 'json';

        request.onload = function () {
          var data = this.response;
          var title = document.getElementById('course_title');
          title.innerHTML=data.name+" コース";

          var image = document.getElementById('course_bg');
          image.style.backgroundImage = `url('${data.image}')`;

          var list = document.getElementById('lesson_list');
          list.innerHTML="";

          data.lessons.forEach((value) => {
            if(value.completed===0){
              list.insertAdjacentHTML('beforeend',
                `<div class="card demo-card-header-pic">`+
                  `<div style="background-image:url(${value.hd_img})" class="course_hover course-bg card-header align-items-flex-end"><p class="completed_text display_none">コース未完了</p><span class="recipe_title">${value.name}</span></div>`+
                  `<div class="card-content card-content-padding">`+
                    `<p>${value.desc}</p>`+
                  `</div>`+
                  `<div class="card-footer">`+
                    `<a href="/detail/${value.recipe_id}/" class="link">レッスン開始！</a>`+
                  `</div>`+
                `</div>`
              );
            }
            if(value.completed===1){
              list.insertAdjacentHTML('beforeend',
                `<div class="card demo-card-header-pic">`+
                  `<div style="background-image:url(${value.hd_img})" class="course_hover course-bg card-header align-items-flex-end"><p class="completed_text display_none" style="color: tomato">コース完了！</p><span class="recipe_title">${value.name}</span></div>`+
                  `<div class="card-content card-content-padding">`+
                    `<p>${value.desc}</p>`+
                  `</div>`+
                  `<div class="card-footer">`+
                    `<a href="/detail/${value.recipe_id}/" class="link">レッスン開始！</a>`+
                  `</div>`+
                `</div>`
              );
            }
          });
        };
        request.send();

        $(document).on("touchstart", ".course_hover", function(){
            $(".completed_text").removeClass("display_none");
            $(".course_hover").addClass("course_hovered");
        });
        $(document).on("touchend", ".course_hover", function(){
            $(".completed_text").addClass("display_none");
            $(".course_hover").removeClass("course_hovered");
        });

      },
    }
  },
  // { find.html はルート（index.html）へと移行
  //   path: '/find/',
  //   url: './pages/find.html',
  //   on: {
  //         pageBeforeIn: function (event, page) {
  //           // do something before page gets into the view

  //           // create searchbar
  //           var searchbar = app.searchbar.create({
  //             el: '.searchbar',
  //             searchContainer: '.list',
  //             searchIn: '.item-title',
  //           });

  //           var request = new XMLHttpRequest();
  //           request.open('GET', 'https://okomemode.com/api/recipe', true);
  //           request.responseType = 'json';

  //           request.onload = function () {
  //             var data = this.response;
  //             var list = document.getElementById('recipe_list');

  //             list.innerHTML="";

  //             data.forEach((value) => {
  //               list.insertAdjacentHTML('afterbegin', 
  //                 `<li>`+
  //                   `<a href="/detail/${value.recipe_id}/" class="item-link item-content">`+
  //                   `<div class="item-media"><img src="${value.hd_img}"/></div>`+
  //                   `<div class="item-inner">`+
  //                     `<div class="item-title-row">`+
  //                       `<div class="item-title">${value.title}</div>`+
  //                     `</div>`+
  //                     `<div class="item-text">posted by</div>`+
  //                     `<div class="item-subtitle">${value.user_name}</div>`+
  //                   `</div>`+
  //                   `</a>`+
  //                 `</li>`
  //               );
  //             });

  //           };
  //           request.send();
  //         },
  //       }
  // },
  {
    path: '/detail/:recipeId/',
    url: './pages/detail.html',
    on: {
          pageInit: function (event, page) {
            var request = new XMLHttpRequest();
            request.open('GET', 'https://okomemode.com/api/recipe/'+page.route.params.recipeId, true);
            request.responseType = 'json';

            request.onload = function () {
              var data = this.response;
              var how_to_make = document.getElementById("how_to_make");
              how_to_make.innerHTML = data.title;

              var ingredient_list = document.getElementById('ingredient_list');
              data.ingredients.forEach((value) => {
                if(value.unit==0){
                  ingredient_list.insertAdjacentHTML('beforeend', 
                    `<li>`+
                      `<div class="item-inner item-content">`+
                        `<div class="item-title ingredient_item">${value.ingredient}</div>`+
                        `<div class="item-title">${value.amount} </div>`+
                        `<div class="item-title">個</div>`+
                      `</div>`+
                    `</li>`
                  );
                }
                if(value.unit==1){
                  ingredient_list.insertAdjacentHTML('beforeend', 
                    `<li>`+
                      `<div class="item-inner item-content">`+
                        `<div class="item-title ingredient_item">${value.ingredient}</div>`+
                        `<div class="item-title">${value.amount} </div>`+
                        `<div class="item-title">g</div>`+
                      `</div>`+
                    `</li>`
                  );
                }
                if(value.unit==2){
                  ingredient_list.insertAdjacentHTML('beforeend', 
                    `<li>`+
                      `<div class="item-inner item-content">`+
                        `<div class="item-title ingredient_item">${value.ingredient}</div>`+
                        `<div class="item-title">${value.amount} </div>`+
                        `<div class="item-title">ml</div>`+
                      `</div>`+
                    `</li>`
                  );
                }
              });

              // スワイパー
              var swiper = app.swiper.create('.swiper-container', {
                  speed: 400,
                  spaceBetween: 3,
                  pagination: {
                    el: '.swiper-pagination',
                    type: 'bullets',
                  },
              });
              
              for (var i = 0; i < 5; i++) {
                eval("var slide"+i+"="+"document.getElementById('slide"+i+"');");
                if(typeof data.processes[i] === "undefined"){ //中身がないとき
                  eval("slide"+i).style.backgroundImage = `url('${data.hd_img}')`;
                  swiper.removeSlide([i,i+1]);
                }
                else{ //中身があるとき
                  eval("slide"+i).style.backgroundImage = `url('${data.hd_img}')`;
                  eval("slide"+i).innerHTML = data.processes[i].text;
                }
              }
            };
            request.send();

            $("#add_stock").on("click", function(){
              var id_val = sessionStorage.getItem("id");
              var id = JSON.parse(id_val);
              var id_val = sessionStorage.getItem("id");
              if(id_val===null){
                app.loginScreen.open('#my-login-screen');
              } else {
              $.post( "https://okomemode.com/api/add_stock", { user_id: id, recipe_id: page.route.params.recipeId })
              .done(function( data ) {
                  app.views.main.router.navigate('/stock/');
              });
              }
            })

            // ログイン画面
            $$('#my-login-screen .login-button').on('click', function () {
              var email = $$('#my-login-screen [name="email"]').val();
              var password = $$('#my-login-screen [name="password"]').val();

              var formData = app.form.convertToData('#my-login-screen');
              var jsonData = JSON.stringify(formData);
                $.post( "https://okomemode.com/api/auth/login", { email: formData.email, password: formData.password })
                .done(function( data ) {

                    $.ajax( {
                    type: 'post',
                    url: 'https://okomemode.com/api/auth/me',
                    dataType: 'json',
                    beforeSend: function( xhr, settings ) { xhr.setRequestHeader( 'Authorization', 'Bearer '+ data.access_token ); }
                    } )
                    .done( ( data ) => {
                        var ID = "id";
                        var id_val = data.id;
                        sessionStorage.setItem(ID, JSON.stringify(id_val));
                        var NAME = "name";
                        var name_val = data.name;
                        sessionStorage.setItem(NAME, JSON.stringify(name_val));
                        var ICON = "icon";
                        var icon_val = "https://okomemode.com/storage/img/" + data.icon;
                        sessionStorage.setItem(ICON, JSON.stringify(icon_val));
                        var EMAIL = "email";
                        var email_val = data.email;
                        sessionStorage.setItem(EMAIL, JSON.stringify(email_val));
                        var LEVEL = "level";
                        var level_val = data.level;
                        sessionStorage.setItem(LEVEL, JSON.stringify(level_val));
                        // after login success
                        $.post( "https://okomemode.com/api/add_stock", { user_id: id_val, recipe_id: page.route.params.recipeId })
                        .done(function( data ) {
                          // Close login screen
                            app.loginScreen.close('#my-login-screen');
                            app.views.main.router.navigate('/stock/');
                        });
                    } )
                    .fail( ( data ) => {
                        app.loginScreen.close('#my-login-screen');
                        app.views.main.router.back();
                    } );
                });
            });
          },
          pageAfterIn: function (event, page) {
            $(".login-screen-close").on("click", function(){
              app.loginScreen.close('#my-login-screen');
              app.views.main.router.back();
            });
          },
        }
  },
  // Page Loaders & Router
  {
    path: '/page-loader-template7/:user/:userId/:posts/:postId/',
    templateUrl: './pages/page-loader-template7.html',
  },
  {
    path: '/page-loader-component/:user/:userId/:posts/:postId/',
    componentUrl: './pages/page-loader-component.html',
  },
  {
    path: '/request-and-load/user/:userId/',
    async: function (routeTo, routeFrom, resolve, reject) {
      // Router instance
      var router = this;

      // App instance
      var app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      var userId = routeTo.params.userId;

      // Simulate Ajax Request
      setTimeout(function () {
        // We got user data from request
        var user = {
          firstName: 'Vladimir',
          lastName: 'Kharlampidi',
          about: 'Hello, i am creator of Framework7! Hope you like it!',
          links: [
            {
              title: 'Framework7 Website',
              url: 'http://framework7.io',
            },
            {
              title: 'Framework7 Forum',
              url: 'http://forum.framework7.io',
            },
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            componentUrl: './pages/request-and-load.html',
          },
          {
            context: {
              user: user,
            }
          }
        );
      }, 1000);
    },
  },
  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
