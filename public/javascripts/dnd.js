(function() {
  var drop = document.querySelector( ".dnd" ),
      select = document.querySelector( ".select" ),
      uploaded = document.querySelector( ".uploaded" ),
      slugInput = document.querySelector( ".slug" );

  drop.addEventListener( "dragover", function( event ) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });

  var fileHandler = function( event ) {
    event.stopPropagation();
    event.preventDefault();

    var files = [];
    for ( var i = 0; i < event.dataTransfer.files.length; i++ ) {
      files.push( event.dataTransfer.files[ i ]);
    }

    files.forEach(function( f ) {
      $.ajax({
        type: "PUT",
        url: "/upload",
        enctype: 'multipart/form-data',
        data: {
          image: f,
          slug: encodeURIComponent(slugInput.value)
        }
      })
      .done( function( data, status, xhr ) {
        console.log( data, status, xhr );
        console.log( "Done uploading %s", f.name );
        var li = document.createElement( "li" );
        li.innerHTML = "<a href='" + url + "'>" + url + "</a>";
        uploaded.appendChild(li);
      })
      .fail( function( xhr, status, err ) {
        console.log( xhr, status, err );
      });
    });

  };

  drop.addEventListener( "drop", fileHandler );
  //select.addEventListener( "change", fileHandler );
}());
