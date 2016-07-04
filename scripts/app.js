'use strict';
angular.module('main', [
  'ionic',
  'ionic-material',
  'ngCordova',
  'ui.router',
  'mn',
  'ngAnimate',
  'ngStorage',
  'ng-walkthrough',
  'darthwade.dwLoading',
  // TODO: load other modules selected during generation
])
.config(function ($stateProvider, $urlRouterProvider) {

  // ROUTING with ui.router
  $urlRouterProvider.otherwise('/');
  $stateProvider
    // this state is placed in the <ion-nav-view> in the index.html
    .state('main', {
      url: '/',
      templateUrl: 'main/templates/login.html',
      controller: 'LoginCtrl',
      cache: false,/*
      resolve: {
        data: ['$localStorage', '$location', function ($localStorage, $location) {
          if ($localStorage.login === 'true') {
            $location.path('/menu/home');
          } else if ($localStorage.login !== 'true') {
            $location.path('/');
          }
        }],
      }*/
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'main/templates/signup.html',
      controller: 'RegisterCtrl',
    })
    .state('forgot', {
      url: '/forgot',
      templateUrl: 'main/templates/forgot.html',
    })
    .state('menu', {
      url: '/menu',
      abstract: true,
      templateUrl: 'main/templates/menu.html',
      //controller: 'MenuCtrl as menu'
    })
    .state('menu.home', {
      url: '/home',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/inventory.html',
          controller: 'InventoryCtrl',
        }
      }
    })
    .state('menu.add-groups', {
      url: '/addgroups',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/inventoryadd.html',
          controller: 'InventoryCtrl',
        }
      }
    })
    .state('menu.modify-groups', {
      url: '/groups/modify?groupid',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/inventorymodify.html',
          controller: 'InventoryCtrl',
        }
      }
    })
    .state('menu.lists', {
      url: '/lists',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/lists.html',
          controller: 'ListCtrl',
        }
      },
      cache: false,
      resolve: {
        data: ['$rootScope', '$http', function ($rootScope, $http) {
          $http.get($rootScope.apiURL + '/articulo/?inventarioid__id=' + $rootScope.inventarioTmp)
          .then(function(response) {
            $rootScope.items = response.data;
          });
        }],
      }
    })
    .state('menu.add-lists', {
      url: '/listsadd',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/listsadd.html',
          controller: 'ListCtrl',
        }
      }
    })
    .state('menu.modify-lists', {
      url: '/list/modify',
      cache: false,
      views: {
        'pageContent': {
          templateUrl: 'main/templates/listsmodify.html',
          controller: 'ListCtrl',
        }
      }
    })
    .state('menu.lists-items', {
      url: '/list/items',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/items.html',
          controller: 'ItemsCtrl',
        }
      },
      cache: false,
      resolve: {
        data: ['$rootScope', '$cordovaSQLite', function ($rootScope, $cordovaSQLite) {
          var querydb = 'SELECT * FROM items WHERE list_id=?';
          $rootScope.items = [];
          $cordovaSQLite.execute($rootScope.db, querydb, [$rootScope.listTmp]).then(function (res) {
            if (res.rows.length > 0) {
              for (var i = 0; i < res.rows.length; i++) {
                $rootScope.items.push({
                  id: res.rows.item(i).id,
                  description: res.rows.item(i).description,
                  nombre: res.rows.item(i).nombre,
                  status: res.rows.item(i).status_id,
                  positionarray: i
                });
              }
            } else {
              //PON ALGO ACA
            }
          }, function (err) {
            alert('error=>' + err);
          });
        }],
      }
    })
    .state('menu.lists-item-add', {
      url: '/list/item/add',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/itemsadd.html',
          controller: 'ItemsCtrl',
        }
      }
    })
    .state('menu.lists-item-description', {
      url: '/list/item/description',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/itemsdescription.html',
          controller: 'ItemsCtrl',
        },
      }
    })
    .state('menu.lists-item-modify', {
      url: '/list/item/modify',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/itemsmodify.html',
          controller: 'ItemsCtrl',
        }
      }
    })
    ;
})
.run(function ($rootScope, $ionicPlatform, $cordovaSQLite, djangoAuth) {
  $rootScope.apiURL = 'http://127.0.0.1:8000';
  djangoAuth.initialize($rootScope.apiURL + '/rest-auth', false);
});

