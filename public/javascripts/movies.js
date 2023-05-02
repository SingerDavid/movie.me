document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.querySelector('.add-movie');
    const moviesContainer = document.querySelector('#movies');

    addButton.addEventListener('click', function() {
      const newInput = document.createElement('input');
      newInput.type = 'text';
      newInput.name = 'title';
      moviesContainer.appendChild(newInput);
    });
  });
