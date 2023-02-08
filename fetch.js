var wayback = require('wayback-machine');
var { CheerioCrawler, Dataset, Actor } = require('crawlee');
var fs = require('fs');
var process = require('process');

(async () => {

      const myArgs = process.argv.slice(2);
      for (const tool of myArgs)  {

            let url = `https://stackshare.io/${tool}`;
            const dataset = await Dataset.open(tool);

            const crawler = new CheerioCrawler({
                  async requestHandler({ request, response, body, contentType, $ }) {

                        // Do some data extraction from the page with Cheerio.
                        let data = {
                              votes: $("label:contains('Votes')").next().html(),
                              followers: $("label:contains('Followers')").next().html(),
                              stacks: $("label:contains('Stacks')").next().html(),
                              image: $(".css-1m5j888").attr("src"),
                              name: $(".css-1cylxxa").text(),
                              description: $(".css-ey1s1s").text(),
                              url: request.url,
                              time: request.userData.time
                        }

                        if (data.votes || data.followers || data.stacks) {
                              // Save the data to dataset.
                              await dataset.pushData({
                                    url: request.url,
                                    ...data,
                                    tool: tool
                              })
                        }
                  },
            });

            // Next function wraps the above API call into a Promise
            // and handles the callbacks with resolve and reject.
            // https://stackoverflow.com/questions/5010288/how-to-make-a-function-wait-until-a-callback-has-been-called-using-node-js
            function getTimeline(query) {
                  return new Promise((resolve, reject) => {
                        wayback.getTimeline(query, (errorResponse, successResponse) => {
                              if (errorResponse) {
                                    reject(errorResponse);
                              } else {
                                    resolve(successResponse);
                              }
                        });
                  });
            }

            timeline = await getTimeline(url);
            urls = [
                  ...timeline.mementos.map(({ url, time }) => ({ url: url, userData: { time: time } })),
                  { url: url, userData: { time: (new Date()).toISOString() } }
            ]
            await crawler.run(urls);
            let data = await dataset.getData();
            let items = data.items.sort((a, b) => (a.time > b.time) ? 1 : -1);

            fs.writeFile(`tools/${tool}.json`, JSON.stringify(items), (error) => {
                  if (error) {
                        throw error;
                  }
            });

            await dataset.drop();
      }
})();
