const { Octokit } = require ("@octokit/rest");
const { argv } = require('process');

const repoUrl = argv[2];
if(repoUrl === undefined)
  console.log("you must enter a github repository")

const strArr = repoUrl.split("/");
const owner = strArr[3]
const repo = strArr[4].substring(0, strArr[4].length -4);
const ownerAndrepo = {
  owner: owner,
  repo : repo
}

const octokit = new Octokit();
const latestRelease = octokit.repos.getLatestRelease(ownerAndrepo)
// const profileMetrics = octokit.rest.repos.getCommunityProfileMetrics(ownerAndrepo)
const contributors = octokit.rest.repos.listContributors(ownerAndrepo)

const languages = octokit.rest.repos.listLanguages(ownerAndrepo)

languages.then(langs => {console.log(`The languages used are: ${JSON.stringify(langs.data)}`);
                            // langs.data.array.forEach(element => {
                              // console.log(element)
                            })
.catch( (e) => console.log(e))

contributors.then(metrics => console.log(`Number of contributors: ${metrics.data.length}`))
.catch( () => console.log("There was a problem retrieving the date"));

latestRelease.then(lr => {console.log('\x1b[36m%s\x1b[0m', `Last commit: ${lr.data.created_at.slice(0,10)}`)})
.catch( () => console.log("There was a problem retrieving the date"));

console.clear()