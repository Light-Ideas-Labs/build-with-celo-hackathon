FROM node:16
ENV NODE_ENV=production
ENV VAR1=value1
WORKDIR /usr/src/app
RUN yarn global add nodemon
# install dependencies
COPY ["package.json", "yarn.lock.json*", "./"]
RUN yarn --production --silent && mv node_modules ../
# copy in the source code
COPY . .
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["yarn", "start"]
