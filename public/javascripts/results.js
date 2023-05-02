function addToWatchList(event, title, year, genre, description, watchLocations) {
  event.preventDefault();
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/results/addToWatch');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    if (xhr.status === 200) {
      const addButton = event.target;
      addButton.innerText = 'Remove from Watch List';
      addButton.classList.remove('btn-primary');
      addButton.classList.remove('add-favorite-button');
      addButton.classList.add('btn-danger');
      addButton.onclick = function(event) {
        removeFromWatchList(event, title);
      };
    } else {
      console.log('Error adding to watch list');
    }
  };
  xhr.send(JSON.stringify({
    title: title,
    year: year,
    genre: genre,
    description: description,
    watchLocations: watchLocations
  }));
}



