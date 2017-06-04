var request = require('request');

/**
* Leaves one comment to each new pull request with a random string of GitHub zen.
* Comment API reference: https://developer.github.com/v3/issues/comments/#get-a-single-comment
*
* INSTALLATION
* Add a webtask url as webhook to your GitHub repository with application/json content type:
*
* NEED
* GITHUB_TOKEN - github user token on behalf of which comments will be posted
* GITHUB_NAME - name of the user above
*/
return function (context, callback) {
  if (!context.data.pull_request || context.data.action != 'opened') {
    return callback();
  }

  console.log('Posting zen wisdom to pull request ' + context.data.pull_request.url);

  function headers() {
    if (!this.headersContent) {
      this.headersContent = {
        'Authorization': 'token '  + context.secrets.GITHUB_TOKEN,
        'Accept': 'application/vnd.github.black-cat-preview+json',
        'User-Agent': context.secrets.GITHUB_NAME
      }
    }

    return this.headersContent;
  };

  function postComment(wisdom) {
    var payload = {
      url: context.data.pull_request._links.comments.href,
      method: 'POST',
      body: {
        body: wisdom
      },
      json: true,
      headers: headers()
    }

    request(payload, function (error, res, body) {
      if(error) console.log('ERROR: ', error);
      else console.log('SUCCESS');

      callback(error, body);
    });
  };

  var zenPayload = {
    url: 'https://api.github.com/zen',
    method: 'GET',
    headers: headers()
  };

  request(zenPayload, function (error, res, body) {
    if (error) {
      callback(error, body);
    } else {
      postComment(body);
    }
  });
}
