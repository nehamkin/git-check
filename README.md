# git-check - Orri Nehamkin

After following the set-up of this project, you will have a terminal command call git-check.
git-check gets a repositories url and returns a shallow saftey analysis of the repository.

![git-check example](https://user-images.githubusercontent.com/73988005/146244092-18110fa7-af5c-4fee-84b6-7cac119af6a0.PNG)

![git-check good example](https://user-images.githubusercontent.com/73988005/146244405-863c04df-6c5e-4bc0-8b7d-849424719145.PNG)


# Set up
1. clone the repointo desired location
2. enter repo's folder
3. run npm install && npm link
 Happy coding
 
# Details
The project uses githubs api and also a site-scraper to extract relevant attributes about the repository.
The information that we are interested in is: 
1. Maintenance of the repo - time since last commit. if the last commit was more than 6 months ago a flag is raised that the repo may not be maintained
2. How many users use the repo - if there are less than 10,000 users a flag is raised that the repo does not have many users
3. How many contributors to the repo - if there are less than 5 contributors we raise that the repo does not have many contributors
4. Which languages are in the repo - Low level languages like C and Assembly are known languages for hacking, there for a flag is raised if the repo contains these languages
5. Overall Health Percentage - github gives health percentage grades to repo's, if the repo scored under an 80 a flag is raised
* It is not possible to get all attributes for each repo, therefor there is a counter for unachievable attributes. If more than 1 attribute is unreachable a flag is raised

# Overall process
1. Searched different languages to find the most relevant language to create project
2. Chose javascript and got familiar with the language
3. Searched for ways to get relevant attributes about a github repository
4. Found a octokit a github api, and puppeteer a website scraper to get attributes
5. Installed relavent packages and modules
6. Wrote logic behind project
7. Learned how to link between a javascript file and a bash command

