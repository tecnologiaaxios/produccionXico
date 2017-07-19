const db = firebase.database();
const auth = firebase.auth();

$('#email').keyup(function () {
  let email = $('#email').val();
  console.log("Email");
  if(email.length < 1) {
    $('#email').parent().addClass('has-error');
    $('#helpblockEmail').html("Campo obligatorio").show();
  }
  else {
    $('#email').parent().removeClass('has-error');
    $('#helpblockEmail').hide();
  }
});

$('#contraseña').keyup(function () {
  let contraseña = $('#contraseña').val();
  if(contraseña.length < 1) {
    $('#contraseña').parent().addClass('has-error');
    $('#helpblockContraseña').html("Campo obligatorio").show();
  }
  else {
    $('#contraseña').parent().removeClass('has-error');
    $('#helpblockContraseña').hide();
  }
});

function login() {
  let email = $('#email').val();
  let contraseña = $('#contraseña').val();

  if(email.length > 0 && contraseña > 0) {
    if(validarEmail(email)) {
      auth.signInWithEmailAndPassword(email, contraseña)
      .then(function() { //en caso de exito

      })
      .catch(function(error) { //en caso de error
        if(error.code === 'auth/user-not-found') { //imprime un error si tu usuario es equivocado
            $('#email').parent().addClass('has-error');
            $('#helpblockEmail').empty().html("El usuario es incorrecto").show();
          }
          if(error.code === 'auth/wrong-password') { //imprime un error si te equivocaste en la contraseña
            $('#contrasena').parent().addClass('has-error');
            $('#helpblockContraseña').empty().html("La contraseña es incorrecta").show();
          }
      });
    }
  }
  else {
      if(email == "") {
        $('#email').parent().addClass('has-error');
        $('#helpblockEmail').html("Campo obligatorio").show();
      }
      else {
        $('#email').parent().removeClass('has-error');
        $('#helpblockEmail').hide();
      }
      if(contraseña == "") {
        $('#contraseña').parent().addClass('has-error');
        $('#helpblockContraseña').html("Campo obligatorio").show();
      }
      else {
        $('#contraseña').parent().removeClass('has-error');
        $('#helpblockContraseña').hide();
      }
    }
}

function obtenerUsuario() {
  auth.onAuthStateChanged(function (user) {
    if (user) {
      var user = auth.currentUser;
      var uid = user.uid;

      db.ref('usuarios/' + uid).on('value', function(snap) {
        let usuario = snap.val();
        var privilegio = usuario.puesto;

        if(privilegio == 'Administrador') {
          $(location).attr("href", "admin.html");
        }
        if(privilegio == 'Usuario') {
          $(location).attr("href", "usuario.html");
        }
      });
    }
    else {
      $('#body').attr('style', 'background-color: #E2ECFB;');
      $('#head-blog').show();
      $('#p').show();
    }
  });
}

function validarEmail(valor) {
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
}
