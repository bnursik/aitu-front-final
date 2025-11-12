$(function(){
  // Slide details for sample cards
  $('.toggle-details').on('click', function(){
    $(this).closest('.card').find('.playlist-details').slideToggle(200);
  });

  // Render favorites grid
  const favs = getFavorites();
  const grid = $('#favContainer');
  if(favs.length === 0){
    grid.append('<div class="col-12"><div class="alert alert-secondary mb-0">No favorites yet. Go to Browse and click “♥ Favorite”.</div></div>');
  } else {
    favs.forEach(f => {
      grid.append(`
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card h-100">
            ${f.img ? `<img class="card-img-top" src="${f.img}" alt="">` : ""}
            <div class="card-body d-flex flex-column">
              <h6 class="mb-2">${escapeHtml(f.title)}</h6>
              <div class="mt-auto d-flex gap-2">
                <a class="btn btn-primary btn-sm" target="_blank" href="${f.url}">Open</a>
                <button class="btn btn-outline-danger btn-sm rm-fav" data-id="${f.id}">Remove</button>
              </div>
            </div>
          </div>
        </div>`);
    });
  }

  $(document).on('click', '.rm-fav', function(){
    const id = $(this).data('id');
    removeFavorite(id);
    $(this).closest('.col-12, .col-sm-6, .col-lg-4').fadeOut(150, function(){ $(this).remove(); });
  });

  function escapeHtml(s){ return (s||"").replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
});
