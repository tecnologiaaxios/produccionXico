"use strict";

var config = {
  apiKey: "AIzaSyA19j6-VLNcXLJfBkfd_lZfFFbzg6z0Imc",
  authDomain: "xico-netcontrol.firebaseapp.com",
  databaseURL: "https://xico-netcontrol.firebaseio.com",
  projectId: "xico-netcontrol",
  storageBucket: "xico-netcontrol.appspot.com",
  messagingSenderId: "248615705793"
};
firebase.initializeApp(config);

var db = firebase.database();
var auth = firebase.auth();

$('#username').keyup(function () {
  var username = $('#username').val();
  if (username.length < 1) {
    $('#username').parent().addClass('has-error');
    $('#helpblockUserName').html("Campo obligatorio").show();
  } else {
    $('#username').parent().removeClass('has-error');
    $('#helpblockUserName').hide();
  }
});

$('#contraseña').keyup(function () {
  var contraseña = $('#contraseña').val();
  if (contraseña.length < 1) {
    $('#contraseña').parent().addClass('has-error');
    $('#helpblockContraseña').html("Campo obligatorio").show();
  } else {
    $('#contraseña').parent().removeClass('has-error');
    $('#helpblockContraseña').hide();
  }
});

$('#username').keypress(function (e) {
  if (e.which == 13) {
    login();
  }
});

$('#contraseña').keypress(function (e) {
  if (e.which == 13) {
    login();
  }
});

function login() {
  var username = $('#username').val();
  var contraseña = $('#contraseña').val();

  if (username.length > 0 && contraseña.length > 0) {

    var usuarios = db.ref('usuarios/planta/produccion/');
    usuarios.orderByChild("username").equalTo(username).on("child_added", function (snapshot) {
      var email = snapshot.val().email;

      if (email != null) {
        auth.signInWithEmailAndPassword(email, contraseña).then(function () {
          //en caso de exito
          obtenerUsuario();
        }).catch(function (error) {
          //en caso de error
          if (error.code === 'auth/wrong-password') {
            //imprime un error si te equivocaste en la contraseña
            $('#contrasena').parent().addClass('has-error');
            $('#helpblockContraseña').html("La contraseña es incorrecta").show();
          }
        });
      } else {
        $('#username').parent().addClass('has-error');
        $('#helpblockUserName').html("El nombre de usuario es incorrecto").show();
      }
    });
  } else {
    if (username == "") {
      $('#username').parent().addClass('has-error');
      $('#helpblockUserName').html("Campo obligatorio").show();
    } else {
      $('#username').parent().removeClass('has-error');
      $('#helpblockUserName').hide();
    }
    if (contraseña == "") {
      $('#contraseña').parent().addClass('has-error');
      $('#helpblockContraseña').html("Campo obligatorio").show();
    } else {
      $('#contraseña').parent().removeClass('has-error');
      $('#helpblockContraseña').hide();
    }
  }
}

function obtenerUsuario() {
  auth.onAuthStateChanged(function (user) {
    if (user) {
      $(location).attr("href", "panel.html");
    }
  });
}

obtenerUsuario();

/*function validarEmail(valor) {
  if(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(valor)) {
    $('#email').parent().removeClass('has-error');
    $('#helpblockEmail').hide();

    return true;
  }
  else {
    $('#email').parent().addClass('has-error');
    $('#helpblockEmail').html("Correo no válido").show();

    return false;
  }
}*/

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
});