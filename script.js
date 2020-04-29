var $ = require('jquery');
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/storage");
require("firebase/database");


var mountPoint = '#root';
var articleID;




var firebaseConfig = {
  apiKey: "AIzaSyD6LMPI4pdqO92UJCay8cyYluGPIEaT1gU",
  authDomain: "idz-frontend.firebaseapp.com",
  databaseURL: "https://idz-frontend.firebaseio.com",
  projectId: "idz-frontend",
  storageBucket: "idz-frontend.appspot.com",
  messagingSenderId: "647214250489",
  appId: "1:647214250489:web:36ffff687223e76c476528",
};
// Initialize Firebase

firebase.initializeApp(firebaseConfig);

$(document).ready(function () {
  //Social and Anonymous Auth Scheme Login
  $('#GoogleButton,#GithubButton,#anonymous').on('click', function(e) {
    login($(this).attr('id'));
  })
  
});

function AuthSuccesfull(){
  hashValue='listOfArticles';
  $.get(hashValue+'.html', function(data){
    $(mountPoint).empty().html(data);
    $('#Logout').on('click', function(e) {
      Logout();
    })
    $('#Add').on('click', function(e) {
      AddClick();
    })
    var query = firebase.database().ref("article");
    query.once("value")
    .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
        document.querySelector('#content')
        .innerHTML += articleHtmlFromObject(childSnapshot.val(),childSnapshot.key);
      });
      articleClickSet();
    });
    
  })
  
}

function articleClickSet(){
  $('.article').on('click', function(e) {
    articleID=this.id;
    $.get('detailArticle.html', function(data){
      $(mountPoint).empty().html(data);
      var articleRef = firebase.database().ref('article/' +articleID+'/');
      console.log(articleID);
      articleRef.on('value', function(snapshot) {
        document.querySelector('#content')
        .innerHTML += detailArticleHtml(snapshot.val());
      });
      $('#Back').on('click', function(e) {
        AuthSuccesfull();
      })
    })
      
  })
}

function detailArticleHtml(article){
  var html = '';
  html += '<h2>'+article.Name+'</h2>';
  html += '<img src="'+article.ImageURL+'">';
  html += '<p>'+article.TextOfArticle+'</p>';
  return html;
}

function articleHtmlFromObject(article,key){
  var html = '';
  html += '<div class="article" id="'+key+'">';
    html += '<div class="article_image">';
      html += '<img src="'+article.ImageURL+'">';
    html += '</div>';
    html += '<div class="article_anotation">';
      html += '<h4>'+article.Name+'</h4>';
      html += '<p>'+article.Date+'</p>';
      html += '<p>'+article.Anotation+'</p>';
    html += '</div>';
  html += '</div>';
  return html;
}

function AddClick(){
  $.get('addArticle.html', function(data){
    $(mountPoint).empty().html(data);
    var LoadPhotoButton = document.getElementById("button2");
    LoadPhotoButton.onclick=LoadFile;
    var ReturnBackButton = document.getElementById("Back");
    ReturnBackButton.onclick=AuthSuccesfull;
  })
}

function login (type) {
  switch(type){
    case 'GoogleButton': {
      var provider = new firebase.auth.GoogleAuthProvider();
      Auth(provider);
      break;
    }

    case 'GithubButton': {
      var provider = new firebase.auth.GithubAuthProvider();
      Auth(provider);
      break;
    }

    case 'anonymous': {
      request = firebase.auth().signInAnonymously();
      if( request !== null ){
        return request
        .then(function (user) {
          console.log(user);
          AuthSuccesfull();
          return user;
        })
      }
      break;
    }
  }
}

function Auth(provider){
  firebase
      .auth()
      .signInWithPopup(provider)
      .then(function(result) {
        var user = result.user;
        AuthSuccesfull();
        console.log(user)
      })
      .catch(function(error) {
        console.log(error);
      });
}

function Logout(){
  firebase
    .auth()
    .signOut()
    .then(function () {
        console.log("True");
        location.reload();
        return true; //Do necessary cleanup
    })
    .catch(function (e) {
        //There might be error, Force session and local cleanup
        return false;
    })
}

function LoadFile(){
  const ref = firebase.storage().ref();
  const file = document.querySelector('#photo').files[0]
  const name = (+new Date()) + '-' + file.name;
  const metadata = {
  contentType: file.type
  };
  
  const task = ref.child(name).put(file, metadata);
  task
  .then(snapshot => snapshot.ref.getDownloadURL())
  .then((url) => {
    console.log(url);
    LoadDataToDateBase(url);
    AuthSuccesfull();
  })
  .catch(console.error);
}

function LoadDataToDateBase(ImageURL){
  var newArticleKey = firebase.database().ref().child('articles').push().key;
  if( document.querySelector('#name').value != '' || document.querySelector('#article').value != '' ){
    var now = {
      Name: document.querySelector('#name').value,
      TextOfArticle: document.querySelector('#article').value,
      Date: new Date(),
      ImageURL:ImageURL,
      Anotation: document.querySelector('#anotation').value
    };
    var updates = {};
    updates['/article/' + newArticleKey] = now;
    return firebase.database().ref().update(updates);
    } else {
      alert('Пожалуйста введите заголовок и статью');
    }
}