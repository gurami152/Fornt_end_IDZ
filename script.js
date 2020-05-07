var $ = require('jquery');
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/storage");
require("firebase/database");


var mountPoint = '#root';
var articleID;
var user=null;
var userCreated=false;
var CurrentEditingImgSrc;

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
  hashValue='listOfArticles';
  $.get(hashValue+'.html', function(data){
    $(mountPoint).empty().html(data);
    $('#Login').on('click', function(e) {
      AutorizationPageOpen();
    })
    $('#Logout').hide();
    $('#Add').hide();
    var query = firebase.database().ref("article").orderByKey('Date');
    query.once("value")
    .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
        document.querySelector('#content')
        .innerHTML += articleHtmlFromObject(childSnapshot.val(),childSnapshot.key);
      });
      articleClickSet();
    });
    
  })
});

function AutorizationPageOpen(){
  hashValue='autorizationPage';
  $.get(hashValue+'.html', function(data){
    $(mountPoint).empty().html(data);
    $('#PasswordError').hide();
    //Social and Anonymous Auth Scheme Login
    $('#GoogleButton,#GithubButton,#LoginButton').on('click', function(e) {
    login($(this).attr('id'));
    })
    $('#RegisterButton').on('click', function(e) {
      RegisterPageOpen();
    })
    if(userCreated){
      $('#UserCreatedMessage').show();
    }
    else{
      $('#UserCreatedMessage').hide();
    }
  })  
}

function RegisterPageOpen(){
  $.get('registerPage.html', function(data){
    $(mountPoint).empty().html(data);
    $('#Back').on('click', function(e) {
      AutorizationPageOpen();
    });
    $('#UserRegisterButton').on('click', function(e){
      var email = $('#email').val();
      var password =$('#password').val();
      var passwordConfirm =$('#passwordConfirm').val();
      console.log(email);
      console.log(password);
      console.log(passwordConfirm);
      if(password==passwordConfirm){
        firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then( function(){
          userCreated=true;
          AutorizationPageOpen();
        })
        .catch(function(err){
        console.error(err);
        });
      }
    });
  })
}

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
    if(user){
      $('#Login').hide();
    }
    else{
      $('#Logout').hide();
      $('#Add').hide();
    }
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
  $('.article_image,.article_anotation').on('click', function(e) {
    articleID=this.parentElement.id;
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
    $('.editButton').on('click', function(e) {
      editClick(this.parentElement.id);
    })
    $('.deleteButton').on('click', function(e) {
      firebase.database().ref("article").child(this.parentElement.id).remove()
      .then(function(){
        AuthSuccesfull();
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
    if(user){
      html+='<div class="editButton"><img src=images/icon_edit.png>Редактировать</div>';
      html+='<div class="deleteButton"><img src=images/icon_trash.png>Удалить</div>';
    }
  html += '</div>';
  return html;
}

function editArticleHtml(article){
  var html = '';
    html += '<h2>Изменить статью</h2>';
    html += '<form>';
      html += '<p>Заголовок статьи</p>';
      html += '<textarea id="name">'+article.Name+'</textarea>';
      html += '<p>Анотация к статье</p>';
      html += '<textarea id="anotation">'+article.Anotation+'</textarea>';
      html += '<p>Статья</p>';
      html += '<textarea id="article">'+article.TextOfArticle+'</textarea>';
      html += '<p>Текущее фото к статье</p>';
      html += '<img src="'+article.ImageURL+'">';
      html += '<p>Выберите другое если необходимо</p>';
      html += '<input type="file" id="photo" accept=".jpg, .jpeg, .png">';
    html += '</form>';
    CurrentEditingImgSrc=article.ImageURL;
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

function editClick(articleID){
  $.get('editArticle.html', function(data){
    $(mountPoint).empty().html(data);
    var articleRef = firebase.database().ref('article/' +articleID+'/');
    console.log(articleID);
    articleRef.on('value', function(snapshot) {
      document.querySelector('#content')
      .innerHTML += editArticleHtml(snapshot.val());
    });
    $('#editArticleButton').on('click',function(e){
      editArticleFirebase(articleID);
    });
    $('#Back').on('click', function(e) {
      AuthSuccesfull();
    });
  });
  
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

    case 'LoginButton': {
      var email = $('#email').val();
      var password =$('#password').val();
      firebase.auth().signInWithEmailAndPassword(email, password)
      .then( function(result) {
        user = result.user;
        AuthSuccesfull();
      })
      .catch(function(err){
        $('#PasswordError').show();
        console.error(err);
      });
      break;
    }
    
  }
}

function Auth(provider){
  firebase
      .auth()
      .signInWithPopup(provider)
      .then(function(result) {
        user = result.user;
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
        user=null;
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
    return firebase.database().ref().update(updates).then(function(){
      AuthSuccesfull();
    });
    } else {
      alert('Пожалуйста введите заголовок и статью');
    }
}

function editArticleFirebase(articleID){
  var FileName = $('#photo').val();
  if(FileName!=''){
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
      CurrentEditingImgSrc=url;
    })
    .catch(console.error);
  }
  console.log("OK");
  if( document.querySelector('#name').value != '' || document.querySelector('#article').value != '' ){
    var now = {
      Name: document.querySelector('#name').value,
      TextOfArticle: document.querySelector('#article').value,
      Date: new Date(),
      ImageURL:CurrentEditingImgSrc,
      Anotation: document.querySelector('#anotation').value
    };
    var updates = {};
    updates['/article/' +articleID] = now;
    return firebase.database().ref().update(updates).then(function(){
      AuthSuccesfull();
    });
    } else {
      alert('Пожалуйста введите заголовок и статью');
    }
}