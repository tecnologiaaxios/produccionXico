const db = firebase.database();
const auth = firebase.auth();


function login() {
  let email = $('#email').val();
  let contraseña = $('#contraseña').val();

  auth.signInWithEmailAndPassword(email, contraseña)
  .then(function() { //en caso de exito

  })
  .catch(function(error) { //en caso de error

  });
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
