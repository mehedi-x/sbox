document.getElementById('auth-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log('Login attempt:', { email, password });

  // TODO: Add backend API integration here
});

document.getElementById('switch-to-signup').addEventListener('click', function () {
  alert('Sign-Up feature coming soon!');
});
