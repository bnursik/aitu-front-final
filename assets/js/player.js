$(function(){
  const tracks = [
    {title:'Sunrise Drive – Nova', src:'assets/img/sample1.mp3', lyrics:'Wake up to the city lights...'},
    {title:'Late Night Code – Byte', src:'assets/img/sample2.mp3', lyrics:'Lines of code and coffee cups...'},
    {title:'Blue Sky – Aura', src:'assets/img/sample3.mp3', lyrics:'Hold on to the blue blue sky...'}
  ];

  const audio = $('#player')[0];
  let i = 0;

  function load(idx){
    const t = tracks[idx];
    $('#trackTitle').text(t.title);
    $('#lyricsBox').text(t.lyrics);
    $('#queueList').empty();
    tracks.forEach((tr, j)=>{
      const li = $('<li>').text(tr.title);
      if(j === idx) li.addClass('fw-bold');
      $('#queueList').append(li);
    });
    audio.src = t.src;
  }

  $('#playBtn').on('click', function(){
    if(audio.paused){ audio.play(); $(this).text('Pause'); }
    else { audio.pause(); $(this).text('Play'); }
  });

  $('#prevBtn').on('click', function(){ i = (i-1+tracks.length)%tracks.length; load(i); audio.play(); $('#playBtn').text('Pause'); });
  $('#nextBtn').on('click', function(){ i = (i+1)%tracks.length; load(i); audio.play(); $('#playBtn').text('Pause'); });

  $('#volume').on('input', function(){ audio.volume = $(this).val(); });

  load(i);
});