'use strict';
angular.module('main')
.service('Validate', function Validate () {
  return {
    'message': {
      'minlength': 'This value is not long enough.',
      'maxlength': 'This value is too long.',
      'email': 'A properly formatted email address is required.',
      'required': 'This field is required.'
    },
    'more_messages': {
      'demo': {
        'required': 'Here is a sample alternative required message.'
      }
    },
    'check_more_messages': function (name, error) {
      return (this.more_messages[name] || [])[error] || null;
    },
    'validation_messages': function (field, form, errorBin) {
      var messages = [];
      for (var e in form[field].$error) {
        if (form[field].$error[e]) {
          var specialMessage = this.check_more_messages(field, e);
          if (specialMessage) {
            messages.push(specialMessage);
          } else if (this.message[e]) {
            messages.push(this.message[e]);
          } else {
            messages.push('Error: ' + e);
          }
        }
      }
      var dedupedMessages = [];
      angular.forEach(messages, function (el) {
        if (dedupedMessages.indexOf(el) === -1) {
          dedupedMessages.push(el);
        }
      });
      if (errorBin) {
        errorBin[field] = dedupedMessages;
      }
    },
    'form_validation': function (form, errorBin) {
      for (var field in form) {
        if ( field.substr(0, 1) !== '$' ) {
          this.validation_messages(field, form, errorBin);
        }
      }
    }
  };
});

