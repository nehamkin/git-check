const { Octokit } = require("@octokit/rest");
const { argv } = require("process");
const puppeteer = require("puppeteer");
const red = "\x1b[31m%s\x1b[0m";
const green = "\x1b[32m%s\x1b[0m";
// helper functions------------------------------------------------------------------------------------------------------------------
const scrapeUsers = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const [el] = await page.$x(
    '//*[@id="repo-content-pjax-container"]/div/div[2]/div[2]/div/div[4]/div/a/span'
  );
  if (el === undefined) {
    browser.close();
    return -1;
  }
  const txt = el.getProperty("textContent");
  const rawTxt = (await txt).jsonValue();
  const numberOfUsers = rawTxt.then((str) => str.replace(/\D/g, ""));
  browser.close();
  return numberOfUsers;
};

const timeDifferenceInDays = (strDate) => {
  const commitDate = new Date(strDate);
  const today = new Date();
  const diff = today.getTime() - commitDate.getTime();
  const diffInDays = diff / (1000 * 60 * 60 * 24);
  return Math.round(diffInDays);
};
//------------------------------------------------------------------------------------------------------------------------------------

const repoUrl = argv[2];
if (repoUrl === undefined) console.log("you must enter a github repository");

const strArr = repoUrl.split("/");
const owner = strArr[3];
const repo = strArr[4].substring(0, strArr[4].length - 4);
const ownerAndrepo = {
  owner: owner,
  repo: repo,
};

var maintained, manyUsers, healthy, manyContributors, langLowLevel;
var partialInformation = 0;

const octokit = new Octokit();
const latestRelease = () => octokit.repos.getLatestRelease(ownerAndrepo);
const profileMetrics = () =>
  octokit.rest.repos.getCommunityProfileMetrics(ownerAndrepo);
const contributors = () => octokit.rest.repos.listContributors(ownerAndrepo);
const languages = () => octokit.rest.repos.listLanguages(ownerAndrepo);
const numberOfUsers = () => scrapeUsers(repoUrl);

/**
 * Commit Date
 */
async function printCommits() {
  try {
    var lr = await latestRelease();
    const diff = timeDifferenceInDays(lr.data.created_at.slice(0, 10));
    if (diff > 180) {
      console.log(red, `Last commit was: ${diff} days ago`);
      maintained = false;
    } else {
      console.log(green, `Last commit was: ${diff} days ago`);
      maintained = true;
    }
  } catch {
    console.log(red, "Could not get information of last commit");
    maintained = true;
    partialInformation++;
  }
}

/**
 * Github Health Percentage
 */
async function printMetrics() {
  try {
    var metrics = await profileMetrics();
    const health = metrics.data.health_percentage;
    if (health < 80) {
      console.log(red, `Health Percentage: ${health}`);
      healthy = false;
    } else {
      console.log(green, `Health Percentage: ${health}`);
      healthy = true;
    }
  } catch {
    console.log(
      red,
      "There was a problem retrieving the health percentage through github"
    );
    healthy = true;
    partialInformation++;
  }
}

// /**
//  * Number of Contributors
//  */
async function printContributors() {
  try {
    var cont = await contributors();
    const numOfContributors = cont.data.length;
    if (numOfContributors < 5) {
      console.log(red, `Number of Contributors: ${numOfContributors}`);
      manyContributors = false;
    } else {
      console.log(green, `Number of Contributors: ${numOfContributors}`);
      manyContributors = true;
    }
  } catch {
    console.log(
      red,
      "There was a problem retrieving the number of contributors through github"
    );
    manyContributors = true;
    partialInformation++;
  }
}

// /**
//  * Number of Contributors
//  */
async function printNumberOfUsers() {
  try {
    var numUsers = await numberOfUsers();
    if (numUsers == -1) {
      console.log(
        red,
        "There was a problem retrieving the number of users through github"
      );
      partialInformation++;
      manyUsers = true;
      return;
    }

    if (numUsers < 10000) {
      console.log(red, `Number of Users: ${numUsers}`);
      manyUsers = false;
    } else {
      console.log(green, `Number of Users: ${numUsers}`);
      manyUsers = true;
    }
  } catch {
    console.log(
      "There was a problem retrieving the number of Users through github"
    );
    manyUsers = true;
    partialInformation++;
  }
}
// /**
//  * Languages Used
//  */
async function printLanguagesUsed() {
  try {
    var langs = await languages();
    const keys = Object.keys(langs.data);
    var combinedLangs = "";
    langLowLevel = true;
    keys.forEach((l) => {
      if (l == "Assembly" || l == "C") langLowLevel = false;
      combinedLangs = l + ", " + combinedLangs;
    });
    combinedLangs = combinedLangs.slice(0, combinedLangs.length - 2);
    if (!langLowLevel) console.log(red, `Languages Used: ${combinedLangs}`);
    else {
      console.log(green, `Languages Used: ${combinedLangs}`);
      langLowLevel = true;
    }
  } catch {
    console.log(e);
    console.log(
      red,
      "There was a problem retrieving the languages used through github"
    );
    langLowLevel = true;
    partialInformation++;
  }
}

async function summary() {
  await printCommits();
  await printMetrics();
  await printLanguagesUsed();
  await printContributors();
  await printNumberOfUsers();
  if (
    partialInformation < 2 &&
    maintained &&
    langLowLevel &&
    manyUsers &&
    healthy
  )
    console.log(green, "\nThe repo seems to be safe to clone");
  else
    console.log(
      red,
      `    ---------Summary----------\n${
        partialInformation <= 1
          ? ""
          : `Could not get ${partialInformation} attributes\n`
      }${maintained ? "" : "The repo may not be maintained\n"}${
        langLowLevel
          ? ""
          : "The repo uses low-level languages that may try to hack your system\n"
      }${manyUsers ? "" : "The repo does not have many users\n"}${
        healthy ? "" : "The repo did not get a good health score from github\n"
      }Continue With Caution!`
    );
}

// summary();

exports.gitcheckpublic = summary;

// console.clear()
