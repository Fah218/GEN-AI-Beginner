document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyze-btn');
  const statusMessage = document.getElementById('status-message');

  analyzeBtn.addEventListener('click', () => {
    statusMessage.textContent = 'LinkedIn post analysis will be available soon.';
    statusMessage.style.display = 'block';
  });
});
