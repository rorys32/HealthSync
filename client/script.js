document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('token')) {
    console.log('No token, redirect to login');
  }

  document.getElementById('weight').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') logWeight();
  });
});