function toggleFormLoad() {
  const form = document.querySelector('form');
  const loader = document.querySelector('#loader');
  loader.style.display = 'block';
  form.submit();
}