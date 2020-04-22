var mountPoint = '#root';
var LogoutButton;


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
var dbRef = firebase.database();
var contactsRef = dbRef.ref('uid');



$(document).ready(function () {
  //Social and Anonymous Auth Scheme Login
  $('#GoogleButton,#GithubButton').on('click', function(e) {
    login($(this).attr('id'));
  })
});

function AuthSuccesfull(){
  hashValue='listOfArticles';
  $.get(hashValue+'.html', function(data){
    $(mountPoint).empty().html(data);
    var LogoutButton = document.getElementById("Logout");
    LogoutButton.onclick = Logout;
    var AddButton = document.getElementById("Add");
    AddButton.onclick=AddClick;
    //load older conatcts as well as any newly added one...
    var starCountRef = firebase.database().ref('uid/');
    starCountRef.on('value', function(snapshot) {
      document.querySelector('#content')
      .innerHTML += contactHtmlFromObject(snapshot.val());
    });


  })
}

function contactHtmlFromObject(article){
  console.log( article );
  var html = '';
  html += '<div>';
    html += '<p class="lead">'+article.NameArticle+'</p>';
    html += '<img src="'+article.ImageURL+'">'
  html += '</div>';
  return html;
}

function AddClick(){
  $.get('addArticle.html', function(data){
    $(mountPoint).empty().html(data);
    var LoadPhotoButton = document.getElementById("button2");
    LoadPhotoButton.onclick=LoadFile;
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
      request = auth.signInAnonymously();
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
    })
  .catch(console.error);
}
