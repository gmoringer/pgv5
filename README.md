This project was developed back in 2021. The follwoing workarounds are needed to no have to upgrade to newest dependancies:

1. export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

This gets NVM installed and ready.

2. nvm use 10.24.1 for coding
3. npm run build
4. nvm use 18.16.9
5. firebase deploy --only hosting