'use strict';
angular.module('main')
.service('djangoAuth', function djangoAuth($q, $http, $localStorage, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var service = {
        /* START CUSTOMIZATION HERE */
        // Change this to point to your Django REST Auth API
        // e.g. /api/rest-auth  (DO NOT INCLUDE ENDING SLASH)
        'API_URL': '',
        // Set use_session to true to use Django sessions to store security token.
        // Set use_session to false to store the security token locally and transmit it as a custom header.
        'use_session': true,
        /* END OF CUSTOMIZATION */
        'authenticated': null,
        'authPromise': null,
        'request': function(args) {
            // Let's retrieve the token from the cookie, if available
            if($localStorage.token){
                $http.defaults.headers.common.Authorization = 'Token ' + $localStorage.token;
            }
            // Continue
            params = args.params || {}
            args = args || {};
            var deferred = $q.defer(),
                url = this.API_URL + args.url,
                method = args.method || "GET",
                params = params,
                data = args.data || {};
            // Fire the request, as configured.
            $http({
                url: url,
                withCredentials: this.use_session,
                method: method.toUpperCase(),
                headers: {'X-CSRFToken': $localStorage['csrftoken']},
                params: params,
                data: data
            })
            .success(angular.bind(this,function(data, status, headers, config) {
                deferred.resolve(data, status);
            }))
            .error(angular.bind(this,function(data, status, headers, config) {
                //console.log("error syncing with: " + url);
                // Set request status
                //if(data){
                    //data.status = status;
                //}
                if(status == 0){
                    if(data == ""){
                        data = {};
                        data['status'] = 0;
                        data['non_field_errors'] = ["Could not connect. Please try again."];
                    }
                    // or if the data is null, then there was a timeout.
                    if(data == null){
                        // Inject a non field error alerting the user
                        // that there's been a timeout error.
                        data = {};
                        data['status'] = 0;
                        data['non_field_errors'] = ["Server timed out. Please try again."];
                    }
                }
                deferred.reject(data, status, headers, config);
            }));
            return deferred.promise;
        },
        'register': function(username,password1,password2,email,more){
            var data = {
                'username':username,
                'password1':password1,
                'password2':password2,
                'email':email
            }
            data = angular.extend(data,more);
            return this.request({
                'method': "POST",
                'url': "/registration/",
                'data' :data
            });
        },
        'login': function(username,password){
            var djangoAuth = this;
            return this.request({
                'method': "POST",
                'url': "/login/",
                'data':{
                    'username':username,
                    'password':password
                }

            }).then(function(data){
                if(!djangoAuth.use_session){
                    $http.defaults.headers.common.Authorization = 'Token ' + data.key;
                    $localStorage.token = data.key;
                }
                djangoAuth.authenticated = true;
                $rootScope.$broadcast("djangoAuth.logged_in", data);
                //$localStorage.put("user",username);
            });
        },
        'logout': function(){
            var djangoAuth = this;
            return this.request({
                'method': "POST",
                'url': "/logout/"
            }).then(function(data){
                delete $http.defaults.headers.common.Authorization;
                delete $localStorage.token;
                djangoAuth.authenticated = false;
                $rootScope.$broadcast("djangoAuth.logged_out");
            });
        },
        'changePassword': function(password1,password2){
            return this.request({
                'method': "POST",
                'url': "/password/change/",
                'data':{
                    'new_password1':password1,
                    'new_password2':password2
                }
            });
        },
        'resetPassword': function(email){
            return this.request({
                'method': "POST",
                'url': "/password/reset/",
                'data':{
                    'email':email
                }
            });
        },
        'profile': function(){
            return this.request({
                'method': "GET",
                'url': "/user/"
            }); 
        },
        'updateProfile': function(data){
            return this.request({
                'method': "PATCH",
                'url': "/user/",
                'data':data
            }); 
        },
        'verify': function(key){
            return this.request({
                'method': "POST",
                'url': "/registration/verify-email/",
                'data': {'key': key} 
            });            
        },
        'confirmReset': function(uid,token,password1,password2){
            return this.request({
                'method': "POST",
                'url': "/password/reset/confirm/",
                'data':{
                    'uid': uid,
                    'token': token,
                    'new_password1':password1,
                    'new_password2':password2
                }
            });
        },
        'authenticationStatus': function(restrict, force){
            // Set restrict to true to reject the promise if not logged in
            // Set to false or omit to resolve when status is known
            // Set force to true to ignore stored value and query API
            restrict = restrict || false;
            force = force || false;
            if(this.authPromise == null || force){
                this.authPromise = this.request({
                    'method': "GET",
                    'url': "/user/"
                })
            }
            var da = this;
            var getAuthStatus = $q.defer();
            if(this.authenticated != null && !force){
                // We have a stored value which means we can pass it back right away.
                if(this.authenticated == false && restrict){
                    getAuthStatus.reject("User is not logged in.");
                }else{
                    getAuthStatus.resolve();
                }
            }else{
                // There isn't a stored value, or we're forcing a request back to
                // the API to get the authentication status.
                this.authPromise.then(function(){
                    da.authenticated = true;
                    getAuthStatus.resolve();
                },function(){
                    da.authenticated = false;
                    if(restrict){
                        getAuthStatus.reject("User is not logged in.");
                    }else{
                        getAuthStatus.resolve();
                    }
                });
            }
            return getAuthStatus.promise;
        },
        'initialize': function(url, sessions){
            this.API_URL = url;
            this.use_session = sessions;
            return this.authenticationStatus();
        }

    }
    return service;
  });
