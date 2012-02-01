(function($) {
  
  var app = function() { this.load() };
  app.prototype = {
    
    appURI: 'https://github.com/melvincarvalho/appbuilder', // DOAP
    webIDAuthURI : 'https://data.fm/user.js',
    loginType : 'loginMulti', 
    //loginType : 'loginBrowserID', 
    friends: [],
    statuses: [],
    user: null,

    // Facebook ID -- change or add more
    facebookAppID : '119467988130777',
    facebookAppURL : 'data.fm',

  
    // INIT
    load: function() {
      this.initLogin();
      this.loadUser();
      this.render();
    },
    
    // AUTHENTICATION
    initLogin: function() {
      $('#loginBrowserID').click(function () {document.app.loginBrowserID();});
      $('#loginGmail').attr('href', 'https://data.fm/login?provider=Gmail&next=' + document.URL );
      $('#loginYahoo').attr('href', 'https://data.fm/login?provider=Yahoo&next=' + document.URL );
      $('#loginWebID').attr('href', 'https://data.fm/login?next=' + document.URL );
      if (document.URL.indexOf(this.facebookAppURL) != -1) {
        $('#loginFacebook').click(function () {document.app.loginFacebook();});
      } else {
        $('#loginFacebook').hide();
      }
    },
    
    loadUser: function() {
      this.status('Loading user...', true);
      // Non Facebook
      if (window.location.hash.length == 0) {
        var script = document.createElement('script');
        script.src = this.getWebIDAuthURI() + '?callback=document.app.displayUser';
        document.body.appendChild(script);   
      // Facebook     
      } else {
        var accessToken = window.location.hash.substring(1);
        var path = "https://graph.facebook.com/me?";
        var queryParams = [accessToken, 'callback=document.app.displayUser'];
        var query = queryParams.join('&');
        var url = path + query;

        var script = document.createElement('script');
        script.src = url;
        document.body.appendChild(script);        
      }
    },
    
    // Multi login modal popup
    loginMulti: function(id) {
      $('#loginPopup').dialog({"title": "Sign in"});
    },
    
    // Called from fb button
    loginFacebook: function() {
      var appID = this.facebookAppID;
      if (window.location.hash.length == 0) {
        var path = 'https://www.facebook.com/dialog/oauth?';
        var queryParams = ['client_id=' + appID,
          'redirect_uri=' + window.location,
          'response_type=token'];
        var query = queryParams.join('&');
        var url = path + query;
        window.location = url;
      } else {
      }
    },
    
    // Called from BrowserID button
    loginBrowserID: function() {
      navigator.id.get(function(assertion) {
        if (assertion) {
    
          var arr = assertion.split('.');
          var f = JSON.parse(window.atob(arr[1]));
          var user = f['principal']['email'];
          document.getElementById('welcome').innerHTML = user + '<a href="javascript:document.app.logout()"><img height="24" width="24" src="http://melvincarvalho.github.com/appbuilder/images/logout.png"/'+'></a>';
          document.app.user = 'mailto:' +  user;
          $('#loginPopup').dialog('close');
          document.app.loadRemote();

          
          // This code will be invoked once the user has successfully
          // selected an email address they control to sign in with.
        } else {
          // something went wrong!  the user isn't logged in.
        }
      });      
    },
    
    // Displays users, callback to loadFriends, loadRemote
    displayUser: function(user) {
      this.status('Loading user...', false);
      var userName = document.getElementById('welcome');
      if ( user.name ) {
        var greetingText = document.createTextNode('Greetings, ' + user.name + '.');
        document.app.user = 'https://graph.facebook.com/' + user.id;
        userName.innerHTML = 'Greetings, ' + user.name + '<a href="javascript:document.app.logout()"><img height="24" width="24" src="http://melvincarvalho.github.com/appbuilder/images/logout.png"/'+'></a>';;
        this.loadFBFriends();
      } else {
        document.app.user = user; 
        var userName = document.getElementById('welcome');
        if (user.substring(0,4) == 'dns:' ) {
          var signin = 'javascript:document.app.' + this.loginType + '()';
          userName.innerHTML = 'IP: ' + document.app.user + '&nbsp;' + '<a href="'+signin+'"><img src="https://browserid.org/i/sign_in_blue.png"/'+'></a>' ;
        } else {
          userName.innerHTML = 'User: ' + document.app.user + '<a href="javascript:document.app.logout()"><img height="24" width="24" src="http://melvincarvalho.github.com/appbuilder/images/logout.png"/'+'></a>';
        }
      }
      this.loadRemote();
    },
    
    logout: function() {
      this.user = null;
      var signin = 'javascript:document.app.' + this.loginType + '()';
      var userName = document.getElementById('welcome');
      userName.innerHTML = 'Sign In: &nbsp;' + '<a href="'+signin+'"><img src="https://browserid.org/i/sign_in_blue.png"/'+'></a>' ;
      this.render();
    },
    
    // DISCOVERY
    getWebIDAuthURI: function() {
      // Try localStorage first
      if ( window.localStorage.webIDAuthURI ) return  window.localStorage.webIDAuthURI;
      
      // TODO: Search loacal path for user prefs

      // TODO: Discovery via HTTP user URI, Webfinger
      
      // TODO: Discover vid HTTP / DOAP

      // Fallback to default location
      return this.webIDAuthURI;
    },
    
    
    // FRIENDS
    // Loads friends, callback to displayFriends
    loadFBFriends: function() {
      this.status('Loading friends...', true);
      var accessToken = window.location.hash.substring(1);
      var path = "https://graph.facebook.com/me/friends?";
      var queryParams = [accessToken, 'callback=document.app.displayFriends'];
      var query = queryParams.join('&');
      var url = path + query;

      // use jsonp to call the graph
      var script = document.createElement('script');
      script.src = url;
      document.body.appendChild(script);        
    },    
    
    // Displays friends
    displayFriends: function(data) {
      this.status('Loading friends...', false);
      var str;
      for (i=0; i<data['data'].length; i++) {
        var uri  = 'https://graph.facebook.com/' + data['data'][i].id;
        var name = data['data'][i].name;
        this.addFriend( uri, name );
      }
      this.render();
    },


    // LOAD DATA
    loadRemote: function() {
    },
    
    
    // SAVE DATA
    saveRemote: function() {
    },
    

    // RENDER DATA
    render: function() {
      that = this;
      //$('#main').empty();
            
    },
    
    
    // HELPERS
    addFriend: function(uri, name) {
      for (i=0; i<this.friends.length; i++) {
        if ( uri == this.friends[i]['@id'] && name == this.friends[i]['http://xmlns.com/foaf/0.1/name'] ) return;
      }
      
      this.friends.push({ "@id" : uri, "http://xmlns.com/foaf/0.1/name" : name });
      window.localStorage.friends = JSON.stringify(this.friends);
    },
    
    deleteFile: function(file) {
      var body = '';
      xhr = new XMLHttpRequest();
      xhr.open('DELETE', file, false);
      xhr.setRequestHeader('Content-Type', 'text/turtle; charset=UTF-8');
      xhr.send(body);      
    },
    
    putFile: function(file, data) {
      xhr = new XMLHttpRequest();
      xhr.open('PUT', file, false);
      xhr.setRequestHeader('Content-Type', 'text/turtle; charset=UTF-8');
      xhr.send(data);   
    },
    
    postFile: function(file, data) {
      xhr = new XMLHttpRequest();
      xhr.open('POST', file, false);
      xhr.setRequestHeader('Content-Type', 'text/turtle; charset=UTF-8');
      xhr.send(data);   
    },
    
    createDirectory: function(dir) {
      var xhr = new XMLHttpRequest();
      xhr.open('MKCOL', dir, false);
      xhr.send();
    },

    status: function(message, add) {
      if (add) {
        this.statuses.push(message);
      } else {
        for (i=0; i<this.statuses.length; i++) {
          if (message == this.statuses[i]) {
            this.statuses.splice(i, 1);
          }
        }
      }
      if (this.statuses.length) {
        $('#status').html(this.statuses[0]);
      } else {
        $('#status').html('');
      }
    },

    
    makeURI: function(id) {
      if ( id.substring(0,7) == 'mailto:' ) {
        return id;
      } else if ( id.indexOf(':') != -1 ) {
        return id;
      } else {
        return 'mailto:' + id;
      }
    }
    
  };
  
  // ONLOAD
  $(document).ready(function() {
    document.app = new app; 
  });
  
})(jQuery);

