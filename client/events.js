function logEvent(eventType, value) {
  const now = new Date().toISOString();
  fetch('/api/logEvent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify({ eventType, value, timestamp: now })
  }).then(() => fetchData());
}

// Example usage (to be tied to buttons)
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    const id = button.getAttribute('onclick').match(/log(\w+)/)?.[1];
    if (id) logEvent(id.toLowerCase(), document.getElementById(id.toLowerCase())?.value || '');
  });
});