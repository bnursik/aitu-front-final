// Frontend globals
const API_BASE = "http://localhost:8080"; // change to your deployed proxy URL for production

// Footer year
$(function(){ $('#year').text(new Date().getFullYear()); });

// Local Storage helpers
function getFavorites(){
  try { return JSON.parse(localStorage.getItem("wp_favs") || "[]"); } catch(e){ return []; }
}
function saveFavorite(item){
  const favs = getFavorites();
  if(!favs.find(f => f.id === item.id)) {
    favs.push(item);
    localStorage.setItem("wp_favs", JSON.stringify(favs));
  }
}
function removeFavorite(id){
  const favs = getFavorites().filter(f => f.id !== id);
  localStorage.setItem("wp_favs", JSON.stringify(favs));
}
