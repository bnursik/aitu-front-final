const API_BASE = "https://aitu-front-final-production.up.railway.app";

// Footer year
$(function () {
  $("#year").text(new Date().getFullYear());
});

// Local Storage helpers
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem("wp_favs") || "[]");
  } catch (e) {
    return [];
  }
}
function saveFavorite(item) {
  const favs = getFavorites();
  if (!favs.find((f) => f.id === item.id)) {
    favs.push(item);
    localStorage.setItem("wp_favs", JSON.stringify(favs));
  }
}
function removeFavorite(id) {
  const favs = getFavorites().filter((f) => f.id !== id);
  localStorage.setItem("wp_favs", JSON.stringify(favs));
}