'use strict';
angular.module('main')
.controller('RegisterCtrl', function ($scope, $location, Validate, $rootScope, $localStorage, $http, $cordovaDialogs) {
  $scope.user = {};
  $scope.register = function (formData) {
    $scope.errors = [];
    Validate.form_validation(formData, $scope.errors);
    if (!formData.$invalid) {
      $http({
        method: 'POST',
        url: $rootScope.apiURL + '/users/',
        data: {
          'username': $scope.user.email,
          'password': $scope.user.password,
          'first_name': $scope.user.firstname,
          'last_name': $scope.user.lastname,
          'email': $scope.user.email
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .success(function () {//, status, headers, config
        //if (data.msg !== '') {
        $cordovaDialogs.confirm('Usuario creado', 'Confirmación', ['aceptar']);
        return $location.path('/');
        //} else {
        //  alert('usuario no creado');
        //}
      })
      .error(function () {//data, status
        //console.log(status);
      });
    }
  };
});

'use strict';
angular.module('main')
.controller('MenuCtrl', function ($log) {

  $log.log('Hello from your Controller: MenuCtrl in module main:. This is your controller:', this);

});

'use strict';
angular.module('main')
.controller('LoginCtrl', function ($scope, $http, $cordovaDialogs, $location, djangoAuth, Validate, $rootScope, $localStorage) {
  $scope.model = {};
  $scope.complete = false;
  $localStorage.datauser = 'false';
  $scope.login = function (formData) {
    
    $scope.errors = [];
    Validate.form_validation(formData, $scope.errors);
    if (!formData.$invalid) {
      djangoAuth.login($scope.model.username, $scope.model.password)
      .then(function () {
        $http.get($rootScope.apiURL + '/rest-auth/user/')
        .then(function (response) {
          $localStorage.datau = response.data;
          $localStorage.datauser = 'true';
        });
        $localStorage.login = 'true';
        $location.path('/menu/home');
      }, function (data) {
        console.log(data);
      });
    } else {
      $cordovaDialogs.confirm('Debe llenar los campos solicitados', 'Información', ['Aceptar']);
    }
  };
});

'use strict';
angular.module('main')
.controller('ListCtrl', function ($scope, $http, $rootScope, $cordovaSQLite, $cordovaDialogs, $location, $localStorage) {
  $scope.list = {};

  $scope.save = function (list) {
    $http({
      method: 'POST',
      url: $rootScope.apiURL + '/articulo/',
      data: {
        'inventarioid': $rootScope.inventarioTmp, 
        'nombre': list.nombre, 
        'descripcion': list.descripcion, 
        'serial': list.serial, 
        'fecha_movimiento': list.fechaMovimiento, 
        'cantidad_entrante': list.cantidadEntrante, 
        'cantidad_retirada': '0', 
        'cantidad_total': list.cantidadEntrante 
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .success(function () {
      alert('guardado con exito');
      $location.path('/menu/lists');
    })
    .error(function (err) {
      console.log(err);
    });
  };
  $scope.showdatalist = function (listid) {
    $http.get($rootScope.apiURL + '/articulo/' + listid + '/')
    .then(function(response) {
      $rootScope.item = response.data;
      $rootScope.item.cantidad_entrante = '0';
      $location.path('/menu/list/modify');  
    });
  };

  $scope.modify = function (list, listid, listfecha) {
    var cantidadTotal = 0;
    if (list.cantidad_retirada = '0') {
      cantidadTotal = list.cantidad_total + list.cantidad_entrante;
    }else{
      cantidadTotal = list.cantidad_total - list.cantidad_retirada;
    };

    $http({
      method: 'PATCH',
      url: $rootScope.apiURL + '/articulo/' + listid + '/',
      data: {
        'inventarioid': $rootScope.inventarioTmp, 
        'nombre': list.nombre, 
        'descripcion': list.descripcion, 
        'serial': list.serial, 
        'cantidad_entrante': list.cantidad_entrante, 
        'cantidad_retirada': list.cantidad_retirada, 
        'cantidad_total': cantidadTotal,
        'fecha_movimiento': listfecha
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .success(function () {
      alert('guardado con exito');
      $location.path('/menu/lists');
    })
    .error(function (err) {
      console.log(err);
    });
  };

  $scope.delete = function (listid) {
    alert(listid);
    $http({
      method: 'DELETE',
      url: $rootScope.apiURL + '/articulo/' + listid + '/',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .success(function () { 
      alert('Borrado con exito');
      $location.path('/menu/lists');
    });
  };
  
});

'use strict';
angular.module('main')
.controller('ItemsCtrl', function ($scope, $rootScope, $cordovaSQLite, $cordovaDialogs, $location) {
  $scope.item = {};
  $scope.date = new Date();
  $scope.updateCount = false;

  $scope.itemsInit = function () {
    var querydb = 'SELECT * FROM items WHERE list_id=?';
    $rootScope.items = [];
    $cordovaSQLite.execute($rootScope.db, querydb, [$rootScope.listTmp]).then(function (res) {
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          $rootScope.items.push({
            id: res.rows.item(i).id,
            description: res.rows.item(i).description,
            nombre: res.rows.item(i).nombre,
            status: res.rows.item(i).status_id,
            positionarray: i
          });
        }
      } else {
        //alert('No results found');
      }
    }, function (err) {
      //alert('error=>' + err);
      $scope.error = err;
    });
  };

  $scope.save = function (item) {
    var query = 'INSERT INTO items (nombre, description, list_id, status_id, fecha) VALUES (?,?,?,?,?)';
    $cordovaSQLite.execute($rootScope.db, query, [item.nombre, item.description, $rootScope.listTmp, 'Espera', $scope.date]).then(function () {
      $cordovaDialogs.confirm('Item creado con Exito', 'Confirmación', ['Aceptar']).then(function () {
      });
      $scope.item = {};//reseteo de variables
      $scope.updateCount = true; //update directive CountItems
      $location.path('/menu/list/items');
    }, function (err) {
      $cordovaDialogs.confirm('El item no fue creado', err, ['Aceptar']).then(function () {
      });
      //alert(err);
    });
  };

  $scope.open = function (itemid) {
    $scope.updateCount = false;
    $rootScope.itemTmp = itemid;
    $scope.showdataitem(itemid, '/menu/list/item/description');
  };

  $scope.showdataitem = function (itemid, path) {
    var querydb = 'SELECT * FROM items WHERE id=?';
    $rootScope.itemdata = [];
    $cordovaSQLite.execute($rootScope.db, querydb, [itemid]).then(function (res) {
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          $rootScope.itemdata.push({
            id: res.rows.item(i).id,
            description: res.rows.item(i).description,
            nombre: res.rows.item(i).nombre,
            status: res.rows.item(i).status_id
          });
        }
        $location.path(path);
      } else {
        //alert('No results found');
      }
    }, function (err) {
      //alert('error=>' + err);
      $scope.error = err;
    });
  };

  $scope.modify = function (item) {
    var query = 'UPDATE items SET nombre=?, description=? WHERE id=?';
    $cordovaSQLite.execute($rootScope.db, query, [item.nombre, item.description, $rootScope.itemdata[0]['id']]).then(function () {
      $cordovaDialogs.confirm('Item modificado con Exito', 'Confirmación', ['Aceptar']).then(function () {
      });
      $scope.list = {};//reseteo de variables
      $location.path('/menu/list/items');
    }, function (err) {
      $cordovaDialogs.confirm('Error al actualizar', err, ['Aceptar']);
    });
  };

  $scope.changeStatus = function (itemid, itemStatus) {//positionarray
    var query = 'UPDATE items SET status_id=? WHERE id=?';
    if ( (itemStatus === 'Espera') || (itemStatus === 'espera') ) {
      $cordovaSQLite.execute($rootScope.db, query, ['Proceso', itemid]).then(function () {
        $cordovaDialogs.confirm('Item paso a estado en Proceso', 'Confirmación', ['Aceptar']).then(function () {
        });
        $scope.itemsInit();
      }, function (err) {
        $cordovaDialogs.confirm('Error al actualizar', err, ['Aceptar']);
      });

    } else if ( (itemStatus === 'Proceso') || (itemStatus === 'proceso') ) {
      $cordovaSQLite.execute($rootScope.db, query, ['Hecho', itemid]).then(function () {
        $cordovaDialogs.confirm('Item paso a estado Completado', 'Confirmación', ['Aceptar']).then(function () {
        });
        $scope.itemsInit();
      }, function (err) {
        $cordovaDialogs.confirm('Error al actualizar', err, ['Aceptar']);
      });
      $scope.updateCount = true;
    }
  };

  $scope.delete = function (itemid) {
    var query = 'DELETE FROM items WHERE id=' + itemid;
    $cordovaSQLite.execute($rootScope.db, query).then(function () {
      $cordovaDialogs.confirm('Item Borrado con Exito', 'Confirmación', ['Aceptar']);
      $scope.itemsInit();
      $location.path('menu/list/items');
      $scope.updateCount = true;
    }, function (err) {
      $cordovaDialogs.confirm('Error al borrar Item', err, ['Aceptar']);
      //alert(err);
    });
  };

  $scope.menu = function (itemid) {
    $cordovaDialogs.confirm('', 'Opciones', ['Borrar', 'Modificar', 'Cancelar'])
    .then(function (buttonIndex) {
      if (buttonIndex === 1) {
        $scope.delete(itemid);
      } else if (buttonIndex === 2) {
        $scope.showdataitem(itemid, '/menu/list/item/modify');
      }
    });
  };

});

'use strict';
angular.module('main')
.controller('InventoryCtrl', function ($scope, $timeout, $loading, $http, $rootScope, $cordovaSQLite, $cordovaDialogs, $location, $localStorage) {

  $scope.inventariodata = {};
  $rootScope.groupTmp = '';
  $scope.date = new Date();
  
  $scope.tipoInventario = function () {
    $http.get( $rootScope.apiURL + '/tipoinventario/').then(function(response) {
      $rootScope.tipos = response.data;
    });
  }; 
  $scope.inventario = function () {
    $http.get($rootScope.apiURL + '/inventario/').then(function(response) {
      $rootScope.inventarios = response.data;
    });
  }; 
  $scope.execute = function (inventariodata) {
    $http({
      method: 'POST',
      url: $rootScope.apiURL + '/inventario/',
      data: {
        'nombre': inventariodata.nombre,
        'ubicacion': inventariodata.ubicacion,
        'tipo_permiso': inventariodata.tipo.id
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .success(function () {
      alert('guardado con exito');
      $scope.inventario();
      $location.path('/menu/home');
    })
    .error(function (err) {
      console.log('error al guardar: ' + err);
    });
  };
  $scope.open = function (groupid) {
    $rootScope.inventarioTmp = groupid;
    $location.path('/menu/lists');
  };
  $scope.showdatagroup = function (groupid) {
    var querydb = 'SELECT * FROM groups WHERE id=?';
    $rootScope.groupdata = [];
    $cordovaSQLite.execute($rootScope.db, querydb, [groupid]).then(function (res) {
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          $rootScope.groupdata.push({
            id: res.rows.item(i).id,
            fecha: res.rows.item(i).fecha,
            nombre: res.rows.item(i).nombre,
            status: res.rows.item(i).status_id
          });
        }
        $location.path('/menu/groups/modify');
      } else {
       ////alert('No results found');
      }
    }, function (err) {
      //alert('error=>' + err);
      $scope.error = err;
    });
  };
  $scope.delete = function (groupid) {
    $http({
      method: 'DELETE',
      url: $rootScope.apiURL + '/inventario/' + groupid + '/',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .success(function () { 
      $scope.inventario();
    });
  };
  $scope.menu = function (groupid) {
    $cordovaDialogs.confirm('', 'Opciones', ['Borrar', 'Modificar', 'Cancelar'])
    .then(function (buttonIndex) {
      if (buttonIndex === 1) {
        $scope.delete(groupid);
      } else if (buttonIndex === 2) {
        $scope.showdatagroup(groupid);
      }
    });
  };

  $scope.inventario();
});


'use strict';
angular.module('hl_app', [
  // load your modules here
  'main', // starting with the main module
]);
