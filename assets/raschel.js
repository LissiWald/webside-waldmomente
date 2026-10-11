
const player=document.querySelector('audio');player.addEventListener('error',()=>{document.getElementById('audio-status').textContent='Die Hörprobe konnte nicht geladen werden. Bitte versuche es noch einmal.'});


(()=>{const links=[...document.querySelectorAll('.image-open')],dialog=document.querySelector('.image-view'),img=dialog.querySelector('.view-image');function show(i){const original=links[i].querySelector('img');img.src=links[i].href;img.alt=original.alt}links.forEach((a,i)=>a.addEventListener('click',e=>{if(typeof dialog.showModal!=='function')return;e.preventDefault();show(i);dialog.showModal()}));dialog.querySelector('.view-close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});})();