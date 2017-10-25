
function startPicker() {
  var fsClient = filestack.init('A0b1GBdwgSyv6Pop9ZFNQz');
  function openPicker() {
    fsClient.pick({
      fromSources:["local_file_system","url","imagesearch","facebook","instagram","googledrive","dropbox","evernote"],
      maxFiles:999
    }).then(function(response) {
      // declare this function to handle response
      handleFilestack(response);
    });
  }
  openPicker();
}

    var s=document.createElement('script');
    s.setAttribute('src','https://static.filestackapi.com/v3/filestack.js');
    s.onload=function(){startPicker()};
    document.body.appendChild(s);
