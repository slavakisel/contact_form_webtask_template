'use latest';

const request = require('request');
import sendgrid from 'sendgrid@4.7.0';

let CAPTCHA_SECRET;

function verifyCaptcha(token, cb) {
  const payload = {
    url: 'https://www.google.com/recaptcha/api/siteverify?secret=' + CAPTCHA_SECRET + '&response=' + token
  };

  request(payload, function(error, res, body) {
    if (error) {
      console.log(error);
      cb(false);
    } else {
       cb(JSON.parse(body).success);
    }
  });
}

function sendMessageToEmail(ctx, cb) {
  const helper = sendgrid.mail;
  const text = 'Новый запрос на консультацию:<br />' +
        'От: <i>' + ctx.body['consult[name]'] + '</i><br />' +
        'Данные для связи: <i>' + ctx.body['consult[contact]'] + '</i><br />' +
        'Сообщение: <b>' + ctx.body['consult[message]'] + '</b>';

  const subject = 'Новый запрос на консультацию';
  const email = ctx.secrets.EMAIL;

  const mail = new helper.Mail(
        new helper.Email(email),
        subject,
        new helper.Email(email),
        new helper.Content('text/html', text)
      );
      const sg = sendgrid(ctx.secrets.SENDGRID_API_KEY);
      const request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
      });
      sg.API(request)
        .then(response => cb(null, response))
        .catch(cb);
}

function sendMessageToTelegram(ctx) {
  const CHAT_ID = ctx.secrets.CHAT_ID;
  const url = "https://api.telegram.org/bot" + ctx.secrets.TOKEN + "/sendMessage";
  const text = 'Новый запрос на консультацию:\n' +
        'От: _' + ctx.body['consult[name]'] + '_\n' +
        'Данные для связи: _' + ctx.body['consult[contact]'] + '_\n' +
        'Сообщение: *' + ctx.body['consult[message]'] + '*';

  const payload = {
    url: url,
    method: 'POST',
    headers: {
      'ContentType': "application/json;charset=utf-8"
    },
    json: true,
    body: {
      chat_id: CHAT_ID,
      parse_mode: 'Markdown',
      text: text
    }
  };

  request(payload);
}

/**
* Sends consult request info to Masha's telegram
*/
return function (ctx, callback) {
  console.log('Sending message to email... ');

  const captchaTok = ctx.body['g-recaptcha-response'];

  CAPTCHA_SECRET = ctx.secrets.CAPTCHA_SECRET;

  verifyCaptcha(captchaTok, function(valid) {
    if (valid) {
      sendMessageToEmail(ctx, callback);
      sendMessageToTelegram(ctx);
    } else {
      callback('Invalid captcha');
    }
  });
}
