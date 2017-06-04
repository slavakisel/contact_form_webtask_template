var request = require('request');

return function (context, callback) {
  console.log('Sending new message to bot... ');

  var url = 'https://api.telegram.org/bot' + context.secrets.TOKEN + '/sendMessage';

  var text = 'New contact request:\n' +
    'From: _' + context.body.name + '_\n' +
    'Contact: _' + context.body.contact + '_\n' +
    'Message: *' + context.body.message + '*';

  var payload = {
    url: url,
    method: 'POST',
    headers: {
      'ContentType': 'application/json;charset=utf-8'
    },
    json: true,
    body: {
      chat_id: context.secrets.CHAT_ID,
      parse_mode: 'Markdown',
      text: text
    }
  };

  request(payload, function (error, res, body) {
    if (error) console.log('ERROR: ', error);
    else console.log('SUCCESS');

    callback(error, body);
  });
}
