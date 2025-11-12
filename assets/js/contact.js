$(function(){
  let selectedPlan = null;
  $('.subscribe-btn').on('click', function(){
    selectedPlan = $(this).data('plan');
    $('.subscribe-btn').removeClass('btn-primary').addClass('btn-outline-primary');
    $(this).removeClass('btn-outline-primary').addClass('btn-primary');
  });

  $('#contactForm').on('submit', function(e){
    e.preventDefault();
    const name = $('#name').val().trim();
    const email = $('#email').val().trim();
    const message = $('#message').val().trim();

    // Basic validation
    let ok = true;
    if(!/^[a-zA-Z\s]{3,}$/.test(name)){ $('#name').addClass('is-invalid'); ok=false; } else { $('#name').removeClass('is-invalid'); }
    if(!/^\S+@\S+\.\S+$/.test(email)){ $('#email').addClass('is-invalid'); ok=false; } else { $('#email').removeClass('is-invalid'); }
    if(message.length < 10){ $('#message').addClass('is-invalid'); ok=false; } else { $('#message').removeClass('is-invalid'); }

    if(!ok) return;

    const txt = `Thanks, ${name}!${selectedPlan ? ' You chose the ' + selectedPlan + ' plan.' : ''} We will email ${email} soon.`;
    $('#modalMsg').text(txt);
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
    this.reset();
    $('.subscribe-btn').removeClass('btn-primary').addClass('btn-outline-primary');
    selectedPlan = null;
  });
});
