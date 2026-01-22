// index.js — for user dashboard
document.addEventListener('DOMContentLoaded', () => {
  fetch('https://research-archived.onrender.com/api/user/capstones')
    .then(res => res.json())
    .then(data => {
      const fileList = document.getElementById('fileList');
      data.forEach(file => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<a href="${file.downloadUrl}">${file.name}</a>`;
        fileList.appendChild(listItem);
      });
    })
    .catch(err => console.error('Error fetching capstones:', err));
});