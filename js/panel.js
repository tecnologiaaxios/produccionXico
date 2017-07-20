const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {

    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();
