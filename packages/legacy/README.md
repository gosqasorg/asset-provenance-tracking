# GOSQAS GDT Legacy Web Application

The original (aka "legacy") version of GOSQAS GDT is a web based application using the 
[Fastify](https://fastify.dev/) web framework, 
[Sequelize](https://sequelize.org/) ORM library and supporting 
[SQLite](https://www.sqlite.org/) (for local development) and 
[PostgreSQL](https://www.postgresql.org/) (for cloud deployment). 
It is hosted on Heroku.

## Deployment

GOSQAS GDT uses Git deployment to Heroku. 
[Full details](https://devcenter.heroku.com/articles/git) are on the Heroku dev center.
TL;DR version:

1. [Install Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli)
2. Create a [Heroku remote](https://devcenter.heroku.com/articles/git#create-a-heroku-remote) in your local clone of the GDT repo
3. Push the main branch to the Heroku remote: `git push heroku main`

Note, only people with [collaborator access](https://devcenter.heroku.com/categories/collaboration) to the Heroku GOSQAS GDT app 
have permission to push a branch to Heroku.  