$(document).ready(function () {
  console.log('Jquery works!');

  $('#success').hide();
  $('#failure').hide();

  $('#confirmButton').click(function () {

    $('#success').hide();
    $('#failure').hide();

    if ($('#regex').val() === '') {
        alert('Your regex is empty!');
    } else {
      /*
      Generate table
       */
      let regex = $('#regex').val();
      let string = $('#string').val();

      let nfa = compile(regex);

      $('#nfaTable tr').not(':first').not(':last').remove();
      var html = '';
      $("#nfaTable").find("tr:gt(0)").remove();
      for (var i = 0; i < nfa.transitions.length; i++) {
        html += '<tr><td>' + nfa.transitions[i].state_from +
          '</td><td>' + nfa.transitions[i].trans_symbol + '</td><td>'
           + nfa.transitions[i].state_to + '</td></tr>';
      }
      $('#nfaTable tr').first().after(html);

      console.log(nfa.transitions.length + ' nfatransitionlength');


      $('#thetable tr').first().after(html);


      let result = program(regex, string);

      if (result) {
        $('#success').show();
        $('#successText').text('Your output is : ' + result);
      } else {
        $('#failure').show();
        $('#failureText').text('Your output is : ' + result);
      }


    }
  })
});