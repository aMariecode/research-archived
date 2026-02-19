// index.js — for user dashboard
document.addEventListener('DOMContentLoaded', () => {
  fetch('https://research-archived.onrender.com/api/user/capstones')
    .then(res => res.json())
    .then(data => {
      const fileList = document.getElementById('fileList');
      data.forEach(file => {
        const listItem = document.createElement('li');
        // Show preview image if available
        let imgHtml = '';
        if (file.previewImage && file.previewImage.url) {
          imgHtml = `<img src="${file.previewImage.url}" alt="Preview" style="max-width:100px;max-height:100px;display:block;margin-bottom:4px;" />`;
        }
        listItem.innerHTML = `
          ${imgHtml}
          <a href="${file.downloadUrl}">${file.name}</a>
        `;
        fileList.appendChild(listItem);
      });
    })
    .catch(err => console.error('Error fetching capstones:', err));
});