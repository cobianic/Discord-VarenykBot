### Push code to Repl.it

> npm install

> npm run deploy

> chmod +x kickstartReplit.sh

> ./kickstartReplit.sh

### Push code to Heroku

> heroku login

> git push heroku master

### If heroku decides to ignore Procfile, you should manually change `web` process to `worker`. `web` is for  apps which need port, `worker` for apps which don`t need it.

> heroku ps:scale web=0
>
> heroku ps:scale worker=1

### cherry-pick a commit from SudhanPlayz git repository

> git remote add other https://github.com/SudhanPlayz/Discord-MusicBot.git

> git fetch other

> git cherry-pick sha1_of_needed_commit

> git remote remove other
